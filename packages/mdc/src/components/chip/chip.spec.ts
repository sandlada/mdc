/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
    AssistChipDefinition,
    ChipCloseEvent,
    ChipNavigateEvent,
    ChipSetDefinition,
    ChipSetSelectionEvent,
    ChipToggleEvent,
    ChipVariant,
    FilterChipDefinition,
    InputChipDefinition,
    MDCChip,
    MDCChipSet,
    SuggestionChipDefinition,
    type IMDCChip,
    type IMDCChipCloseEventDetail,
    type IMDCChipNavigateEventDetail,
    type IMDCChipSetSelectionEventDetail,
    type IMDCChipToggleEventDetail,
} from './index'

interface ChipTestInternals {
    getRole(): 'checkbox' | 'button' | 'link'
    getRenderClasses(): Record<string, boolean>
    render(): { strings: TemplateStringsArray; values: unknown[] }
    willUpdate(changed: Map<PropertyKey, unknown>): void
    updated(changed: Map<PropertyKey, unknown>): void
    handlePrimaryClick(event: MouseEvent): void
    handleTrailingActionClick(event: MouseEvent): void
    handlePrimaryKeydown(event: KeyboardEvent): void
    handleTrailingKeydown(event: KeyboardEvent): void
    handleCheckmarkAnimationEnd(event: AnimationEvent): void
    animState: '' | 'selecting' | 'deselecting'
    iconOpacityController: unknown
    checkmarkOpacityController: unknown
    trailingIconOpacityController: unknown
}

interface ChipSetTestInternals {
    cachedChips: IMDCChip[]
    updated(changed: Map<PropertyKey, unknown>): void
    handleChipToggle(event: Event): void
    handleKeydown(event: KeyboardEvent): void
    updateTabIndices(): void
}

const asChipInternals = (chip: MDCChip): ChipTestInternals =>
    chip as unknown as ChipTestInternals

const asSetInternals = (set: MDCChipSet): ChipSetTestInternals =>
    set as unknown as ChipSetTestInternals

const makeMouseEvent = (): { event: MouseEvent; prevented: () => boolean; stopped: () => boolean } => {
    let prevented = false
    let stopped = false
    const event = {
        preventDefault: (): void => { prevented = true },
        stopPropagation: (): void => { stopped = true },
    } as unknown as MouseEvent
    return {
        event,
        prevented: () => prevented,
        stopped: () => stopped,
    }
}

const makeKeyEvent = (
    key: string,
    target?: EventTarget,
): { event: KeyboardEvent; prevented: () => boolean; stopped: () => boolean } => {
    let prevented = false
    let stopped = false
    const event = {
        key,
        target,
        preventDefault: (): void => { prevented = true },
        stopPropagation: (): void => { stopped = true },
    } as unknown as KeyboardEvent
    return {
        event,
        prevented: () => prevented,
        stopped: () => stopped,
    }
}

const flattenTemplateMarkup = (result: { strings: ReadonlyArray<string>; values: ReadonlyArray<unknown> }): string => {
    let output = ''
    for (let i = 0; i < result.strings.length; i++) {
        output += result.strings[i]
        if (i < result.values.length) {
            const val = result.values[i]
            if (val && typeof val === 'object' && 'strings' in val && 'values' in val) {
                output += flattenTemplateMarkup(val as { strings: ReadonlyArray<string>; values: ReadonlyArray<unknown> })
            }
        }
    }
    return output
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('MDCChip exports & definitions', () => {
    it('exports all four Material 3 chip variants and style definitions', () => {
        expect(ChipVariant.Assist).toBe('assist')
        expect(ChipVariant.Filter).toBe('filter')
        expect(ChipVariant.Input).toBe('input')
        expect(ChipVariant.Suggestion).toBe('suggestion')

        expect(AssistChipDefinition).toBeDefined()
        expect(FilterChipDefinition).toBeDefined()
        expect(InputChipDefinition).toBeDefined()
        expect(SuggestionChipDefinition).toBeDefined()
        expect(ChipSetDefinition).toBeDefined()
    })
})

describe('MDCChip defaults, labels, and state classes', () => {
    it('instantiates with expected defaults', () => {
        const chip = new MDCChip()
        expect(chip.variant).toBe('assist')
        expect(chip.selected).toBe(false)
        expect(chip.disabled).toBe(false)
        expect(chip.softDisabled).toBe(false)
        expect(chip.alwaysFocusable).toBe(false)
        expect(chip.elevated).toBe(false)
        expect(chip.href).toBe('')
        expect(chip.target).toBe('')
        expect(chip.label).toBe('')
        expect(chip.value).toBe('')
        expect(chip.avatar).toBe(false)
        expect(chip.ariaLabelRemove).toBe('')
        expect(chip.removeOnly).toBe(false)
        expect(chip.noRemove).toBe(false)
        expect(chip.hideCheckmark).toBe(false)
        expect(chip.chipTabIndex).toBe(0)
        expect(chip.hasIcon).toBe(false)
        expect(chip.hasAvatar).toBe(false)
        expect(chip.hasTrailingIcon).toBe(false)
        expect(chip.hasSelectedIcon).toBe(false)
        expect(chip.hasLabel).toBe(false)
        expect(chip.effectiveLabel).toBe('')
        expect(chip.resolvedValue).toBe('')
        expect(asChipInternals(chip).getRole()).toBe('button')
    })

    it('derives hasLabel, effectiveLabel, and resolvedValue from label and value', () => {
        const chip = new MDCChip()
        chip.label = 'Filters'
        expect(chip.hasLabel).toBe(true)
        expect(chip.effectiveLabel).toBe('Filters')
        expect(chip.resolvedValue).toBe('Filters')

        chip.value = 'filter_id_1'
        expect(chip.effectiveLabel).toBe('Filters')
        expect(chip.resolvedValue).toBe('filter_id_1')
    })

    it('treats avatar=true with hasIcon=true as hasAvatar', () => {
        const chip = new MDCChip()
        chip.variant = ChipVariant.Input
        chip.avatar = true
        expect(chip.hasAvatar).toBe(false)

        chip.hasIcon = true
        expect(chip.hasAvatar).toBe(true)
        expect(asChipInternals(chip).getRenderClasses()['has-avatar']).toBe(true)
    })

    it('computes variant-appropriate ARIA roles and render classes', () => {
        const assist = new MDCChip()
        expect(asChipInternals(assist).getRole()).toBe('button')
        assist.href = 'https://example.com'
        expect(asChipInternals(assist).getRole()).toBe('link')

        const filter = new MDCChip()
        filter.variant = ChipVariant.Filter
        expect(asChipInternals(filter).getRole()).toBe('checkbox')

        filter.selected = true
        expect(asChipInternals(filter).getRenderClasses()['has-leading']).toBe(true)

        filter.hideCheckmark = true
        expect(asChipInternals(filter).getRenderClasses()['has-leading']).toBe(false)

        const input = new MDCChip()
        input.variant = ChipVariant.Input
        expect(asChipInternals(input).getRole()).toBe('button')
        expect(asChipInternals(input).getRenderClasses()['has-trailing-action']).toBe(true)

        input.noRemove = true
        expect(asChipInternals(input).getRenderClasses()['has-trailing-action']).toBe(false)

        input.removeOnly = true
        expect(asChipInternals(input).getRenderClasses()['has-trailing-action']).toBe(true)
    })

    it('tracks selecting and deselecting animation state across updates and animationend', () => {
        const chip = new MDCChip()
        chip.variant = ChipVariant.Filter

        chip.selected = true
        asChipInternals(chip).willUpdate(new Map([['selected', false]]))
        expect(asChipInternals(chip).animState).toBe('selecting')

        // Intermediate expand animation does not cut off draw-in for default SVG checkmark
        asChipInternals(chip).handleCheckmarkAnimationEnd({ animationName: 'chip-checkmark-expand' } as AnimationEvent)
        expect(asChipInternals(chip).animState).toBe('selecting')

        asChipInternals(chip).handleCheckmarkAnimationEnd({ animationName: 'chip-checkmark-draw-in' } as AnimationEvent)
        expect(asChipInternals(chip).animState).toBe('')

        chip.selected = false
        asChipInternals(chip).willUpdate(new Map([['selected', true]]))
        expect(asChipInternals(chip).animState).toBe('deselecting')

        asChipInternals(chip).handleCheckmarkAnimationEnd({ animationName: 'chip-checkmark-collapse' } as AnimationEvent)
        expect(asChipInternals(chip).animState).toBe('')

        // With leading icon, deselect swaps checkmark for icon directly without collapsing width
        chip.hasIcon = true
        chip.selected = false
        asChipInternals(chip).willUpdate(new Map([['selected', true]]))
        expect(asChipInternals(chip).animState).toBe('')
    })

    it('attaches OpacityTransitionController instances for chip icons', () => {
        const chip = new MDCChip()
        const internals = asChipInternals(chip)
        expect(internals.iconOpacityController).toBeDefined()
        expect(internals.checkmarkOpacityController).toBeDefined()
        expect(internals.trailingIconOpacityController).toBeDefined()
    })

    it('renders split sibling actions (no nested buttons) for removable input chips', () => {
        const chip = new MDCChip()
        chip.variant = ChipVariant.Input
        chip.label = 'Alex'
        const markup = flattenTemplateMarkup(asChipInternals(chip).render())

        expect(markup).toContain('class="primary-action"')
        expect(markup).toContain('class="trailing-action"')
        expect(markup.indexOf('</button>')).toBeLessThan(markup.indexOf('class="trailing-action"'))

        chip.removeOnly = true
        const removeOnlyMarkup = flattenTemplateMarkup(asChipInternals(chip).render())
        expect(removeOnlyMarkup).toContain('class="primary-content"')
        expect(removeOnlyMarkup).toContain('class="trailing-action"')
        expect(removeOnlyMarkup).not.toContain('class="primary-action"')
    })
})

describe('MDCChip interactions and events', () => {
    it('dispatches chip-navigate without toggling for assist and suggestion chips', () => {
        for (const variant of [ChipVariant.Assist, ChipVariant.Suggestion]) {
            const chip = new MDCChip()
            chip.variant = variant
            const navigated: IMDCChipNavigateEventDetail[] = []
            const toggled: IMDCChipToggleEventDetail[] = []
            chip.addEventListener(ChipNavigateEvent, (e) => {
                navigated.push((e as CustomEvent<IMDCChipNavigateEventDetail>).detail)
            })
            chip.addEventListener(ChipToggleEvent, (e) => {
                toggled.push((e as CustomEvent<IMDCChipToggleEventDetail>).detail)
            })

            asChipInternals(chip).handlePrimaryClick(makeMouseEvent().event)
            expect(chip.selected).toBe(false)
            expect(toggled).toHaveLength(0)
            expect(navigated).toHaveLength(1)
            expect(navigated[0].chip).toBe(chip)
        }
    })

    it('toggles selected and dispatches chip-toggle for filter chips', () => {
        const chip = new MDCChip()
        chip.variant = ChipVariant.Filter
        const details: IMDCChipToggleEventDetail[] = []
        chip.addEventListener(ChipToggleEvent, (e) => {
            details.push((e as CustomEvent<IMDCChipToggleEventDetail>).detail)
        })

        asChipInternals(chip).handlePrimaryClick(makeMouseEvent().event)
        expect(chip.selected).toBe(true)
        expect(details[0]).toEqual({ selected: true, chip })

        asChipInternals(chip).handlePrimaryClick(makeMouseEvent().event)
        expect(chip.selected).toBe(false)
        expect(details[1]).toEqual({ selected: false, chip })
    })

    it('supports input chip toggle, remove action, removeOnly, and Delete/Backspace close', () => {
        const chip = new MDCChip()
        chip.variant = ChipVariant.Input
        const closed: IMDCChipCloseEventDetail[] = []
        const toggled: IMDCChipToggleEventDetail[] = []
        chip.addEventListener(ChipCloseEvent, (e) => {
            closed.push((e as CustomEvent<IMDCChipCloseEventDetail>).detail)
        })
        chip.addEventListener(ChipToggleEvent, (e) => {
            toggled.push((e as CustomEvent<IMDCChipToggleEventDetail>).detail)
        })

        asChipInternals(chip).handlePrimaryClick(makeMouseEvent().event)
        expect(chip.selected).toBe(true)
        expect(toggled).toHaveLength(1)

        const trailingClick = makeMouseEvent()
        asChipInternals(chip).handleTrailingActionClick(trailingClick.event)
        expect(trailingClick.stopped()).toBe(true)
        expect(closed).toHaveLength(1)
        expect(closed[0].chip).toBe(chip)
        expect(chip.selected).toBe(true)

        const delKey = makeKeyEvent('Delete')
        asChipInternals(chip).handlePrimaryKeydown(delKey.event)
        expect(delKey.prevented()).toBe(true)
        expect(closed).toHaveLength(2)

        const backspaceKey = makeKeyEvent('Backspace')
        asChipInternals(chip).handleTrailingKeydown(backspaceKey.event)
        expect(backspaceKey.prevented()).toBe(true)
        expect(closed).toHaveLength(3)

        chip.noRemove = true
        const nonRemovableDel = makeKeyEvent('Delete')
        asChipInternals(chip).handlePrimaryKeydown(nonRemovableDel.event)
        expect(nonRemovableDel.prevented()).toBe(false)
        expect(closed).toHaveLength(3)

        chip.noRemove = false
        chip.removeOnly = true
        asChipInternals(chip).handlePrimaryClick(makeMouseEvent().event)
        expect(toggled).toHaveLength(1)

        chip.close()
        expect(closed).toHaveLength(4)
    })

    it('suppresses activation and close when disabled or softDisabled', () => {
        for (const mode of ['disabled', 'softDisabled'] as const) {
            const chip = new MDCChip()
            chip.variant = ChipVariant.Input
            chip[mode] = true

            const toggled: Event[] = []
            const closed: Event[] = []
            chip.addEventListener(ChipToggleEvent, (e) => toggled.push(e))
            chip.addEventListener(ChipCloseEvent, (e) => closed.push(e))

            const primaryClick = makeMouseEvent()
            asChipInternals(chip).handlePrimaryClick(primaryClick.event)
            expect(primaryClick.prevented()).toBe(true)
            expect(primaryClick.stopped()).toBe(true)

            const trailingClick = makeMouseEvent()
            asChipInternals(chip).handleTrailingActionClick(trailingClick.event)
            expect(trailingClick.prevented()).toBe(true)
            expect(trailingClick.stopped()).toBe(true)

            const enterKey = makeKeyEvent('Enter')
            asChipInternals(chip).handlePrimaryKeydown(enterKey.event)
            expect(enterKey.prevented()).toBe(true)

            const spaceTrailing = makeKeyEvent(' ')
            asChipInternals(chip).handleTrailingKeydown(spaceTrailing.event)
            expect(spaceTrailing.prevented()).toBe(true)

            chip.close()
            expect(toggled).toHaveLength(0)
            expect(closed).toHaveLength(0)
            expect(chip.selected).toBe(false)
        }
    })
})

describe('MDCChipSet selection and keyboard navigation', () => {
    const createMockChip = (opts: { label: string; value?: string; selected?: boolean; disabled?: boolean; alwaysFocusable?: boolean }): MDCChip => {
        const chip = new MDCChip()
        chip.variant = ChipVariant.Filter
        chip.label = opts.label
        chip.value = opts.value ?? ''
        chip.selected = opts.selected ?? false
        chip.disabled = opts.disabled ?? false
        chip.alwaysFocusable = opts.alwaysFocusable ?? false
        ;(chip as unknown as { matches: (sel: string) => boolean }).matches = () => false
        ;(chip as unknown as { focus: () => void }).focus = vi.fn()
        return chip
    }

    it('instantiates with defaults and computes selectedChips / selectedValues', () => {
        const set = new MDCChipSet()
        expect(set.singleSelect).toBe(false)
        expect(set.selectionRequired).toBe(false)
        expect(set.singleLine).toBe(false)
        expect(set.chips).toEqual([])
        expect(set.selectedChips).toEqual([])
        expect(set.selectedValues).toEqual([])

        const c1 = createMockChip({ label: 'One', value: 'v1', selected: true })
        const c2 = createMockChip({ label: 'Two', selected: false })
        const c3 = createMockChip({ label: 'Three', selected: true })
        asSetInternals(set).cachedChips = [c1, c2, c3]

        expect(set.selectedChips).toEqual([c1, c3])
        expect(set.selectedValues).toEqual(['v1', 'Three'])
    })

    it('enforces singleSelect when toggled and when singleSelect turns true', () => {
        const set = new MDCChipSet()
        set.singleSelect = true
        const c1 = createMockChip({ label: 'A', selected: true })
        const c2 = createMockChip({ label: 'B', selected: false })
        asSetInternals(set).cachedChips = [c1, c2]

        const selectionEvents: IMDCChipSetSelectionEventDetail[] = []
        set.addEventListener(ChipSetSelectionEvent, (e) => {
            selectionEvents.push((e as CustomEvent<IMDCChipSetSelectionEventDetail>).detail)
        })

        c2.selected = true
        asSetInternals(set).handleChipToggle({ target: c2, stopImmediatePropagation: vi.fn() } as unknown as Event)

        expect(c1.selected).toBe(false)
        expect(c2.selected).toBe(true)
        expect(selectionEvents).toEqual([{ chip: c2, selected: true, index: 1 }])

        c1.selected = true
        c2.selected = true
        asSetInternals(set).updated(new Map([['singleSelect', false]]))
        expect(c1.selected).toBe(true)
        expect(c2.selected).toBe(false)
    })

    it('prevents deselecting the last selected chip when selectionRequired is true', () => {
        const set = new MDCChipSet()
        set.selectionRequired = true
        const c1 = createMockChip({ label: 'A', selected: true })
        const c2 = createMockChip({ label: 'B', selected: false })
        asSetInternals(set).cachedChips = [c1, c2]

        const selectionEvents: IMDCChipSetSelectionEventDetail[] = []
        set.addEventListener(ChipSetSelectionEvent, (e) => {
            selectionEvents.push((e as CustomEvent<IMDCChipSetSelectionEventDetail>).detail)
        })

        c1.selected = false
        const stopImmediatePropagation = vi.fn()
        asSetInternals(set).handleChipToggle({ target: c1, stopImmediatePropagation } as unknown as Event)

        expect(c1.selected).toBe(true)
        expect(stopImmediatePropagation).toHaveBeenCalledTimes(1)
        expect(selectionEvents).toHaveLength(0)

        c2.selected = true
        asSetInternals(set).handleChipToggle({ target: c2, stopImmediatePropagation: vi.fn() } as unknown as Event)
        expect(selectionEvents).toHaveLength(1)

        c1.selected = false
        asSetInternals(set).handleChipToggle({ target: c1, stopImmediatePropagation: vi.fn() } as unknown as Event)
        expect(c1.selected).toBe(false)
        expect(c2.selected).toBe(true)
        expect(selectionEvents).toHaveLength(2)
    })

    it('manages roving tabindex and ArrowRight/ArrowLeft/Home/End navigation across focusable chips', () => {
        const set = new MDCChipSet()
        const c1 = createMockChip({ label: 'First' })
        const c2 = createMockChip({ label: 'Disabled', disabled: true })
        const c3 = createMockChip({ label: 'AlwaysFocusable', disabled: true, alwaysFocusable: true })
        const c4 = createMockChip({ label: 'Last' })

        ;(c1 as unknown as { matches: (sel: string) => boolean }).matches = (sel: string) => sel === ':focus-within'
        asSetInternals(set).cachedChips = [c1, c2, c3, c4]
        asSetInternals(set).updateTabIndices()

        expect(c1.chipTabIndex).toBe(0)
        expect(c2.chipTabIndex).toBe(-1)
        expect(c3.chipTabIndex).toBe(-1)
        expect(c4.chipTabIndex).toBe(-1)

        vi.stubGlobal('getComputedStyle', () => ({ direction: 'ltr' }))

        const arrowRight = makeKeyEvent('ArrowRight', c1)
        asSetInternals(set).handleKeydown(arrowRight.event)
        expect(arrowRight.prevented()).toBe(true)
        expect(c2.focus).not.toHaveBeenCalled()
        expect(c3.focus).toHaveBeenCalledTimes(1)

        const endKey = makeKeyEvent('End', c1)
        asSetInternals(set).handleKeydown(endKey.event)
        expect(endKey.prevented()).toBe(true)
        expect(c4.focus).toHaveBeenCalledTimes(1)

        vi.stubGlobal('getComputedStyle', () => ({ direction: 'rtl' }))
        const arrowRightRtl = makeKeyEvent('ArrowRight', c1)
        asSetInternals(set).handleKeydown(arrowRightRtl.event)
        expect(arrowRightRtl.prevented()).toBe(true)
        expect(c4.focus).toHaveBeenCalledTimes(2)
    })
})
