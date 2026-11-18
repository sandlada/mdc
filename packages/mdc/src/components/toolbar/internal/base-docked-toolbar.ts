/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { mixinElementInternals } from '../../../utils/behaviors/element-internals'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import {
    ToolbarScrollBehavior,
    ToolbarVisibilityChangeEvent,
    type DockedToolbarAlignment,
    type IMDCDockedToolbar,
    type IToolbarVisibilityChangeDetail,
    type ToolbarVariant,
} from '../toolbar.interface'
import { DockedToolbarStyles } from '../docked-toolbar.style'
import {
    getToolbarInteractiveItems,
    handleToolbarKeyDown,
    updateToolbarRovingTabindex,
} from './toolbar-navigation'
import { attachToolbarScrollTarget, type IToolbarScrollBinding } from './toolbar-scroll'

export abstract class BaseDockedToolbar extends composeMixin(
    mixinDelegatesAria,
    mixinElementInternals,
)(LitElement) implements IMDCDockedToolbar {

    public static override styles = DockedToolbarStyles

    @property({ type: String, reflect: true })
    public variant: ToolbarVariant = 'standard'

    @property({ type: String, reflect: true })
    public alignment: DockedToolbarAlignment = 'space-between'

    @property({ type: String, reflect: true, attribute: 'scroll-behavior' })
    public scrollBehavior: ToolbarScrollBehavior = ToolbarScrollBehavior.Pinned

    @property({ type: Boolean, reflect: true })
    public collapsed: boolean = false

    @property({ attribute: 'scroll-target' })
    public scrollTarget: HTMLElement | Window | string | null = null

    @state()
    private hasLeading = false

    @state()
    private hasTrailing = false

    private scrollBinding: IToolbarScrollBinding | null = null

    constructor() {
        super()
        if (isServer) return
        this.addEventListener('keydown', this.onKeyDown)
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        this.rebindScrollTarget()
    }

    public override disconnectedCallback(): void {
        this.scrollBinding?.cleanup()
        this.scrollBinding = null
        super.disconnectedCallback()
    }

    public show(): void {
        this.collapsed = false
    }

    public hide(): void {
        this.collapsed = true
    }

    public toggle(): void {
        this.collapsed = !this.collapsed
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (changedProperties.has('variant')) {
            this.syncChildVariants()
        }
        if (changedProperties.has('scrollTarget') || changedProperties.has('scrollBehavior')) {
            this.rebindScrollTarget()
        }
        if (changedProperties.has('collapsed')) {
            this.dispatchEvent(new CustomEvent<IToolbarVisibilityChangeDetail>(ToolbarVisibilityChangeEvent, {
                bubbles : true,
                composed: true,
                detail  : { collapsed: this.collapsed },
            }))
        }
    }

    protected getRenderClasses() {
        return {
            'container': true,
            [this.variant]: true,
            [`align-${this.alignment}`]: true,
            'is-hidden': this.collapsed,
        }
    }

    private rebindScrollTarget(): void {
        this.scrollBinding?.cleanup()
        this.scrollBinding = attachToolbarScrollTarget(
            this,
            this.scrollBehavior,
            this.scrollTarget,
            (collapsed) => {
                this.collapsed = collapsed
            },
        )
    }

    protected handleDefaultSlotChange = (): void => {
        this.syncChildVariants()
        updateToolbarRovingTabindex(getToolbarInteractiveItems(this))
    }

    protected handleLeadingSlotChange = (e: Event): void => {
        this.hasLeading = (e.target as HTMLSlotElement).assignedElements({ flatten: true }).length > 0
        this.syncChildVariants()
    }

    protected handleTrailingSlotChange = (e: Event): void => {
        this.hasTrailing = (e.target as HTMLSlotElement).assignedElements({ flatten: true }).length > 0
        this.syncChildVariants()
    }

    private syncChildVariants(): void {
        if (isServer) return
        for (const el of Array.from(this.children)) {
            if (el.tagName.toLowerCase() === 'mdc-docked-toolbar-action' && !el.hasAttribute('variant')) {
                (el as HTMLElement & { variant: ToolbarVariant }).variant = this.variant
            }
        }
    }

    private onKeyDown = (e: KeyboardEvent): void => {
        handleToolbarKeyDown(e, this, 'horizontal')
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        return html`
            <div
                class="${classMap(this.getRenderClasses())}"
                role="toolbar"
                aria-orientation="horizontal"
                aria-label="${ariaLabel || nothing}"
            >
                <span class="background" aria-hidden="true"></span>
                <div class="${classMap({ 'section-leading': true, 'has-content': this.hasLeading })}">
                    <slot name="leading" @slotchange="${this.handleLeadingSlotChange}"></slot>
                </div>
                <div class="section-actions">
                    <slot @slotchange="${this.handleDefaultSlotChange}"></slot>
                </div>
                <div class="${classMap({ 'section-trailing': true, 'has-content': this.hasTrailing })}">
                    <slot name="trailing" @slotchange="${this.handleTrailingSlotChange}"></slot>
                </div>
            </div>
        `
    }
}
