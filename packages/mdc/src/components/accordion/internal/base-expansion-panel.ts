/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { ExpansionController } from '../../../utils/expansion'
import '../../elevation/elevation'
import '../../focus-ring/focus-ring'
import '../../icon/icon'
import '../../ripple/ripple'
import {
    AccordionShape,
    AccordionSize,
    AccordionVariant,
    ExpansionPanelCollapsedEvent,
    ExpansionPanelCollapsingEvent,
    ExpansionPanelExpandedEvent,
    ExpansionPanelExpandingEvent,
    ExpansionPanelToggleEvent,
    type IMDCExpansionPanel,
} from '../accordion.interface'
import { ExpansionPanelStyles } from '../accordion.style'

let NextPanelId = 0

export abstract class BaseExpansionPanel extends composeMixin(
    mixinDelegatesAria
)(LitElement) implements IMDCExpansionPanel {

    public static override styles = ExpansionPanelStyles

    @property({ type: Boolean, reflect: true })
    public expanded = false

    @property({ type: Boolean, reflect: true })
    public disabled = false

    @property({ type: String, reflect: true })
    public variant: AccordionVariant = AccordionVariant.Outlined

    @property({ type: String, reflect: true })
    public size: AccordionSize = AccordionSize.Medium

    @property({ type: String, reflect: true })
    public shape: AccordionShape = AccordionShape.Round

    @property({ type: String })
    public headline = ''

    @property({ type: String, attribute: 'supporting-text' })
    public supportingText = ''

    @property({ type: String })
    public icon = ''

    @property({ type: String, attribute: 'expand-icon' })
    public expandIcon = 'expand_more'

    @property({ type: Boolean, attribute: 'hide-indicator', reflect: true })
    public hideIndicator = false

    @property({ type: Boolean, attribute: 'hide-summary-on-expand', reflect: true })
    public hideSummaryOnExpand = false

    @property({ type: Boolean, attribute: 'no-divider', reflect: true })
    public noDivider = false

    @property({ type: Number, attribute: 'heading-level' })
    public headingLevel = 0

    @property({ type: Boolean, reflect: true })
    public quick = false

    @property({ type: String })
    public value = ''

    @state()
    private hasSlottedIcon = false

    @state()
    private hasSlottedHeadline = false

    @state()
    private hasSlottedSupportingText = false

    @state()
    private hasSlottedTrailing = false

    @state()
    private hasSlottedExpandIcon = false

    @state()
    private hasSlottedActions = false

    @query('.header')
    private readonly headerElement!: HTMLButtonElement | null

    @query('.collapse')
    private readonly collapseElement!: HTMLDivElement | null

    private readonly panelUid = ++NextPanelId
    private readonly headerId = `mdc-expansion-panel-header-${this.panelUid}`
    private readonly bodyId = `mdc-expansion-panel-body-${this.panelUid}`

    private readonly expansionController = new ExpansionController(this, {
        getCollapseElement: () => this.collapseElement,
        toggleEvent       : ExpansionPanelToggleEvent,
        expandingEvent    : ExpansionPanelExpandingEvent,
        expandedEvent     : ExpansionPanelExpandedEvent,
        collapsingEvent   : ExpansionPanelCollapsingEvent,
        collapsedEvent    : ExpansionPanelCollapsedEvent,
    })

    protected override willUpdate(_changedProperties: PropertyValues<this>): void {
        if (!this.hasUpdated) {
            this.syncLightDomSlots()
        }
    }

    /**
     * Programmatically expands the panel.
     */
    public async expand(): Promise<void> {
        await this.expansionController.expand()
    }

    /**
     * Programmatically collapses the panel.
     */
    public async collapse(): Promise<void> {
        await this.expansionController.collapse()
    }

    /**
     * Programmatically toggles the panel's expanded state.
     */
    public async toggle(): Promise<void> {
        await this.expansionController.toggle()
    }

    /**
     * Moves keyboard focus to the panel's interactive header button.
     */
    public focusHeader(): void {
        this.headerElement?.focus()
    }

    protected getRenderClasses(): Record<string, boolean> {
        return {
            panel   : true,
            expanded: this.expanded,
            disabled: this.disabled,
        }
    }

    protected override render(): TemplateResult {
        const hasIcon = this.hasSlottedIcon || Boolean(this.icon)
        const hasHeadline = this.hasSlottedHeadline || Boolean(this.headline)
        const hasSupportingText = this.hasSlottedSupportingText || Boolean(this.supportingText)
        const showElevation = this.variant === AccordionVariant.Elevated

        const headerButton = html`
            <button
                id=${this.headerId}
                type="button"
                class="header"
                aria-expanded=${this.expanded ? 'true' : 'false'}
                aria-controls=${this.bodyId}
                ?disabled=${this.disabled}
                @click=${this.handleHeaderClick}
            >
                ${this.disabled ? nothing : html`<mdc-ripple></mdc-ripple><mdc-focus-ring></mdc-focus-ring>`}
                <span class="leading-icon" ?hidden=${!hasIcon} aria-hidden="true">
                    <slot name="icon" @slotchange=${this.handleIconSlotChange}>
                        ${this.icon ? html`<mdc-icon>${this.icon}</mdc-icon>` : nothing}
                    </slot>
                </span>
                <span class="header-text">
                    <span class="headline" ?hidden=${!hasHeadline}>
                        <slot name="headline" @slotchange=${this.handleHeadlineSlotChange}>
                            ${this.headline}
                        </slot>
                    </span>
                    <span class="supporting-text" ?hidden=${!hasSupportingText}>
                        <slot name="supporting-text" @slotchange=${this.handleSupportingTextSlotChange}>
                            ${this.supportingText}
                        </slot>
                    </span>
                </span>
                <span class="trailing" ?hidden=${!this.hasSlottedTrailing} @click=${this.handleTrailingClick}>
                    <slot name="trailing" @slotchange=${this.handleTrailingSlotChange}></slot>
                </span>
                <span class="expand-icon" ?hidden=${this.hideIndicator} aria-hidden="true">
                    <slot name="expand-icon" @slotchange=${this.handleExpandIconSlotChange}>
                        <mdc-icon>${this.expandIcon}</mdc-icon>
                    </slot>
                </span>
            </button>
        `

        const validHeadingLevel =
            Number.isInteger(this.headingLevel) && this.headingLevel >= 1 && this.headingLevel <= 6

        return html`
            <div class=${classMap(this.getRenderClasses())}>
                ${showElevation ? html`<mdc-elevation></mdc-elevation>` : nothing}
                ${validHeadingLevel
                    ? html`<div class="header-heading" role="heading" aria-level=${this.headingLevel}>${headerButton}</div>`
                    : headerButton}
                <div
                    id=${this.bodyId}
                    class="collapse"
                    role="region"
                    aria-labelledby=${this.headerId}
                    ?inert=${!this.expanded}
                    aria-hidden=${this.expanded ? 'false' : 'true'}
                    @transitionend=${this.expansionController.handleTransitionEnd}
                >
                    <div class="collapse-inner">
                        <div class="body">
                            <slot></slot>
                        </div>
                        <div class="actions" ?hidden=${!this.hasSlottedActions}>
                            <slot name="actions" @slotchange=${this.handleActionsSlotChange}></slot>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    private syncLightDomSlots(): void {
        this.hasSlottedIcon = this.querySelector('[slot="icon"]') !== null
        this.hasSlottedHeadline = this.querySelector('[slot="headline"]') !== null
        this.hasSlottedSupportingText = this.querySelector('[slot="supporting-text"]') !== null
        this.hasSlottedTrailing = this.querySelector('[slot="trailing"]') !== null
        this.hasSlottedExpandIcon = this.querySelector('[slot="expand-icon"]') !== null
        this.hasSlottedActions = this.querySelector('[slot="actions"]') !== null
    }

    private handleHeaderClick(): void {
        this.expansionController.requestToggle()
    }

    private handleTrailingClick(event: Event): void {
        const target = event.target as HTMLElement | null
        if (target && target.closest('button, a, input, select, textarea, mdc-button, mdc-icon-button, mdc-switch, mdc-checkbox')) {
            event.stopPropagation()
        }
    }

    private handleIconSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasSlottedIcon = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleHeadlineSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasSlottedHeadline = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleSupportingTextSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasSlottedSupportingText = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleTrailingSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasSlottedTrailing = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleExpandIconSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasSlottedExpandIcon = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleActionsSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasSlottedActions = slot.assignedElements({ flatten: true }).length > 0
    }
}
