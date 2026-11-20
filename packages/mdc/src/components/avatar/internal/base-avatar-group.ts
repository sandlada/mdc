/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, queryAssignedElements, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { mixinElementInternals } from '../../../utils/behaviors/element-internals'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import '../../focus-ring/focus-ring'
import '../../ripple/ripple'
import {
    AvatarGroupOverflowClickEvent,
    type AvatarGroupStackOrder,
    type IMDCAvatarGroup,
    type IMDCAvatarGroupOverflowClickDetail,
} from '../avatar-group.interface'
import { AvatarGroupStyles } from '../avatar-group.style'
import type { AvatarShape, AvatarSize, IMDCAvatar } from '../avatar.interface'

export abstract class BaseAvatarGroup extends composeMixin(
    mixinDelegatesAria,
    mixinElementInternals
)(LitElement) implements IMDCAvatarGroup {

    public static override styles = AvatarGroupStyles

    @property({ type: String, reflect: true })
    public size: AvatarSize = 'medium'

    @property({ type: String, reflect: true })
    public shape: AvatarShape = 'round'

    @property({ type: Number, reflect: true })
    public max: number | null = null

    @property({ type: String, attribute: 'stack-order', reflect: true })
    public stackOrder: AvatarGroupStackOrder = 'start-on-top'

    @property({ type: Boolean, attribute: 'hover-expand', reflect: true })
    public hoverExpand: boolean = false

    @property({ type: Boolean, attribute: 'overflow-clickable', reflect: true })
    public overflowClickable: boolean = false

    @property({ type: String, attribute: 'overflow-label', reflect: true })
    public overflowLabel: string = ''

    @queryAssignedElements({ flatten: true })
    protected readonly slottedElements!: HTMLElement[]

    @state()
    private overflowCount: number = 0

    @state()
    private hasOverflowSlot: boolean = false

    @queryAssignedElements({ slot: 'overflow', flatten: true })
    private readonly overflowSlotElements!: HTMLElement[]

    private mutationObserver: MutationObserver | null = null
    private isSyncing: boolean = false

    public override connectedCallback(): void {
        super.connectedCallback()
        if (isServer) return

        if (!this.getAttribute('role')) {
            this.setAttribute('role', 'group')
        }

        this.mutationObserver = new MutationObserver(() => {
            if (!this.isSyncing) {
                this.syncAvatars()
            }
        })
        this.mutationObserver.observe(this, {
            childList: true,
            attributes: true,
            attributeFilter: ['size', 'shape'],
        })
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.mutationObserver?.disconnect()
        this.mutationObserver = null
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        if (
            changedProperties.has('size') ||
            changedProperties.has('shape') ||
            changedProperties.has('max') ||
            changedProperties.has('stackOrder')
        ) {
            this.syncAvatars()
        }
    }

    public getAvatars(): IMDCAvatar[] {
        const directChildren = Array.from(this.children).filter(
            (el): el is IMDCAvatar => el.tagName.toLowerCase() === 'mdc-avatar' && !el.hasAttribute('slot')
        )
        if (directChildren.length > 0) return directChildren
        return this.slottedElements.filter(
            (el): el is IMDCAvatar => el.tagName.toLowerCase() === 'mdc-avatar'
        )
    }

    public getVisibleAvatars(): IMDCAvatar[] {
        const avatars = this.getAvatars()
        if (this.max === null || this.max < 0 || !Number.isFinite(this.max)) {
            return avatars
        }
        return avatars.slice(0, Math.floor(this.max))
    }

    public getOverflowAvatars(): IMDCAvatar[] {
        const avatars = this.getAvatars()
        if (this.max === null || this.max < 0 || !Number.isFinite(this.max)) {
            return []
        }
        return avatars.slice(Math.floor(this.max))
    }

    protected syncAvatars(): void {
        if (this.isSyncing) return
        this.isSyncing = true
        try {
            const avatars = this.getAvatars()
            const limit = this.max !== null && Number.isFinite(this.max) && this.max >= 0
                ? Math.floor(this.max)
                : avatars.length

            const visibleCount = Math.min(avatars.length, limit)
            const hiddenCount = Math.max(0, avatars.length - visibleCount)
            this.overflowCount = hiddenCount
            this.toggleAttribute('data-has-overflow', hiddenCount > 0)

            avatars.forEach((avatar, index) => {
                const isHidden = index >= visibleCount
                avatar.toggleAttribute('data-group-hidden', isHidden)
                avatar.toggleAttribute('data-group-first', index === 0 && !isHidden)
                avatar.toggleAttribute('data-group-last', index === visibleCount - 1 && !isHidden)

                if (avatar.size !== this.size) {
                    avatar.size = this.size
                }
                if (avatar.shape !== this.shape) {
                    avatar.shape = this.shape
                }
            })
        } finally {
            this.isSyncing = false
        }
    }

    private handleSlotChange(): void {
        this.syncAvatars()
    }

    private handleOverflowSlotChange(): void {
        this.hasOverflowSlot = this.overflowSlotElements.length > 0
    }

    private handleOverflowClick(): void {
        if (!this.overflowClickable || this.overflowCount <= 0) return

        this.dispatchEvent(new CustomEvent<IMDCAvatarGroupOverflowClickDetail>(AvatarGroupOverflowClickEvent, {
            detail: {
                overflowCount: this.overflowCount,
                hiddenAvatars: this.getOverflowAvatars(),
            },
            bubbles: true,
            composed: true,
        }))
    }

    protected renderOverflowIndicator(): TemplateResult | typeof nothing {
        if (this.overflowCount <= 0 && !this.hasOverflowSlot) {
            return nothing
        }

        const label = this.overflowLabel.trim() || `+${this.overflowCount}`

        if (this.overflowClickable) {
            return html`
                <button
                    type="button"
                    class=${classMap({ 'overflow-indicator': true, clickable: true })}
                    part="overflow"
                    aria-label=${`${this.overflowCount} more`}
                    @click=${this.handleOverflowClick}
                >
                    <mdc-ripple></mdc-ripple>
                    <mdc-focus-ring></mdc-focus-ring>
                    <slot name="overflow" @slotchange=${this.handleOverflowSlotChange}>${label}</slot>
                </button>
            `
        }

        return html`
            <span class="overflow-indicator" part="overflow" aria-label=${`${this.overflowCount} more`}>
                <slot name="overflow" @slotchange=${this.handleOverflowSlotChange}>${label}</slot>
            </span>
        `
    }

    protected override render(): TemplateResult {
        return html`
            <div class="group" part="group">
                <slot @slotchange=${this.handleSlotChange}></slot>
                ${this.renderOverflowIndicator()}
            </div>
        `
    }
}
