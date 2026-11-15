/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, queryAssignedElements, state } from 'lit/decorators.js'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { mixinElevationOptions } from '../../elevation/elevation-options.mixin'
import type { IMDCMenuGroup, MenuColorStyle } from '../menu.interface'
import { MenuGroupStyles } from '../menu-group.style'

const ValidVariants: readonly string[] = ['standard', 'vibrant']

export abstract class BaseMenuGroup extends composeMixin(
    mixinElevationOptions,
)(LitElement) implements IMDCMenuGroup {

    static override styles = MenuGroupStyles

    /** Optional group header label displayed at the top of the group. */
    @property({ type: String })
    public label: string | null = null

    /** Expressive color-style axis inherited from the parent menu. */
    @property({ type: String, reflect: true })
    public variant: MenuColorStyle = 'standard'

    @state()
    private hasLabelSlot = false

    @queryAssignedElements({ flatten: true })
    private readonly assignedChildren!: HTMLElement[]

    public override connectedCallback(): void {
        super.connectedCallback()
        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'group')
        }
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        if (!ValidVariants.includes(this.variant)) {
            throw new Error(`[mdc-menu-group] Unsupported variant "${String(this.variant)}". Expressive menu groups support only "standard" | "vibrant".`)
        }
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (changedProperties.has('label')) {
            if (this.label) {
                this.setAttribute('aria-label', this.label)
            } else {
                this.removeAttribute('aria-label')
            }
        }
        if (changedProperties.has('variant')) {
            this.propagateVariantToChildren()
        }
        const hostClasses = this.getHostClasses()
        for (const [name, active] of Object.entries(hostClasses)) {
            this.classList.toggle(name, active)
        }
    }

    protected getHostClasses(): Record<string, boolean> {
        return {
            [`variant-${this.variant}`]: true,
        }
    }

    protected override render(): TemplateResult {
        const showLabel = Boolean(this.label) || this.hasLabelSlot
        return html`
            ${this.renderElevation()}
            <div class="content">
                ${showLabel
                    ? html`
                        <div class="group-label">
                            <slot name="label" @slotchange=${this.handleLabelSlotChange}>${this.label ?? nothing}</slot>
                        </div>
                    `
                    : html`<slot name="label" hidden @slotchange=${this.handleLabelSlotChange}></slot>`}
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
        `
    }

    private readonly handleLabelSlotChange = (event: Event): void => {
        const slot = event.target as HTMLSlotElement
        this.hasLabelSlot = slot.assignedElements().length > 0
    }

    private readonly handleSlotChange = (): void => {
        this.propagateVariantToChildren()
        this.dispatchEvent(new CustomEvent('menu-group-slotchange', {
            bubbles: true,
            composed: true,
        }))
    }

    private propagateVariantToChildren(): void {
        for (const child of this.assignedChildren ?? []) {
            const tag = child.tagName
            if (tag === 'MDC-MENU-ITEM' || tag === 'MDC-MENU-SUBMENU') {
                (child as HTMLElement & { variant: MenuColorStyle }).variant = this.variant
            }
        }
    }
}
