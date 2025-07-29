import { html, LitElement, type TemplateResult } from 'lit'
import { customElement, property, query, queryAssignedElements, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinConnectedPromiseResolve } from '../../utils/behaviors/connected-promise-resolve'
import type { DialogAnimationArgs } from '../dialog/dialog-animations'
import { NavigationBarTab } from '../navigation-item/navigation-bar-tab'
import { NavigationRailDefaultCloseAnimation, NavigationRailDefaultOpenAnimation, type TNavigationRailAnimation } from './navigation-rail-animations'
import { navigationRailStyle } from './navigation-rail.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-navigation-rail": NavigationRail
    }
}

/**
 * @todo
 * - docked / floating
 * - position
 * - scrollable
 * 
 * expanded
 * - false (default)
 * - true
 * 
 * position:
 * - top (default)
 * - middle
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
 * https://www.figma.com/design/4GM7ohCF2Qtjzs7Fra6jlp/Material-3-Design-Kit--Community-?node-id=58016-36879&t=KiHBf0L3gSBbEFIZ-0
 */
@customElement('mdc-navigation-rail')
export class NavigationRail extends mixinConnectedPromiseResolve(LitElement) {

    static override styles = navigationRailStyle

    @property({ type: Boolean })
    public expanded: boolean = false

    @property({ type: String })
    public position: 'top' | 'middle' | 'bottom' = 'top'

    @property({ type: Boolean })
    public xr: boolean = false

    @property({ type: Boolean })
    public quick: boolean = false

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

    @state()
    protected hasInactiveMenu: boolean = false
    @state()
    protected hasActiveMenu: boolean = false
    @state()
    protected hasFab: boolean = false
    @state()
    protected hasContent: boolean = false

    protected isOpen = false
    protected isOpening = false

    protected getRenderClasses() {
        return ({
            'expanded': this.expanded,
            'collapsed': !this.expanded,
            'xr': this.xr,
            'top': this.position === 'top',
            'middle': this.position === 'middle',
            'has-menu': this.hasActiveMenu || this.hasInactiveMenu,
            'has-inactive-menu': this.hasInactiveMenu,
            'has-active-menu': this.hasActiveMenu,
            'has-fab': this.hasFab,
            'has-content': this.hasContent,
        })
    }

    protected override render(): TemplateResult {
        return html`
            <dialog class=${classMap(this.getRenderClasses())}>
                <span class="background" aria-hidden="true"></span>
                <div class="container">
                    <div class="menu-and-fab">
                        ${this.renderMenu()}     
                        ${this.renderFab()}    
                    </div>
                    ${this.renderContent()}
                </div>
            </dialog>
        `
    }

    protected renderContent() {
        return html`
            <div class="content">
                <slot @slotchange=${this.handleContentSlotChange}></slot>
            </div>
        `
    }
    protected renderFab() {
        return html`
            <span class="fab">
                <slot name="fab" @slotchange=${this.handleFabSlotChange}></slot>
            </span>
        `
    }
    protected renderMenu() {
        return html`
            <span class="menu-active-icon">
                <slot name="menu-active-icon" @slotchange=${this.handleInactiveMenuSlotChange}>
                    <mdc-standard-icon-button @click=${this.handleCollapsed}>
                        ${this.renderMenuActiveIcon()}
                    </mdc-standard-icon-button>
                </slot>
            </span>
            <span class="menu-inactive-icon" @slotchange=${this.handleActiveMenuSlotChange}>
                <slot name="menu-inactive-icon">
                    <mdc-standard-icon-button @click=${this.handleExpanded}>
                        ${this.renderMenuInactiveIcon()}
                    </mdc-standard-icon-button>
                </slot>
            </span>
        `
    }
    protected renderMenuInactiveIcon() {
        return html`
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>
        `
    }
    protected renderMenuActiveIcon() {
        return html`
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M120-240v-80h520v80H120Zm664-40L584-480l200-200 56 56-144 144 144 144-56 56ZM120-440v-80h400v80H120Zm0-200v-80h520v80H120Z"/></svg>
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

        await this.animateDialog(NavigationRailDefaultOpenAnimation)
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

        await this.animateDialog(NavigationRailDefaultCloseAnimation)
        dialog.close()
        this.open = false
        this.dispatchEvent(new Event('closed'))
    }

    private async animateDialog(animation: TNavigationRailAnimation) {
        // Always cancel the previous animations. Animations can include `fill`
        // modes that need to be cleared when `quick` is toggled. If not, content
        // that faded out will remain hidden when a `quick` dialog re-opens after
        // previously opening and closing without `quick`.
        this.cancelAnimations?.abort()
        this.cancelAnimations = new AbortController()

        if (this.quick) {
            return
        }

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

    protected override updated(changedProperties: Map<string | number | symbol, unknown>) {
        if (changedProperties.has('xr')) {
            this.updateSlottedChild('xr', this.xr)
        }
        if (changedProperties.has('expanded')) {
            this.updateSlottedChild('direction', this.expanded ? 'horizonal' : 'vertical')
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

    private handleExpanded() {
        this.expanded = true
    }
    private handleCollapsed() {
        this.expanded = false
    }

    protected handleInactiveMenuSlotChange(e: Event) {
        this.hasInactiveMenu = (e.target as HTMLSlotElement).assignedElements().length > 0
    }
    protected handleActiveMenuSlotChange(e: Event) {
        this.hasActiveMenu = (e.target as HTMLSlotElement).assignedElements().length > 0
    }
    protected handleFabSlotChange(e: Event) {
        this.hasFab = (e.target as HTMLSlotElement).assignedElements().length > 0
    }
    protected handleContentSlotChange(e: Event) {
        this.hasContent = (e.target as HTMLSlotElement).assignedElements().length > 0
    }
}
