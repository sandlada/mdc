/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, queryAssignedElements, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { mixinElementInternals } from '../../../utils/behaviors/element-internals'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import {
    BUTTON_GROUP_INTERACTION_EVENT,
    BUTTON_GROUP_SELECTION_EVENT,
    type ButtonGroupOrientation,
    type ButtonGroupSelectionMode,
    type ButtonGroupShape,
    type ButtonGroupSize,
    type ButtonGroupVariant,
    type IButtonGroup,
    type IButtonGroupSelectionEventDetail,
} from '../button-group.interface'
import { buttonGroupStyles } from '../button-group.style'

export abstract class BaseButtonGroup extends composeMixin(
    mixinDelegatesAria,
    mixinElementInternals,
)(LitElement) implements IButtonGroup {

    public static override styles = buttonGroupStyles

    @property({ type: String, reflect: true })
    public variant: ButtonGroupVariant = 'connected'

    @property({ type: String, attribute: 'selection-mode', reflect: true })
    public selectionMode: ButtonGroupSelectionMode = 'none'

    @property({ type: String, reflect: true })
    public size: ButtonGroupSize = 'small'

    @property({ type: String, reflect: true })
    public shape: ButtonGroupShape = 'round'

    @property({ type: String, reflect: true })
    public orientation: ButtonGroupOrientation = 'horizontal'

    @property({ type: Boolean, attribute: 'disable-morph', reflect: true })
    public disableMorph: boolean = false

    @property({ type: Boolean, attribute: 'expand-on-active', reflect: true })
    public expandOnActive: boolean = false

    @property({ type: Boolean, reflect: true })
    public disabled: boolean = false

    @queryAssignedElements({ flatten: true })
    protected readonly slottedElements!: HTMLElement[]

    @state()
    protected items: HTMLElement[] = []

    private mutationObserver: MutationObserver | null = null

    constructor() {
        super()
        if (isServer) return
        this.addEventListener('click', this.handleClick.bind(this))
        this.addEventListener('keydown', this.handleKeyDown.bind(this))
        this.addEventListener('change', this.handleChildChange.bind(this))
        this.addEventListener('input', this.handleChildInput.bind(this))
        this.addEventListener('mousedown', this.handlePressStart.bind(this))
        this.addEventListener('mouseup', this.handlePressEnd.bind(this))
        this.addEventListener('mouseleave', this.handlePressEnd.bind(this))
        this.addEventListener('touchstart', this.handlePressStart.bind(this), { passive: true })
        this.addEventListener('touchend', this.handlePressEnd.bind(this), { passive: true })
        this.addEventListener('touchcancel', this.handlePressEnd.bind(this), { passive: true })
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        if (!isServer) {
            this.mutationObserver = new MutationObserver(() => {
                this.syncItems()
            })
            this.mutationObserver.observe(this, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['checked', 'selected', 'disabled', 'value'],
            })
        }
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.mutationObserver?.disconnect()
        this.mutationObserver = null
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (
            changedProperties.has('variant') ||
            changedProperties.has('size') ||
            changedProperties.has('shape') ||
            changedProperties.has('orientation') ||
            changedProperties.has('disabled') ||
            changedProperties.has('selectionMode') ||
            changedProperties.has('expandOnActive')
        ) {
            this.syncItems()
            // Re-apply morph with the latest flag value (no pressed item)
            this.applyExpandOnActiveMorph(null)
        }
    }

    /** Returns all interactive child button items. */
    public getItems(): HTMLElement[] {
        return [...this.items]
    }

    /** Returns all currently selected items in the group. */
    public getSelectedItems(): HTMLElement[] {
        return this.items.filter((item) => this.isItemSelected(item))
    }

    /** Returns indices of all currently selected items in the group. */
    public getSelectedIndexes(): number[] {
        return this.items
            .map((item, idx) => (this.isItemSelected(item) ? idx : -1))
            .filter((idx) => idx !== -1)
    }

    /** Programmatically sets the selection state of a child at a given index. */
    public setIndexSelected(index: number, selected: boolean): void {
        if (index < 0 || index >= this.items.length) return
        const item = this.items[index]
        if (this.isItemDisabled(item)) return

        if (this.selectionMode === 'single') {
            if (selected) {
                for (let i = 0; i < this.items.length; i++) {
                    this.setItemSelected(this.items[i], i === index)
                }
            } else {
                this.setItemSelected(item, false)
            }
        } else if (this.selectionMode === 'multiple') {
            this.setItemSelected(item, selected)
        } else {
            this.setItemSelected(item, selected)
        }

        this.emitSelectionChange(item, index)
    }

    /** Programmatically toggles the selection state of a child at a given index. */
    public toggleIndexSelected(index: number): void {
        if (index < 0 || index >= this.items.length) return
        const current = this.isItemSelected(this.items[index])
        this.setIndexSelected(index, !current)
    }

    /** Sets the disabled state of a child at a given index. */
    public setIndexDisabled(index: number, disabled: boolean): void {
        if (index < 0 || index >= this.items.length) return
        const item = this.items[index] as HTMLElement & { disabled?: boolean }
        item.disabled = disabled
        if (disabled) {
            item.setAttribute('disabled', '')
        } else {
            item.removeAttribute('disabled')
        }
        this.syncItems()
    }

    protected getRenderClasses() {
        return {
            'container': true,
            [this.variant]: true,
            [this.size]: true,
            [this.shape]: true,
            [this.orientation]: true,
            'disable-morph': this.disableMorph,
            'expand-on-active': this.expandOnActive,
            'disabled': this.disabled,
        }
    }

    protected getAriaRole(): string {
        if (this.selectionMode === 'single') {
            return 'radiogroup'
        }
        return 'group'
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        return html`
            <div
                class="${classMap(this.getRenderClasses())}"
                role="${this.getAriaRole()}"
                aria-label="${ariaLabel || nothing}"
                aria-disabled="${this.disabled ? 'true' : 'false'}"
            >
                <slot @slotchange="${this.handleSlotChange}"></slot>
            </div>
        `
    }

    protected handleSlotChange = (): void => {
        this.syncItems()
    }

    private syncItems(): void {
        const elements = this.slottedElements.filter((el) => el instanceof HTMLElement)
        this.items = elements
        const count = elements.length

        elements.forEach((el, index) => {
            // Positional markers for connected corner radii
            let position: 'start' | 'middle' | 'end' | 'single' = 'single'
            if (count > 1) {
                if (index === 0) {
                    position = 'start'
                } else if (index === count - 1) {
                    position = 'end'
                } else {
                    position = 'middle'
                }
            }

            el.setAttribute('data-group-position', position)
            el.classList.toggle('start-side', position === 'start')
            el.classList.toggle('middle', position === 'middle')
            el.classList.toggle('end-side', position === 'end')
            el.classList.toggle('single', position === 'single')

            // Cascade size / shape / disabled to MDC elements if not explicitly set
            const mdcEl = el as HTMLElement & {
                size?: string
                shape?: string
                disabled?: boolean
            }
            if (mdcEl.size !== undefined && !el.hasAttribute('size')) {
                mdcEl.size = this.size
            }
            if (mdcEl.shape !== undefined && !el.hasAttribute('shape')) {
                mdcEl.shape = this.shape
            }
            if (this.disabled) {
                mdcEl.disabled = true
            }

            // Reflect selection state as `data-group-item-active` so CSS can
            // apply variant-conditional expand-on-active morphs without
            // relying on :has() — `::slotted()` is not a valid argument to
            // `:has()` in current Chromium.
            const isActive = this.isItemSelected(el)
            if (isActive) {
                el.setAttribute('data-group-item-active', '')
            } else {
                el.removeAttribute('data-group-item-active')
            }

            // Sync selection mode semantics if child is a toggle button
            if (this.selectionMode === 'single') {
                const toggleEl = el as HTMLElement & { type?: string }
                if (toggleEl.type !== undefined && !el.hasAttribute('type')) {
                    toggleEl.type = 'radio'
                }
            }
        })

        this.updateRovingTabindex()
    }

    private updateRovingTabindex(): void {
        const enabledItems = this.items.filter((item) => !this.isItemDisabled(item))
        if (enabledItems.length === 0) return

        let activeItem = enabledItems.find((item) => this.isItemSelected(item))
        if (!activeItem) {
            activeItem = enabledItems[0]
        }

        for (const item of this.items) {
            if (item === activeItem) {
                item.tabIndex = 0
            } else {
                item.tabIndex = -1
            }
        }
    }

    private handlePressStart = (e: Event): void => {
        if (this.disabled) return
        const target = (e.composedPath?.()[0] ?? e.target) as HTMLElement
        const item = this.findGroupItem(target)
        if (!item || this.isItemDisabled(item)) return
        // Reflect transient press as an attribute so CSS can match
        // without `:has( ::slotted() )`, which Chromium drops. The actual
        // flex-grow morph is applied by inline style here because
        // CSS attribute selectors with `:not()` are unreliable across
        // vendor versions for the priorities this morph needs.
        for (const other of this.items) {
            other.toggleAttribute('data-group-item-pressing', other === item)
        }
        this.applyExpandOnActiveMorph(item)
    }

    private handlePressEnd = (_e: Event): void => {
        for (const other of this.items) {
            other.removeAttribute('data-group-item-pressing')
        }
        this.applyExpandOnActiveMorph(null)
    }

    /**
     * Per spec, the standard variant morphs the pressed item AND its
     * adjacent siblings (width + shape), while the connected variant
     * morphs only the pressed item. We apply the flex-grow inline so we
     * can avoid the `:has( ::slotted(...) )` selector (silently dropped
     * by Chromium) and reliability across attribute-selector specificity.
     */
    private applyExpandOnActiveMorph(pressedItem: HTMLElement | null): void {
        if (!this.expandOnActive) {
            // Clear inline morph styles when the flag is off
            for (const item of this.items) {
                item.style.removeProperty('flex-grow')
            }
            return
        }

        const variant = this.variant
        const pressedIndex = pressedItem ? this.items.indexOf(pressedItem) : -1

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i]
            if (pressedIndex < 0) {
                item.style.removeProperty('flex-grow')
                continue
            }
            if (variant === 'standard') {
                if (i === pressedIndex) {
                    item.style.setProperty('flex-grow', '1.2')
                } else {
                    item.style.setProperty('flex-grow', '0.92')
                }
            } else {
                // Connected: only the pressed item grows
                if (i === pressedIndex) {
                    item.style.setProperty('flex-grow', '1.2')
                } else {
                    item.style.removeProperty('flex-grow')
                }
            }
        }
    }

    private handleClick(e: MouseEvent): void {
        if (this.disabled) {
            e.stopPropagation()
            e.preventDefault()
            return
        }

        const target = (e.composedPath?.()[0] ?? e.target) as HTMLElement
        const item = this.findGroupItem(target)
        if (!item || this.isItemDisabled(item)) return

        const index = this.items.indexOf(item)

        if (this.selectionMode === 'single') {
            // Radio button semantics: select clicked, deselect siblings
            for (let i = 0; i < this.items.length; i++) {
                this.setItemSelected(this.items[i], i === index)
            }
            this.emitSelectionChange(item, index)
        } else if (this.selectionMode === 'multiple') {
            // Checkbox semantics: toggle clicked item
            const current = this.isItemSelected(item)
            this.setItemSelected(item, !current)
            this.emitSelectionChange(item, index)
        } else {
            // Action group interaction
            this.dispatchEvent(new CustomEvent(BUTTON_GROUP_INTERACTION_EVENT, {
                detail: { item, index },
                bubbles: true,
                composed: true,
            }))
        }

        this.updateRovingTabindex()
    }

    private handleChildChange(e: Event): void {
        const target = e.target as HTMLElement
        const item = this.findGroupItem(target)
        if (!item) return
        const index = this.items.indexOf(item)
        if (this.selectionMode === 'single') {
            if (this.isItemSelected(item)) {
                for (let i = 0; i < this.items.length; i++) {
                    if (i !== index) {
                        this.setItemSelected(this.items[i], false)
                    }
                }
            }
        }
        this.emitSelectionChange(item, index)
    }

    private handleChildInput(e: Event): void {
        // Forwarded / handled via change event
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (this.disabled) return

        const isHorizontal = this.orientation === 'horizontal'
        const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp'
        const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown'

        if (![prevKey, nextKey, 'Home', 'End'].includes(e.key)) return

        const enabledItems = this.items.filter((item) => !this.isItemDisabled(item))
        if (enabledItems.length === 0) return

        const target = (e.composedPath?.()[0] ?? e.target) as HTMLElement
        const currentItem = this.findGroupItem(target)
        const currentIndex = currentItem ? enabledItems.indexOf(currentItem) : 0

        e.preventDefault()

        let nextItem: HTMLElement | undefined

        switch (e.key) {
            case prevKey:
                nextItem = enabledItems[(currentIndex - 1 + enabledItems.length) % enabledItems.length]
                break
            case nextKey:
                nextItem = enabledItems[(currentIndex + 1) % enabledItems.length]
                break
            case 'Home':
                nextItem = enabledItems[0]
                break
            case 'End':
                nextItem = enabledItems[enabledItems.length - 1]
                break
        }

        if (nextItem) {
            nextItem.focus()
            for (const item of this.items) {
                item.tabIndex = item === nextItem ? 0 : -1
            }
        }
    }

    private findGroupItem(target: HTMLElement): HTMLElement | null {
        let current: HTMLElement | null = target
        while (current && current !== this) {
            if (this.items.includes(current)) {
                return current
            }
            current = current.parentElement
        }
        return null
    }

    private isItemSelected(item: HTMLElement): boolean {
        const toggleEl = item as HTMLElement & { checked?: boolean; selected?: boolean }
        return Boolean(
            toggleEl.checked ??
            toggleEl.selected ??
            item.hasAttribute('checked') ??
            item.hasAttribute('selected')
        )
    }

    private setItemSelected(item: HTMLElement, selected: boolean): void {
        const toggleEl = item as HTMLElement & { checked?: boolean; selected?: boolean }
        if (toggleEl.checked !== undefined) {
            toggleEl.checked = selected
        }
        if (toggleEl.selected !== undefined) {
            toggleEl.selected = selected
        }
        if (selected) {
            item.setAttribute('checked', '')
            item.setAttribute('selected', '')
        } else {
            item.removeAttribute('checked')
            item.removeAttribute('selected')
        }
    }

    private isItemDisabled(item: HTMLElement): boolean {
        const disabledEl = item as HTMLElement & { disabled?: boolean }
        return Boolean(disabledEl.disabled || item.hasAttribute('disabled') || this.disabled)
    }

    private emitSelectionChange(item: HTMLElement, index: number): void {
        const itemVal = (item as HTMLElement & { value?: string }).value ?? item.getAttribute('value') ?? undefined
        const selected = this.isItemSelected(item)
        const selectedItems = this.getSelectedItems()
        const selectedIndexes = this.getSelectedIndexes()

        this.dispatchEvent(new CustomEvent<IButtonGroupSelectionEventDetail>(
            BUTTON_GROUP_SELECTION_EVENT,
            {
                detail: {
                    item,
                    selected,
                    index,
                    value: itemVal,
                    selectedItems,
                    selectedIndexes,
                },
                bubbles: true,
                composed: true,
            },
        ))
    }
}
