/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-chip-set` — the container that owns roving
 * tabindex and optional single-select coordination across its `mdc-chip`
 * children.
 *
 * Chips are self-managing views: each chip owns its own `selected` state and
 * reports activation through the `chip-toggle` event. The set enforces the
 * single-select mutex, re-emits committed changes as a composed
 * `chip-set-selection` event, and roves focus with Arrow keys / Home / End
 * (mirroring the Material Web chip-set semantics).
 */
import { html, isServer, LitElement, nothing, type TemplateResult } from 'lit'
import { property, queryAssignedElements } from 'lit/decorators.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { CHIP_TOGGLE_EVENT, type IChip } from '../chip.interface'
import {
    CHIP_SET_SELECTION_EVENT,
    type IChipSet,
    type IChipSetSelectionEventDetail,
} from '../chip-set.interface'
import { ChipSetStyles } from './chip-set.style'

/** Only `mdc-chip` children take part in the set. */
const CHIP_SELECTOR = 'mdc-chip'

export abstract class BaseChipSet extends composeMixin(
    mixinDelegatesAria
)(LitElement) implements IChipSet {

    static override styles = ChipSetStyles

    /**
     * When `true` at most one chip may be selected at a time (radio
     * semantics); otherwise any number of chips may be selected (checkbox
     * semantics).
     */
    @property({ type: Boolean, attribute: 'single-select', reflect: true })
    public singleSelect = false

    @queryAssignedElements({ selector: CHIP_SELECTOR, flatten: true })
    private readonly assignedChips!: IChip[]

    private cachedChips: IChip[] = []

    public get chips(): IChip[] {
        return this.cachedChips
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

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        return html`
            <span
                class="container"
                role="toolbar"
                aria-label=${ariaLabel || nothing}
                @chip-toggle=${this.handleChipToggle}
            >
                <slot @slotchange=${this.handleSlotChange}></slot>
            </span>
        `
    }

    private readonly handleSlotChange = (): void => {
        this.cachedChips = this.assignedChips
        if (this.singleSelect) {
            // Normalize the initial state: single-select keeps at most one chip.
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
        this.updateTabIndices()
    }

    private readonly handleFocusIn = (): void => {
        this.updateTabIndices()
    }

    private readonly handleUpdateFocus = (): void => {
        this.updateTabIndices()
    }

    private readonly handleChipToggle = (event: Event): void => {
        const chip = event.target as IChip
        const index = this.cachedChips.indexOf(chip)
        if (index === -1) {
            return
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
        if (chips.length < 2 || !chips.includes(event.target as IChip)) {
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
        let nextChip: IChip | undefined

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
    private findNextFocusableChip(startIndex: number, step: 1 | -1): IChip | undefined {
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

    private emitSelectionEvent(chip: IChip, index: number): void {
        this.dispatchEvent(new CustomEvent<IChipSetSelectionEventDetail>(
            CHIP_SET_SELECTION_EVENT,
            {
                detail: { chip, selected: chip.selected, index },
                bubbles: true,
                composed: true,
            },
        ))
    }
}
