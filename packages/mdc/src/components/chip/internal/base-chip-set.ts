/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-chip-set` — groups `mdc-chip` elements,
 * manages roving tabindex (ArrowLeft/Right, Home/End, RTL-aware),
 * single-select / selection-required constraints, and multi-row vs single-line
 * layout.
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, queryAssignedElements } from 'lit/decorators.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import type { IMDCChip } from '../chip.interface'
import {
    ChipSetSelectionEvent,
    type IMDCChipSet,
    type IMDCChipSetSelectionEventDetail,
} from '../chip-set.interface'
import { ChipSetStyles } from '../chip-set.style'

const ChipSelector = 'mdc-chip'

export abstract class BaseChipSet extends composeMixin(
    mixinDelegatesAria
)(LitElement) implements IMDCChipSet {

    static override styles = ChipSetStyles

    /**
     * When `true`, at most one chip may be selected at a time.
     */
    @property({ type: Boolean, attribute: 'single-select', reflect: true })
    public singleSelect = false

    /**
     * Prevents deselecting the last remaining selected chip.
     */
    @property({ type: Boolean, attribute: 'selection-required', reflect: true })
    public selectionRequired = false

    /**
     * Lays out chips in a single horizontally scrollable row instead of wrapping.
     */
    @property({ type: Boolean, attribute: 'single-line', reflect: true })
    public singleLine = false

    @queryAssignedElements({ selector: ChipSelector, flatten: true })
    private readonly assignedChips!: IMDCChip[]

    private cachedChips: IMDCChip[] = []

    public get chips(): IMDCChip[] {
        return this.cachedChips
    }

    public get selectedChips(): IMDCChip[] {
        return this.cachedChips.filter((chip) => chip.selected)
    }

    public get selectedValues(): string[] {
        return this.selectedChips.map((chip) => chip.resolvedValue)
    }

    public constructor() {
        super()
        if (isServer) {
            return
        }
        this.addEventListener('keydown', this.handleKeydown)
        this.addEventListener('focusin', this.handleFocusIn)
        this.addEventListener('update-focus', this.handleUpdateFocus)
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (changedProperties.has('singleSelect') && this.singleSelect) {
            this.normalizeSingleSelect()
        }
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        return html`
            <div
                class="container"
                role="toolbar"
                aria-label=${ariaLabel || nothing}
                @chip-toggle=${this.handleChipToggle}
            >
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
        `
    }

    private normalizeSingleSelect(): void {
        if (!this.singleSelect) {
            return
        }
        let foundSelected = false
        for (const chip of this.cachedChips) {
            if (chip.selected) {
                if (foundSelected) {
                    chip.selected = false
                } else {
                    foundSelected = true
                }
            }
        }
    }

    private readonly handleSlotChange = (): void => {
        this.cachedChips = this.assignedChips
        this.normalizeSingleSelect()
        this.updateTabIndices()
    }

    private readonly handleFocusIn = (): void => {
        this.updateTabIndices()
    }

    private readonly handleUpdateFocus = (): void => {
        this.updateTabIndices()
    }

    private readonly handleChipToggle = (event: Event): void => {
        const chip = event.target as IMDCChip
        const index = this.cachedChips.indexOf(chip)
        if (index === -1) {
            return
        }

        // Guard selectionRequired when attempting to unselect the last selected chip
        if (this.selectionRequired && !chip.selected) {
            const anyOtherSelected = this.cachedChips.some(
                (other) => other !== chip && other.selected
            )
            if (!anyOtherSelected) {
                chip.selected = true
                event.stopImmediatePropagation()
                return
            }
        }

        if (this.singleSelect && chip.selected) {
            for (const other of this.cachedChips) {
                if (other !== chip && other.selected) {
                    other.selected = false
                }
            }
        }

        this.emitSelectionEvent(chip, index)
    }

    private readonly handleKeydown = (event: KeyboardEvent): void => {
        const chips = this.cachedChips
        if (chips.length < 2 || !chips.includes(event.target as IMDCChip)) {
            return
        }

        const isLeft = event.key === 'ArrowLeft'
        const isRight = event.key === 'ArrowRight'
        const isHome = event.key === 'Home'
        const isEnd = event.key === 'End'
        if (!isLeft && !isRight && !isHome && !isEnd) {
            return
        }
        event.preventDefault()

        const isRtl = getComputedStyle(this).direction === 'rtl'
        const forwards = isRtl ? isLeft : isRight
        let nextChip: IMDCChip | undefined

        if (isHome || isEnd) {
            nextChip = this.findNextFocusableChip(
                isHome ? 0 : chips.length - 1,
                isHome ? 1 : -1,
            )
        } else {
            const focusedIndex = chips.findIndex((chip) => chip.matches(':focus-within'))
            if (focusedIndex === -1) {
                nextChip = this.findNextFocusableChip(
                    forwards ? 0 : chips.length - 1,
                    forwards ? 1 : -1,
                )
            } else {
                nextChip = this.findNextFocusableChip(
                    focusedIndex + (forwards ? 1 : -1),
                    forwards ? 1 : -1,
                )
            }
        }

        if (nextChip) {
            nextChip.focus()
            this.updateTabIndices()
        }
    }

    /** Walk from `startIndex` in `step` direction (wrapping) for a focusable chip. */
    private findNextFocusableChip(startIndex: number, step: 1 | -1): IMDCChip | undefined {
        const chips = this.cachedChips
        for (let i = 0; i < chips.length; i++) {
            let index = startIndex + i * step
            index = ((index % chips.length) + chips.length) % chips.length
            const chip = chips[index]
            if (!chip.disabled || chip.alwaysFocusable) {
                return chip
            }
        }
        return undefined
    }

    private updateTabIndices(): void {
        const chips = this.cachedChips
        if (chips.length === 0) {
            return
        }

        const focusedChip = chips.find((chip) => chip.matches(':focus-within'))
        const focusedIsFocusable = focusedChip !== undefined &&
            (focusedChip.alwaysFocusable || !focusedChip.disabled)
        const firstFocusable = chips.find((chip) => chip.alwaysFocusable || !chip.disabled)
        const chipToFocus = focusedIsFocusable ? focusedChip : firstFocusable

        for (const chip of chips) {
            chip.chipTabIndex = chip === chipToFocus ? 0 : -1
        }
    }

    private emitSelectionEvent(chip: IMDCChip, index: number): void {
        this.dispatchEvent(new CustomEvent<IMDCChipSetSelectionEventDetail>(
            ChipSetSelectionEvent,
            {
                detail: { chip, selected: chip.selected, index },
                bubbles: true,
                composed: true,
            },
        ))
    }
}
