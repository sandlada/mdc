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
import '../../elevation/elevation'
import {
    ToolbarExpandedChangeEvent,
    type FloatingToolbarFabPosition,
    type IMDCFloatingToolbar,
    type IToolbarExpandedChangeEventDetail,
    type ToolbarOrientation,
    type ToolbarVariant,
} from '../toolbar.interface'
import { FloatingToolbarStyles } from '../floating-toolbar.style'
import {
    getToolbarInteractiveItems,
    handleToolbarKeyDown,
    updateToolbarRovingTabindex,
} from './toolbar-navigation'

export abstract class BaseFloatingToolbar extends composeMixin(
    mixinDelegatesAria,
    mixinElementInternals,
)(LitElement) implements IMDCFloatingToolbar {

    public static override styles = FloatingToolbarStyles

    @property({ type: String, reflect: true })
    public variant: ToolbarVariant = 'standard'

    @property({ type: String, reflect: true })
    public orientation: ToolbarOrientation = 'horizontal'

    @property({ type: Boolean, reflect: true })
    public expanded: boolean = true

    @property({ type: String, attribute: 'fab-position', reflect: true })
    public fabPosition: FloatingToolbarFabPosition = 'end'

    @state()
    protected hasFab = false

    constructor() {
        super()
        if (isServer) return
        this.addEventListener('keydown', this.onKeyDown)
    }

    public expand(): void {
        if (this.expanded) return
        this.expanded = true
        this.emitExpandedChange()
    }

    public collapse(): void {
        if (!this.expanded) return
        this.expanded = false
        this.emitExpandedChange()
    }

    public toggle(): void {
        this.expanded = !this.expanded
        this.emitExpandedChange()
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (changedProperties.has('expanded') && changedProperties.get('expanded') !== undefined) {
            // Keep inert/aria-hidden synced when collapsed
        }
    }

    protected getWrapperClasses() {
        return {
            'wrapper': true,
            [this.orientation]: true,
            'expanded': this.expanded,
            'collapsed': !this.expanded,
            'has-fab': this.hasFab,
            [`fab-${this.fabPosition}`]: true,
        }
    }

    protected getContainerClasses() {
        return {
            'container': true,
            [this.variant]: true,
        }
    }

    protected handleDefaultSlotChange = (): void => {
        updateToolbarRovingTabindex(getToolbarInteractiveItems(this))
    }

    protected handleFabSlotChange = (e: Event): void => {
        this.hasFab = (e.target as HTMLSlotElement).assignedElements({ flatten: true }).length > 0
    }

    private emitExpandedChange(): void {
        this.dispatchEvent(new CustomEvent<IToolbarExpandedChangeEventDetail>(ToolbarExpandedChangeEvent, {
            detail: { expanded: this.expanded },
            bubbles: true,
            composed: true,
        }))
    }

    private onKeyDown = (e: KeyboardEvent): void => {
        handleToolbarKeyDown(e, this, this.orientation)
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        return html`
            <div class="${classMap(this.getWrapperClasses())}">
                <div
                    class="${classMap(this.getContainerClasses())}"
                    role="toolbar"
                    aria-orientation="${this.orientation}"
                    aria-label="${ariaLabel || nothing}"
                    aria-hidden="${this.expanded ? 'false' : 'true'}"
                    ?inert="${!this.expanded}"
                >
                    <mdc-elevation></mdc-elevation>
                    <span class="background" aria-hidden="true"></span>
                    <div class="actions">
                        <slot @slotchange="${this.handleDefaultSlotChange}"></slot>
                    </div>
                </div>
                <div class="${classMap({ 'fab-container': true, 'has-content': this.hasFab })}">
                    <slot name="fab" @slotchange="${this.handleFabSlotChange}"></slot>
                </div>
            </div>
        `
    }
}
