/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import {
    ExpansionGroupController,
    type IExpansionGroupHost,
} from '../../../utils/controller/expansion-controller'
import {
    AccordionChangeEvent,
    AccordionMode,
    AccordionShape,
    AccordionSize,
    AccordionVariant,
    ExpansionPanelToggleEvent,
    type IMDCAccordion,
    type IMDCAccordionChangeDetail,
    type IMDCExpansionPanel,
} from '../accordion.interface'
import { AccordionStyles } from '../accordion.style'

export abstract class BaseAccordion extends composeMixin(
    mixinDelegatesAria
)(LitElement) implements IMDCAccordion, IExpansionGroupHost<IMDCExpansionPanel> {

    public static override styles = AccordionStyles

    @property({ type: String, reflect: true })
    public mode: AccordionMode = AccordionMode.Multiple

    @property({ type: Boolean, reflect: true })
    public collapsible = true

    @property({ type: String, reflect: true })
    public variant: AccordionVariant = AccordionVariant.Outlined

    @property({ type: String, reflect: true })
    public size: AccordionSize = AccordionSize.Medium

    @property({ type: String, reflect: true })
    public shape: AccordionShape = AccordionShape.Round

    @property({ type: Boolean, reflect: true })
    public connected = false

    @property({ type: Boolean, reflect: true })
    public quick = false

    private collectedPanels: IMDCExpansionPanel[] = []

    private readonly groupController = new ExpansionGroupController<IMDCExpansionPanel>(this, {
        toggleEvent: ExpansionPanelToggleEvent,
    })

    public get panels(): IMDCExpansionPanel[] {
        return [...this.collectedPanels]
    }

    public get expandedPanels(): IMDCExpansionPanel[] {
        return this.groupController.expandedItems
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        this.collectPanels()
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        this.collectPanels()
        if (
            changedProperties.has('variant') ||
            changedProperties.has('size') ||
            changedProperties.has('shape') ||
            changedProperties.has('connected') ||
            changedProperties.has('quick')
        ) {
            this.syncPanels()
        }
        if (changedProperties.has('mode') && this.mode === AccordionMode.Single) {
            this.groupController.enforceSingleExpanded()
        }
    }

    public getExpansionItems(): IMDCExpansionPanel[] {
        return this.collectedPanels
    }

    public isItemHeaderFocused(panel: IMDCExpansionPanel, event: KeyboardEvent): boolean {
        const origin = event.composedPath()[0] as HTMLElement | undefined
        const isHeaderOrigin = origin?.classList?.contains('header') ?? false
        return isHeaderOrigin || (panel.shadowRoot?.activeElement?.classList.contains('header') ?? false)
    }

    public onExpansionGroupChange(detail: {
        expandedIndices: number[]
        expandedItems: IMDCExpansionPanel[]
        changedItem: IMDCExpansionPanel
        expanded: boolean
    }): void {
        this.dispatchEvent(
            new CustomEvent<IMDCAccordionChangeDetail>(AccordionChangeEvent, {
                bubbles : true,
                composed: true,
                detail  : {
                    expandedIndices: detail.expandedIndices,
                    expandedPanels : detail.expandedItems,
                    changedPanel   : detail.changedItem,
                    expanded       : detail.expanded,
                },
            })
        )
    }

    /**
     * Expands all enabled panels (only applies in `'multiple'` mode).
     */
    public expandAll(): void {
        this.groupController.expandAll()
    }

    /**
     * Collapses all enabled panels (in `'single'` mode with `collapsible: false`, keeps the active panel open).
     */
    public collapseAll(): void {
        this.groupController.collapseAll()
    }

    /**
     * Expands the panel at the given 0-based index.
     */
    public expandAt(index: number): void {
        this.groupController.expandAt(index)
    }

    /**
     * Collapses the panel at the given 0-based index.
     */
    public collapseAt(index: number): void {
        this.groupController.collapseAt(index)
    }

    /**
     * Toggles the panel at the given 0-based index.
     */
    public toggleAt(index: number): void {
        this.groupController.toggleAt(index)
    }

    protected override render(): TemplateResult {
        return html`<slot @slotchange=${this.handleSlotChange}></slot>`
    }

    private collectPanels(): void {
        this.collectedPanels = Array.from(this.children).filter(
            (child): child is IMDCExpansionPanel => child.tagName.toLowerCase() === 'mdc-expansion-panel'
        )
        this.syncPanels()
    }

    private syncPanels(): void {
        const total = this.collectedPanels.length
        this.collectedPanels.forEach((panel, index) => {
            if (!panel.hasAttribute('variant') || panel.dataset['accordionManagedVariant'] === 'true') {
                panel.variant = this.variant
                panel.dataset['accordionManagedVariant'] = 'true'
            }
            if (!panel.hasAttribute('size') || panel.dataset['accordionManagedSize'] === 'true') {
                panel.size = this.size
                panel.dataset['accordionManagedSize'] = 'true'
            }
            if (!panel.hasAttribute('shape') || panel.dataset['accordionManagedShape'] === 'true') {
                panel.shape = this.shape
                panel.dataset['accordionManagedShape'] = 'true'
            }
            if (this.quick) {
                panel.quick = true
            }

            if (this.connected) {
                panel.setAttribute('data-connected', '')
            } else {
                panel.removeAttribute('data-connected')
            }

            if (index === 0) {
                panel.setAttribute('data-first', '')
            } else {
                panel.removeAttribute('data-first')
            }

            if (index === total - 1) {
                panel.setAttribute('data-last', '')
            } else {
                panel.removeAttribute('data-last')
            }
        })
    }

    private handleSlotChange(): void {
        this.collectPanels()
        if (this.mode === AccordionMode.Single) {
            this.groupController.enforceSingleExpanded()
        }
    }
}
