/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { computePosition, flip, offset, shift } from '@floating-ui/dom'
import { html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { OverlayController } from '../../utils/overlay'
import { TriggerController, TriggerKinds } from '../../utils/trigger'
import '../elevation/elevation'
import { mixinElevationOptions } from '../elevation/elevation-options.mixin'
import '../focus-ring/focus-ring'
import '../icon/icon'
import '../ripple/ripple'
import { PopoverDismissReasons, PopoverPlacements } from '../popover/popover.interface'
import {
    ContextMenuClosedEvent,
    ContextMenuEntryTypes,
    ContextMenuHidingEvent,
    ContextMenuOpenedEvent,
    ContextMenuSelectEvent,
    ContextMenuShowingEvent,
    ContextMenuTriggerModes,
    ContextMenuTriggerSources,
    ContextMenuVariants,
    type ContextMenuEntry,
    type ContextMenuInteractiveEntry,
    type IMDCContextMenu,
    type IMDCContextMenuLifecycleDetail,
    type IMDCContextMenuSelectDetail,
} from './context-menu.interface'
import { ContextMenuStyles } from './context-menu.style'
import {
    findEntryIndexByTypeahead,
    isInteractiveEntry,
    resolveKeyboardTriggerCoordinates,
    resolveNextEntryIndex,
    toggleContextMenuEntry,
} from './internal/context-menu-state'

const ValidVariants: readonly string[] = Object.values(ContextMenuVariants)
const ValidTriggerModes: readonly string[] = Object.values(ContextMenuTriggerModes)
const TypeaheadResetMs = 500
const ContextMenuOffsetPx = 2

const resolveContextTriggerKinds = (mode: ContextMenuTriggerModes): ReadonlyArray<TriggerKinds> => {
    switch (mode) {
        case ContextMenuTriggerModes.Auto:
            return [TriggerKinds.ContextMenu, TriggerKinds.LongPress, TriggerKinds.Keyboard]
        case ContextMenuTriggerModes.ContextMenu:
            return [TriggerKinds.ContextMenu, TriggerKinds.Keyboard]
        case ContextMenuTriggerModes.LongPress:
            return [TriggerKinds.LongPress]
        case ContextMenuTriggerModes.Manual:
            return []
    }
}

const mapTriggerKindToSource = (kind: TriggerKinds): ContextMenuTriggerSources => {
    switch (kind) {
        case TriggerKinds.ContextMenu:
            return ContextMenuTriggerSources.ContextMenu
        case TriggerKinds.LongPress:
            return ContextMenuTriggerSources.LongPress
        case TriggerKinds.Keyboard:
            return ContextMenuTriggerSources.Keyboard
        default:
            return ContextMenuTriggerSources.Programmatic
    }
}

/**
 * A Material Design 3 Context Menu component, modeled primarily after
 * Android (long-press + right-click + keyboard) and Flutter's `ContextMenuController`
 * global exclusivity.
 *
 * Separates Data/State (`internal/context-menu-state.ts`),
 * Behavior (`ContextTriggerController` + `PopoverBehaviorController`),
 * and UI (`context-menu.style.ts` + `context-menu.ts`).
 *
 * @element mdc-context-menu
 * @slot - Target region wrapped by the context menu.
 * @slot menu - Optional custom menu content overriding the data-driven `items` renderer.
 *
 * @fires context-menu-showing - Cancelable event before the menu opens.
 * @fires context-menu-opened - Dispatched after the menu has opened.
 * @fires context-menu-hiding - Cancelable event before the menu closes.
 * @fires context-menu-closed - Dispatched after the menu has closed.
 * @fires context-menu-select - Dispatched when an item is activated.
 */
@customElement('mdc-context-menu')
export class MDCContextMenu extends composeMixin(
    mixinDelegatesAria,
    mixinElevationOptions,
)(LitElement) implements IMDCContextMenu {

    static override styles = ContextMenuStyles

    @property({ type: Boolean, reflect: true })
    public open: boolean = false

    @property({ type: Array })
    public items: ReadonlyArray<ContextMenuEntry> = []

    @property({ type: String, reflect: true })
    public variant: ContextMenuVariants = ContextMenuVariants.Standard

    @property({ type: String, reflect: true })
    public placement: PopoverPlacements = PopoverPlacements.BottomStart

    @property({ type: String, reflect: true })
    public trigger: ContextMenuTriggerModes = ContextMenuTriggerModes.Auto

    @property({ type: Number, attribute: 'long-press-delay' })
    public longPressDelay: number = 500

    @property({ type: Boolean, reflect: true })
    public quick: boolean = false

    @property({ type: Boolean, reflect: true, attribute: 'close-on-select' })
    public closeOnSelect: boolean = true

    @property({ type: Boolean, reflect: true, attribute: 'close-on-scroll' })
    public closeOnScroll: boolean = true

    @property({ type: String, reflect: true })
    public for: string = ''

    @property({ type: String })
    public label: string | null = null

    @property({ type: Boolean, reflect: true })
    public pressing: boolean = false

    @state()
    private activeIndex: number = -1

    @state()
    private expandedSubmenuIds: ReadonlyArray<string> = []

    @state()
    private hasCustomMenuSlot: boolean = false

    @query('.target')
    private readonly targetWrapperElement!: HTMLElement | null

    @query('.surface')
    private readonly surfaceElement!: HTMLElement | null

    private lastTriggerSource: ContextMenuTriggerSources = ContextMenuTriggerSources.Programmatic
    private lastTriggerPoint: { x: number; y: number } | null = null
    private typeaheadBuffer: string = ''
    private typeaheadTimer: ReturnType<typeof setTimeout> | null = null

    private readonly triggerController = new TriggerController(this, {
        getKinds: () => resolveContextTriggerKinds(this.trigger),
        getLongPressDelay: () => this.longPressDelay,
        onPressingChange: (pressing) => {
            this.pressing = pressing
        },
        onOpen: ({ kind, x, y }) => {
            const source = mapTriggerKindToSource(kind)
            if (x !== undefined && y !== undefined) {
                void this.showAt(x, y, source)
            } else {
                void this.show()
            }
        },
    })

    private readonly behavior = new OverlayController(this, {
        getSurfaceElement: () => this.surfaceElement,
        getAnchorElement: () => this.resolveTargetElement(),
        getPlacement: () => this.placement,
        getOffset: () => ContextMenuOffsetPx,
        getDisableFlip: () => false,
        getQuick: () => this.quick,
        getCloseOnScroll: () => this.closeOnScroll,
        exclusiveGroup: 'mdc-context-menu',
        onOpenChange: (nextOpen) => {
            if (this.open !== nextOpen) {
                this.open = nextOpen
            }
            if (!nextOpen) {
                this.expandedSubmenuIds = []
                this.activeIndex = -1
            }
        },
        onBeforeShow: () => this.dispatchLifecycleEvent(ContextMenuShowingEvent, true),
        onShown: () => {
            this.focusFirstItem()
            this.dispatchLifecycleEvent(ContextMenuOpenedEvent, false)
        },
        onBeforeHide: (reason) => this.dispatchLifecycleEvent(ContextMenuHidingEvent, true, reason),
        onHidden: (reason) => {
            this.dispatchLifecycleEvent(ContextMenuClosedEvent, false, reason)
        },
    })

    public override connectedCallback(): void {
        super.connectedCallback()
        this.syncTriggerTarget()
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.clearTypeaheadTimer()
    }

    protected override firstUpdated(): void {
        this.syncTriggerTarget()
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)

        if (changedProperties.has('variant') && !ValidVariants.includes(this.variant)) {
            throw new Error(`Invalid mdc-context-menu variant "${this.variant}". Expected one of: ${ValidVariants.join(', ')}`)
        }
        if (changedProperties.has('trigger') && !ValidTriggerModes.includes(this.trigger)) {
            throw new Error(`Invalid mdc-context-menu trigger "${this.trigger}". Expected one of: ${ValidTriggerModes.join(', ')}`)
        }

        if (changedProperties.has('for')) {
            this.syncTriggerTarget()
        }

        if (changedProperties.has('open')) {
            if (this.open && !this.behavior.opened) {
                void this.show()
            } else if (!this.open && this.behavior.opened) {
                void this.behavior.hide(PopoverDismissReasons.Programmatic)
            }
        }
    }

    public async showAt(
        x: number,
        y: number,
        source: ContextMenuTriggerSources = ContextMenuTriggerSources.Programmatic,
    ): Promise<void> {
        this.lastTriggerSource = source
        this.lastTriggerPoint = { x, y }
        this.expandedSubmenuIds = []
        await this.behavior.showAt(x, y)
    }

    public async show(): Promise<void> {
        const target = this.resolveTargetElement()
        if (target && typeof document !== 'undefined') {
            const coords = resolveKeyboardTriggerCoordinates(target.getBoundingClientRect())
            await this.showAt(coords.x, coords.y, ContextMenuTriggerSources.Programmatic)
            return
        }
        this.lastTriggerSource = ContextMenuTriggerSources.Programmatic
        this.lastTriggerPoint = null
        await this.behavior.show()
    }

    public async hide(reason: PopoverDismissReasons = PopoverDismissReasons.Programmatic): Promise<void> {
        await this.behavior.hide(reason)
    }

    protected override render(): TemplateResult {
        const menuLabel = this.label ?? this.ariaLabel ?? undefined
        return html`
            <div class="target" part="target">
                <slot></slot>
            </div>
            <div
                class="surface"
                part="surface"
                role="menu"
                aria-label=${menuLabel ?? nothing}
                tabindex="-1"
                @keydown=${this.handleMenuKeyDown}
            >
                <mdc-elevation class="elevation"></mdc-elevation>
                <div class="list" role="none">
                    <slot name="menu" @slotchange=${this.handleMenuSlotChange}></slot>
                    ${this.hasCustomMenuSlot ? nothing : this.renderEntries(this.items)}
                </div>
            </div>
        `
    }

    private renderEntries(entries: ReadonlyArray<ContextMenuEntry>, isNested = false): TemplateResult[] {
        return entries.map((entry, index) => {
            if (entry.type === ContextMenuEntryTypes.Divider) {
                return html`<div class="menu-divider" role="separator"></div>`
            }
            if (entry.type === ContextMenuEntryTypes.Label) {
                return html`<div class="menu-label" role="presentation">${entry.label}</div>`
            }
            if (entry.type === ContextMenuEntryTypes.Submenu) {
                const isExpanded = this.expandedSubmenuIds.includes(entry.id)
                const isActive = !isNested && index === this.activeIndex
                return html`
                    <div
                        class="submenu-row"
                        role="none"
                        @pointerenter=${() => this.openSubmenu(entry.id)}
                    >
                        <button
                            type="button"
                            class=${classMap({
                                'menu-item': true,
                                'destructive': Boolean(entry.destructive),
                            })}
                            role="menuitem"
                            aria-haspopup="menu"
                            aria-expanded=${String(isExpanded)}
                            aria-disabled=${entry.disabled ? 'true' : 'false'}
                            tabindex=${isActive ? '0' : '-1'}
                            data-entry-id=${entry.id}
                            @click=${() => this.toggleSubmenu(entry.id)}
                        >
                            <mdc-ripple ?disabled=${Boolean(entry.disabled)}></mdc-ripple>
                            <mdc-focus-ring></mdc-focus-ring>
                            ${entry.icon ? html`<mdc-icon class="item-icon">${entry.icon}</mdc-icon>` : nothing}
                            <span class="item-label">${entry.label}</span>
                            <mdc-icon class="submenu-arrow">chevron_right</mdc-icon>
                        </button>
                        ${isExpanded ? html`
                            <div
                                class="submenu-surface"
                                role="menu"
                                aria-label=${entry.label}
                                data-submenu-for=${entry.id}
                            >
                                <mdc-elevation class="elevation"></mdc-elevation>
                                <div class="list" role="none">
                                    ${this.renderEntries(entry.children, true)}
                                </div>
                            </div>
                        ` : nothing}
                    </div>
                `
            }

            const role = entry.type === ContextMenuEntryTypes.Checkbox
                ? 'menuitemcheckbox'
                : entry.type === ContextMenuEntryTypes.Radio
                    ? 'menuitemradio'
                    : 'menuitem'

            const isCheckable = entry.type === ContextMenuEntryTypes.Checkbox || entry.type === ContextMenuEntryTypes.Radio
            const isChecked = isCheckable ? entry.checked : false
            const isActive = !isNested && index === this.activeIndex

            return html`
                <button
                    type="button"
                    class=${classMap({
                        'menu-item': true,
                        'destructive': Boolean(entry.destructive),
                    })}
                    role=${role}
                    aria-checked=${isCheckable ? String(isChecked) : nothing}
                    aria-disabled=${entry.disabled ? 'true' : 'false'}
                    aria-keyshortcuts=${entry.shortcut ?? nothing}
                    tabindex=${isActive ? '0' : '-1'}
                    data-entry-id=${entry.id}
                    @pointerenter=${() => {
                        if (!isNested && this.expandedSubmenuIds.length > 0) {
                            this.expandedSubmenuIds = []
                        }
                    }}
                    @click=${() => this.activateEntry(entry, index)}
                >
                    <mdc-ripple ?disabled=${Boolean(entry.disabled)}></mdc-ripple>
                    <mdc-focus-ring></mdc-focus-ring>
                    ${this.renderLeadingIndicator(entry)}
                    <span class="item-label">${entry.label}</span>
                    ${entry.shortcut ? html`<span class="item-shortcut" aria-hidden="true">${entry.shortcut}</span>` : nothing}
                </button>
            `
        })
    }

    private renderLeadingIndicator(entry: ContextMenuInteractiveEntry): TemplateResult | typeof nothing {
        if (entry.type === ContextMenuEntryTypes.Checkbox) {
            return entry.checked
                ? html`<mdc-icon class="item-indicator">check</mdc-icon>`
                : html`<span class="item-indicator-placeholder" aria-hidden="true"></span>`
        }
        if (entry.type === ContextMenuEntryTypes.Radio) {
            return html`<mdc-icon class="item-indicator">${entry.checked ? 'radio_button_checked' : 'radio_button_unchecked'}</mdc-icon>`
        }
        if (entry.icon) {
            return html`<mdc-icon class="item-icon">${entry.icon}</mdc-icon>`
        }
        return nothing
    }

    private activateEntry(entry: ContextMenuInteractiveEntry, index: number): void {
        if (entry.disabled) return
        this.activeIndex = index

        const isCheckable = entry.type === ContextMenuEntryTypes.Checkbox || entry.type === ContextMenuEntryTypes.Radio
        if (isCheckable) {
            this.items = toggleContextMenuEntry(entry.id)(this.items)
        }

        const updatedEntry = isCheckable
            ? ({ ...entry, checked: entry.type === ContextMenuEntryTypes.Radio ? true : !entry.checked } as ContextMenuInteractiveEntry)
            : entry

        this.dispatchEvent(new CustomEvent<IMDCContextMenuSelectDetail>(ContextMenuSelectEvent, {
            bubbles: true,
            composed: true,
            detail: {
                menu: this,
                item: updatedEntry,
                items: this.items,
            },
        }))

        if (this.closeOnSelect && !isCheckable) {
            void this.hide(PopoverDismissReasons.Programmatic)
        }
    }

    private openSubmenu(id: string): void {
        if (!this.expandedSubmenuIds.includes(id)) {
            this.expandedSubmenuIds = [id]
            void this.positionSubmenu(id)
        }
    }

    private toggleSubmenu(id: string): void {
        if (this.expandedSubmenuIds.includes(id)) {
            this.expandedSubmenuIds = this.expandedSubmenuIds.filter((item) => item !== id)
        } else {
            this.expandedSubmenuIds = [id]
            void this.positionSubmenu(id)
        }
    }

    private async positionSubmenu(id: string): Promise<void> {
        await this.updateComplete
        if (typeof document === 'undefined') return
        const escaped = typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(id) : id
        const trigger = this.shadowRoot?.querySelector<HTMLElement>(`[data-entry-id="${escaped}"]`)
        const submenu = this.shadowRoot?.querySelector<HTMLElement>(`[data-submenu-for="${escaped}"]`)
        if (!trigger || !submenu) return
        const { x, y } = await computePosition(trigger, submenu, {
            strategy: 'fixed',
            placement: 'right-start',
            middleware: [offset(4), flip(), shift({ padding: 8 })],
        })
        submenu.style.left = `${Math.round(x)}px`
        submenu.style.top = `${Math.round(y)}px`
    }

    private handleMenuSlotChange = (event: Event): void => {
        const slot = event.target as HTMLSlotElement
        this.hasCustomMenuSlot = slot.assignedNodes({ flatten: true }).length > 0
    }

    private handleMenuKeyDown = (event: KeyboardEvent): void => {
        if (this.hasCustomMenuSlot || this.items.length === 0) return

        switch (event.key) {
            case 'ArrowDown': {
                event.preventDefault()
                const next = resolveNextEntryIndex('next', this.activeIndex)(this.items)
                this.focusEntryAt(next)
                return
            }
            case 'ArrowUp': {
                event.preventDefault()
                const prev = resolveNextEntryIndex('previous', this.activeIndex)(this.items)
                this.focusEntryAt(prev)
                return
            }
            case 'Home': {
                event.preventDefault()
                const first = resolveNextEntryIndex('first', this.activeIndex)(this.items)
                this.focusEntryAt(first)
                return
            }
            case 'End': {
                event.preventDefault()
                const last = resolveNextEntryIndex('last', this.activeIndex)(this.items)
                this.focusEntryAt(last)
                return
            }
            case 'ArrowRight': {
                const current = this.items[this.activeIndex]
                if (current && current.type === ContextMenuEntryTypes.Submenu && !current.disabled) {
                    event.preventDefault()
                    this.openSubmenu(current.id)
                }
                return
            }
            case 'ArrowLeft': {
                const current = this.items[this.activeIndex]
                if (current && current.type === ContextMenuEntryTypes.Submenu && this.expandedSubmenuIds.includes(current.id)) {
                    event.preventDefault()
                    this.expandedSubmenuIds = this.expandedSubmenuIds.filter((id) => id !== current.id)
                }
                return
            }
            default: {
                if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                    this.typeaheadBuffer += event.key
                    this.resetTypeaheadTimer()
                    const match = findEntryIndexByTypeahead(this.typeaheadBuffer, this.activeIndex)(this.items)
                    if (match !== -1) {
                        this.focusEntryAt(match)
                    }
                }
            }
        }
    }

    private focusFirstItem(): void {
        if (this.hasCustomMenuSlot) {
            this.surfaceElement?.focus()
            return
        }
        const first = resolveNextEntryIndex('first', -1)(this.items)
        if (first !== -1) {
            this.focusEntryAt(first)
        } else {
            this.surfaceElement?.focus()
        }
    }

    private focusEntryAt(index: number): void {
        if (index < 0 || index >= this.items.length) return
        const entry = this.items[index]
        if (!isInteractiveEntry(entry)) return
        this.activeIndex = index
        void this.updateComplete.then(() => {
            const escaped = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
                ? CSS.escape(entry.id)
                : entry.id
            const el = this.shadowRoot?.querySelector<HTMLElement>(`[data-entry-id="${escaped}"]`)
            el?.focus()
        })
    }

    private resetTypeaheadTimer(): void {
        this.clearTypeaheadTimer()
        this.typeaheadTimer = setTimeout(() => {
            this.typeaheadBuffer = ''
            this.typeaheadTimer = null
        }, TypeaheadResetMs)
    }

    private clearTypeaheadTimer(): void {
        if (this.typeaheadTimer !== null) {
            clearTimeout(this.typeaheadTimer)
            this.typeaheadTimer = null
        }
    }

    private resolveTargetElement(): HTMLElement | null {
        if (typeof document !== 'undefined' && this.for) {
            const root = this.getRootNode()
            if (root instanceof Document || root instanceof ShadowRoot) {
                const escaped = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
                    ? CSS.escape(this.for)
                    : this.for
                const external = root.querySelector<HTMLElement>(`#${escaped}`)
                if (external) return external
            }
        }
        return this
    }

    private syncTriggerTarget(): void {
        this.triggerController.setTarget(this.resolveTargetElement())
    }

    private dispatchLifecycleEvent(
        name: string,
        cancelable: boolean,
        reason?: PopoverDismissReasons,
    ): boolean {
        const detail: IMDCContextMenuLifecycleDetail = {
            menu: this,
            source: this.lastTriggerSource,
            ...(this.lastTriggerPoint ? { x: this.lastTriggerPoint.x, y: this.lastTriggerPoint.y } : {}),
            ...(reason ? { reason } : {}),
        }
        return this.dispatchEvent(new CustomEvent<IMDCContextMenuLifecycleDetail>(name, {
            bubbles: true,
            composed: true,
            cancelable,
            detail,
        }))
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mdc-context-menu': MDCContextMenu
    }
}
