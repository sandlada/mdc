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
    ButtonGroupInteractionEvent,
    ButtonGroupSelectionEvent,
    type ButtonGroupOrientation,
    type ButtonGroupSelectionMode,
    type ButtonGroupShape,
    type ButtonGroupSize,
    type ButtonGroupVariant,
    type IButtonGroupInteractionEventDetail,
    type IButtonGroupSelectionEventDetail,
    type IMDCButtonGroup,
} from '../button-group.interface'
import { ButtonGroupStyles } from '../button-group.style'

const ExpandedRatio = 0.15

export abstract class BaseButtonGroup extends composeMixin(
    mixinDelegatesAria,
    mixinElementInternals,
)(LitElement) implements IMDCButtonGroup {

    public static override styles = ButtonGroupStyles

    @property({ type: String, reflect: true })
    public variant: ButtonGroupVariant = 'connected'

    @property({ type: String, attribute: 'selection-mode', reflect: true })
    public selectionMode: ButtonGroupSelectionMode = 'none'

    @property({ type: Boolean, attribute: 'selection-required', reflect: true })
    public selectionRequired: boolean = false

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
    private changedItemInTick: HTMLElement | null = null
    private isSyncing = false

    constructor() {
        super()
        if (isServer) return
        this.addEventListener('click', this.handleClick.bind(this))
        this.addEventListener('keydown', this.handleKeyDown.bind(this))
        this.addEventListener('change', this.handleChildChange.bind(this))
        this.addEventListener('pointerdown', this.handlePressStart.bind(this))
        this.addEventListener('pointerup', this.handlePressEnd.bind(this))
        this.addEventListener('pointercancel', this.handlePressEnd.bind(this))
        this.addEventListener('pointerleave', this.handlePressEnd.bind(this))
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        if (!isServer) {
            this.mutationObserver = new MutationObserver(() => {
                if (!this.isSyncing) {
                    this.syncItems()
                }
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
            changedProperties.has('disableMorph') ||
            changedProperties.has('selectionMode') ||
            changedProperties.has('selectionRequired') ||
            changedProperties.has('expandOnActive')
        ) {
            this.syncItems()
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
            } else if (!this.selectionRequired) {
                this.setItemSelected(item, false)
            }
        } else {
            this.setItemSelected(item, selected)
        }

        this.syncActiveAttributes()
        this.updateRovingTabindex()
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
        this.isSyncing = true
        try {
            const elements = this.slottedElements.filter((el) => el instanceof HTMLElement)
            this.items = elements
            const count = elements.length

            elements.forEach((el, index) => {
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

                const mdcEl = el as HTMLElement & {
                    size?: string
                    shape?: string
                    disabled?: boolean
                    disableMorph?: boolean
                }
                if (mdcEl.size !== undefined && !el.hasAttribute('size')) {
                    mdcEl.size = this.size
                }
                if (mdcEl.shape !== undefined && !el.hasAttribute('shape')) {
                    mdcEl.shape = this.shape
                }
                if (mdcEl.disableMorph !== undefined && !el.hasAttribute('disable-morph')) {
                    mdcEl.disableMorph = this.disableMorph
                }
                if (this.disabled) {
                    mdcEl.disabled = true
                }
            })

            this.syncActiveAttributes()
            this.updateRovingTabindex()
        } finally {
            this.isSyncing = false
        }
    }

    private syncActiveAttributes(): void {
        for (const el of this.items) {
            const isActive = this.isItemSelected(el)
            if (isActive) {
                el.setAttribute('data-group-item-active', '')
            } else {
                el.removeAttribute('data-group-item-active')
            }
        }
    }

    private updateRovingTabindex(preferredItem?: HTMLElement): void {
        const enabledItems = this.items.filter((item) => !this.isItemDisabled(item))
        if (enabledItems.length === 0) {
            for (const item of this.items) {
                this.setItemTabIndex(item, -1)
            }
            return
        }

        let activeItem: HTMLElement | undefined =
            preferredItem && enabledItems.includes(preferredItem) ? preferredItem : undefined

        if (!activeItem) {
            activeItem = enabledItems.find((item) => {
                if (typeof document !== 'undefined' && document.activeElement === item) return true
                return item.matches?.(':focus-within') ?? false
            })
        }

        if (!activeItem) {
            activeItem = enabledItems.find((item) => this.isItemSelected(item)) ?? enabledItems[0]
        }

        for (const item of this.items) {
            this.setItemTabIndex(item, item === activeItem ? 0 : -1)
        }
    }

    private setItemTabIndex(item: HTMLElement, tabIndex: number): void {
        item.tabIndex = tabIndex
        if (item.shadowRoot && !item.shadowRoot.delegatesFocus) {
            const inner = item.shadowRoot.querySelector<HTMLElement>('button, a[href], input')
            if (inner) {
                inner.tabIndex = tabIndex
            }
        }
    }

    private focusGroupItem(item: HTMLElement): void {
        if (item.shadowRoot && !item.shadowRoot.delegatesFocus) {
            const inner = item.shadowRoot.querySelector<HTMLElement>(
                'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
            )
            if (inner) {
                inner.focus()
                return
            }
        }
        item.focus()
    }

    private handlePressStart = (e: PointerEvent): void => {
        if (this.disabled) return
        if (e.button !== 0 && e.pointerType === 'mouse') return
        const item = this.findGroupItemFromEvent(e)
        if (!item || this.isItemDisabled(item)) return

        for (const other of this.items) {
            other.toggleAttribute('data-group-item-pressing', other === item)
        }
        this.applyExpandOnActiveMorph(item)
    }

    private handlePressEnd = (): void => {
        for (const other of this.items) {
            other.removeAttribute('data-group-item-pressing')
        }
        this.applyExpandOnActiveMorph(null)
    }

    /**
     * Per Material 3 Expressive Button Group spec (`ButtonGroupDefaults.ExpandedRatio = 0.15`),
     * pressing an item expands its primary-axis size by 15% and, in the `standard` variant,
     * compresses adjacent neighbors proportionally so total group size remains stable.
     */
    private applyExpandOnActiveMorph(pressedItem: HTMLElement | null): void {
        const prop = this.orientation === 'horizontal' ? 'width' : 'height'

        if (!this.expandOnActive || !pressedItem) {
            for (const item of this.items) {
                item.style.removeProperty('width')
                item.style.removeProperty('height')
            }
            return
        }

        const pressedIndex = this.items.indexOf(pressedItem)
        if (pressedIndex < 0) return

        // Measure natural dimensions before applying inline overrides
        const sizes = this.items.map((item) => {
            const rect = item.getBoundingClientRect()
            return this.orientation === 'horizontal' ? rect.width : rect.height
        })

        const pressedSize = sizes[pressedIndex]
        if (pressedSize <= 0) return

        const delta = Math.round(pressedSize * ExpandedRatio * 10) / 10

        const neighbors: number[] = []
        if (this.variant === 'standard') {
            if (pressedIndex - 1 >= 0) neighbors.push(pressedIndex - 1)
            if (pressedIndex + 1 < this.items.length) neighbors.push(pressedIndex + 1)
        }

        const neighborShrink = neighbors.length > 0 ? delta / neighbors.length : 0

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i]
            if (i === pressedIndex) {
                item.style.setProperty(prop, `${pressedSize + delta}px`)
            } else if (neighbors.includes(i) && sizes[i] > neighborShrink) {
                item.style.setProperty(prop, `${sizes[i] - neighborShrink}px`)
            } else {
                item.style.removeProperty(prop)
            }
        }
    }

    private handleClick(e: MouseEvent): void {
        if (this.disabled) {
            e.stopPropagation()
            e.preventDefault()
            return
        }

        const item = this.findGroupItemFromEvent(e)
        if (!item || this.isItemDisabled(item)) return

        const index = this.items.indexOf(item)

        // If `change` already handled this item in the same event tick, avoid double-toggling/emitting.
        if (this.changedItemInTick === item) {
            this.changedItemInTick = null
            this.updateRovingTabindex(item)
            return
        }

        const selfToggling = this.isSelfTogglingItem(item)

        if (this.selectionMode === 'single') {
            if (selfToggling) {
                const nowSelected = this.isItemSelected(item)
                if (nowSelected) {
                    for (let i = 0; i < this.items.length; i++) {
                        if (i !== index) {
                            this.setItemSelected(this.items[i], false)
                        }
                    }
                } else if (this.selectionRequired) {
                    this.setItemSelected(item, true)
                    this.syncActiveAttributes()
                    this.updateRovingTabindex(item)
                    return
                }
            } else {
                const currentlySelected = this.isItemSelected(item)
                if (currentlySelected && this.selectionRequired) {
                    this.updateRovingTabindex(item)
                    return
                }
                for (let i = 0; i < this.items.length; i++) {
                    this.setItemSelected(this.items[i], i === index ? !currentlySelected : false)
                }
            }
            this.syncActiveAttributes()
            this.emitSelectionChange(item, index)
        } else if (this.selectionMode === 'multiple') {
            if (!selfToggling) {
                const current = this.isItemSelected(item)
                this.setItemSelected(item, !current)
            }
            this.syncActiveAttributes()
            this.emitSelectionChange(item, index)
        } else {
            this.dispatchEvent(new CustomEvent<IButtonGroupInteractionEventDetail>(ButtonGroupInteractionEvent, {
                detail: { item, index },
                bubbles: true,
                composed: true,
            }))
        }

        this.updateRovingTabindex(item)
    }

    private handleChildChange(e: Event): void {
        if (this.selectionMode === 'none') return
        const item = this.findGroupItemFromEvent(e)
        if (!item) return

        this.changedItemInTick = item
        queueMicrotask(() => {
            if (this.changedItemInTick === item) {
                this.changedItemInTick = null
            }
        })

        const index = this.items.indexOf(item)
        const nowSelected = this.isItemSelected(item)

        if (this.selectionMode === 'single') {
            if (nowSelected) {
                for (let i = 0; i < this.items.length; i++) {
                    if (i !== index) {
                        this.setItemSelected(this.items[i], false)
                    }
                }
            } else if (this.selectionRequired) {
                this.setItemSelected(item, true)
                this.syncActiveAttributes()
                this.updateRovingTabindex(item)
                return
            }
        }

        this.syncActiveAttributes()
        this.updateRovingTabindex(item)
        this.emitSelectionChange(item, index)
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (this.disabled) return

        const isHorizontal = this.orientation === 'horizontal'
        const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp'
        const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown'

        if (![prevKey, nextKey, 'Home', 'End'].includes(e.key)) return

        const enabledItems = this.items.filter((item) => !this.isItemDisabled(item))
        if (enabledItems.length === 0) return

        const currentItem = this.findGroupItemFromEvent(e)
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
            this.updateRovingTabindex(nextItem)
            this.focusGroupItem(nextItem)
        }
    }

    private findGroupItemFromEvent(e: Event): HTMLElement | null {
        const path = e.composedPath?.() ?? []
        for (const node of path) {
            if (this.items.includes(node as HTMLElement)) {
                return node as HTMLElement
            }
        }
        const target = e.target as HTMLElement | null
        return target ? this.findGroupItem(target) : null
    }

    private isSelfTogglingItem(item: HTMLElement): boolean {
        const tag = item.tagName?.toLowerCase()
        if (tag === 'mdc-toggle-button') return true
        if (tag === 'mdc-icon-button' && (item.hasAttribute('togglable') || (item as HTMLElement & { togglable?: boolean }).togglable)) {
            return true
        }
        if (tag === 'input') {
            const type = (item as HTMLInputElement).type
            return type === 'checkbox' || type === 'radio'
        }
        return false
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
        if (typeof toggleEl.checked === 'boolean') return toggleEl.checked
        if (typeof toggleEl.selected === 'boolean') return toggleEl.selected
        return item.hasAttribute('checked') || item.hasAttribute('selected')
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
            ButtonGroupSelectionEvent,
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
