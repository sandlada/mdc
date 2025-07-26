import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, query, queryAssignedElements } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinConnectedPromiseResolve } from '../../utils/behaviors/connected-promise-resolve'
import type { DialogAnimationArgs } from '../dialog/dialog-animations'
import type { TNavigationTabDirection } from '../navigation-item/base-navigation-tab'
import { NavigationBarTab } from '../navigation-item/navigation-bar-tab'
import { NavigationBarDefaultCloseAnimation, NavigationBarDefaultOpenAnimation, type TNavigationBarAnimation } from './navigation-bar-animations'
import { navigationBarStyle } from './navigation-bar.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-navigation-bar": NavigationBar
    }
}

/**
 * direction:
 * - direction="vertical" (default)
 * - direction="horizonal"
 * 
 * position:
 * - left
 * - middle
 * - between (default)
 * - right
 * 
 * xr:
 * - false (default)
 * - true
 * 
 * open:
 * - false (default)
 * - true
 * 
 * When xr is enabled, only vertical is valid:
 * <mdc-navigation-bar open xr direction="vertical"></mdc-navigation-bar>
 * 
 * @version
 * Material Design 3 - Expressive
 * 
 * @link
 * https://www.figma.com/design/4GM7ohCF2Qtjzs7Fra6jlp/Material-3-Design-Kit--Community-?node-id=58016-36958&t=gL02aeIXWQsJdOqN-0
 */
@customElement('mdc-navigation-bar')
export class NavigationBar extends mixinConnectedPromiseResolve(LitElement) {

    static override styles = navigationBarStyle

    @property({ type: String })
    public direction: TNavigationTabDirection = 'vertical'

    @property({ type: String })
    public position: 'start' | 'middle' | 'between' | 'end' = 'between'

    @property({ type: Boolean })
    public xr: boolean = false

    @property({ type: Boolean, noAccessor: true })
    public get open(): boolean {
        return this.isOpen
    }
    public set open(value: boolean) {
        if (value === this.isOpen) {
            return
        }
        this.isOpen = value
        if (value) {
            this.setAttribute('open', '')
            this.show()
        } else {
            this.removeAttribute('open')
            this.close()
        }
    }

    /**
     * @todo
     * - auto open/close
     * - auto change direction
     */
    // @property({ type: Boolean })
    // public autoControl: boolean = false
    // @property({ type: Number })
    // public breakpoint: number = 840

    @query('dialog')
    private readonly dialog!: HTMLDialogElement | null
    @query('.container')
    private readonly container!: HTMLDialogElement | null
    @query('.content')
    private readonly content!: HTMLDialogElement | null

    @queryAssignedElements()
    private readonly tabs!: Array<HTMLElement | NavigationBarTab>


    protected isOpen = false
    protected isOpening = false

    protected getRenderClasses() {
        return ({
            'vertical': this.direction === 'vertical',
            'horizonal': this.direction !== 'vertical',
            'xr': this.xr,
            'start': this.position === 'start',
            'middle': this.position === 'middle',
            'between': this.position === 'between',
            'end': this.position === 'end',
        })
    }

    protected override render(): TemplateResult {
        return html`
            <dialog class=${classMap(this.getRenderClasses())}>
                <span class="background" aria-hidden="true"></span>
                <div class="container">
                    <div class="content">
                        <slot></slot>
                    </div>
                </div>
            </dialog>
        `
    }

    protected cancelAnimations: AbortController | null = null


    public async show() {
        this.isOpening = true
        // Dialogs can be opened before being attached to the DOM, so we need to
        // wait until we're connected before calling `showModal()`.
        await this.isConnectedPromise
        await this.updateComplete
        const dialog = this.dialog!
        // Check if already opened or if `dialog.close()` was called while awaiting.
        if (dialog.open || !this.isOpening) {
            this.isOpening = false
            return
        }
        const preventOpen = !this.dispatchEvent(
            new Event('open', { cancelable: true }),
        )
        if (preventOpen) {
            this.open = false
            this.isOpening = false
            return
        }
        // All Material dialogs are modal.
        dialog.show()
        this.open = true
        // Native modal dialogs ignore autofocus and instead force focus to the
        // first focusable child. Override this behavior if there is a child with
        // an autofocus attribute.
        this.querySelector<HTMLElement>('[autofocus]')?.focus()

        await this.animateDialog(NavigationBarDefaultOpenAnimation)
        this.dispatchEvent(new Event('opened'))
        this.isOpening = false
    }
    public async close() {
        this.isOpening = false
        if (!this.isConnected) {
            // Disconnected dialogs do not fire close events or animate.
            this.open = false
            return
        }

        await this.updateComplete
        const dialog = this.dialog!
        // Check if already closed or if `dialog.show()` was called while awaiting.
        if (!dialog.open || this.isOpening) {
            this.open = false
            return
        }

        const preventClose = !this.dispatchEvent(
            new Event('close', { cancelable: true }),
        )
        if (preventClose) {
            return
        }

        await this.animateDialog(NavigationBarDefaultCloseAnimation)
        dialog.close()
        this.open = false
        this.dispatchEvent(new Event('closed'))
    }

    private async animateDialog(animation: TNavigationBarAnimation) {
        // Always cancel the previous animations. Animations can include `fill`
        // modes that need to be cleared when `quick` is toggled. If not, content
        // that faded out will remain hidden when a `quick` dialog re-opens after
        // previously opening and closing without `quick`.
        this.cancelAnimations?.abort()
        this.cancelAnimations = new AbortController()

        const { dialog, container, content } = this
        if (!dialog || !container || !content) {
            return
        }

        const {
            container: containerAnimate,
            dialog: dialogAnimate,
            content: contentAnimate,
        } = animation

        const elementAndAnimation: Array<[Element, DialogAnimationArgs[]]> = [
            [dialog, dialogAnimate ?? []],
            [container, containerAnimate ?? []],
            [content, contentAnimate ?? []],
        ]

        const animations: Animation[] = []
        for (const [element, animation] of elementAndAnimation) {
            for (const animateArgs of animation) {
                const animation = element.animate(...animateArgs)
                this.cancelAnimations.signal.addEventListener('abort', () => {
                    animation.cancel()
                })

                animations.push(animation)
            }
        }

        await Promise.all(
            animations.map((animation) =>
                animation.finished.catch(() => {
                    // Ignore intentional AbortErrors when calling `animation.cancel()`.
                }),
            ),
        )
    }



    protected override firstUpdated(_changedProperties: PropertyValues): void {
        super.firstUpdated(_changedProperties)
        // this.updateSlottedChild('direction', this.direction)
        // this.updateSlottedChild('xr', this.xr)
    }

    protected override updated(changedProperties: Map<string | number | symbol, unknown>) {
        if (changedProperties.has('xr')) {
            this.updateSlottedChild('xr', this.xr)
        }
        if (changedProperties.has('direction')) {
            this.updateSlottedChild('direction', this.direction)
        }
        super.updated(changedProperties)
    }

    private updateSlottedChild(attr: 'direction' | 'xr', value: string | boolean) {
        const tabs = this.tabs.filter((node) => node.nodeName !== 'mdc-navigation-bar-tab')
        
        if(tabs.length === 0) {
            return
        }

        if(attr === 'xr' && value) {
            for(const tab of tabs) {
                tab.setAttribute(attr, ``)
            }
        } else if(attr === 'xr') {
            for(const tab of tabs) {
                tab.removeAttribute(attr)
            }
        } else {
            for(const tab of tabs) {
                tab.setAttribute(attr, value as string)
            }
        }
    }
}
