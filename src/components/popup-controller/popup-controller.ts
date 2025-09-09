import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, queryAssignedElements } from 'lit/decorators.js'

type TDirection = 'top'
    | 'bottom'
    | 'left'
    | 'right'

export type TPlacement =   | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end'

export type TPopupControllerAnimationConfig = {
    keyframes: Array<Keyframe>
    options: KeyframeAnimationOptions
}
export type TPopupControllerAnimation = TPopupControllerAnimationConfig | ((placement: TPlacement) => TPopupControllerAnimationConfig)

export type TPopupControllerCustomAnimations = {
    open?: TPopupControllerAnimation
    close?: TPopupControllerAnimation
}

@customElement('mdc-popup-controller')
export class MDCPopupController extends LitElement {

    @property({ type: Boolean, reflect: true })
    public open = false

    /**
     * Control whether the animation is enabled or not.
     */
    @property({ type: Boolean, reflect: true })
    public quick: boolean = false

    @property({ type: String, reflect: true })
    public placement: TPlacement = 'bottom-start'

    @property({ type: Boolean, attribute: 'disable-flip', reflect: true })
    public disableFlip: boolean = false

    @property({ type: Object, attribute: 'custom-animations' })
    public customAnimations?: TPopupControllerCustomAnimations

    private cleanup?: () => void

    public constructor() {
        super()
    }

    private getDirectionFromPlacement(placement: TPlacement): TDirection {
        return placement.split('-')[0] as TDirection
    }

    private readonly getDefaultAnimation = (mode: 'open' | 'close', placement: TPlacement): TPopupControllerAnimationConfig => {
        const direction = this.getDirectionFromPlacement(placement)
        let transform
        switch (direction) {
            case 'top':
                transform = 'translateY(10px)'
                break
            case 'bottom':
                transform = 'translateY(-10px)'
                break
            case 'left':
                transform = 'translateX(10px)'
                break
            case 'right':
                transform = 'translateX(-10px)'
                break
            default:
                transform = 'translateY(-10px)'
        }
        const keyframes = mode === 'open' ? [
            { opacity: 0, transform },
            { opacity: 1, transform: 'none' },
        ] : [
            { opacity: 1, transform: 'none' },
            { opacity: 0, transform },
        ]
        const options: KeyframeAnimationOptions = {
            duration: 150,
            easing: 'ease-out',
        }
        return { keyframes, options }
    }

    private surfaceAnimation: Animation | null = null

    private async animateSurface(mode: 'open' | 'close'): Promise<void> {
        if(this.quick) return
        if(!this.surfaceElement) return

        this.surfaceAnimation?.cancel()

        let animationConfig = this.customAnimations?.[mode] ?? this.getDefaultAnimation(mode, this.placement)
        if(typeof animationConfig === 'function') animationConfig = animationConfig(this.placement)

        this.surfaceAnimation = this.surfaceElement.animate(animationConfig.keyframes, animationConfig.options)

        try {
            await this.surfaceAnimation.finished
        } catch (_) {
        } finally {
            this.surfaceAnimation = null
        }

    }

    @queryAssignedElements({ slot: 'surface', flatten: true, })
    private readonly surfaceElements!: Array<HTMLElement>

    @queryAssignedElements({ slot: 'trigger', flatten: true })
    private readonly triggerElements!: Array<HTMLElement>

    private get triggerElement(): HTMLElement | undefined {
        return this.triggerElements[0]
    }

    private get surfaceElement(): HTMLElement | undefined {
        return this.surfaceElements[0]
    }

    // protected override createRenderRoot(): HTMLElement | DocumentFragment {
    //     return this
    // }

    protected override render(): TemplateResult {
        return html`
            ${this.renderTriggerSlot()}
            ${this.renderSurfaceSlot()}        
        `
    }

    protected renderSurfaceSlot() {
        return html`<slot name="surface" @slotchange=${this.handleSlotChange}></slot>`
    }

    protected renderTriggerSlot() {
        return html`<slot name="trigger" @slotchange=${this.handleSlotChange}></slot>`
    }

    private handleSlotChange(): void {
        this.requestUpdate()
    }

    private async handleOpenChange(oldValue: boolean): Promise<void> {
        if (this.open === oldValue) return
        if (this.open) await this.show()
        else await this.hide()
    }
    public async show(): Promise<void> {
        if (!this.surfaceElement || !this.triggerElement) return
        this.surfaceAnimation?.cancel()

        this.surfaceElement.style.display = 'block'

        this.cleanup = autoUpdate(this.triggerElement, this.surfaceElement, async () => {
            const middleware = [
                offset(6),
                !this.disableFlip && flip(),
                shift({ padding: 8 })
            ].filter(Boolean)

            const { x, y } = await computePosition(this.triggerElement!, this.surfaceElement!, {
                placement: this.placement,
                middleware,
            })
            Object.assign(this.surfaceElement!.style, { left: `${x}px`, top: `${y}px` })
        })

        document.addEventListener('click', this.handleDocumentClick, true)
        document.addEventListener('keydown', this.handleDocumentKeyDown, true)

        await this.animateSurface('open')
        this.dispatchEvent(new CustomEvent('mdc-popup-opened'))
    }
    
    public async hide(): Promise<void> {
        if (!this.surfaceElement) return
        this.surfaceAnimation?.cancel()

        await this.animateSurface('close')

        this.cleanup?.()
        document.removeEventListener('click', this.handleDocumentClick, true)
        document.removeEventListener('keydown', this.handleDocumentKeyDown, true)

        this.surfaceElement.style.display = 'none'
        this.dispatchEvent(new CustomEvent('mdc-popup-closed'))
    }

    private readonly handleTriggerClick = (event: MouseEvent): void => {``
        const path = event.composedPath()
        if (this.triggerElement && path.includes(this.triggerElement)) {
            this.open = !this.open
        }
    }

    private readonly handleDocumentClick = (event: MouseEvent): void => {
        const path = event.composedPath()
        if (!path.includes(this)) {
            this.open = false
        }
    }

    private readonly handleDocumentKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            this.open = false
        }
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        this.handleOpenChange(false)
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.cleanup?.()
    }

    protected override firstUpdated(_changedProperties: PropertyValues): void {
        super.firstUpdated(_changedProperties)
        console.log(this.surfaceElements);
        if (!this.surfaceElement) return
        // 初始隐藏浮层
        this.surfaceElement.style.display = 'none'
        this.surfaceElement.style.position = 'fixed'
        
        this.addEventListener('click', this.handleTriggerClick)

    }
    
    protected override updated(changedProperties: Map<string, unknown>): void {
        if (changedProperties.has('open')) {
            this.handleOpenChange(changedProperties.get('open') as boolean)
        }
    }

}
