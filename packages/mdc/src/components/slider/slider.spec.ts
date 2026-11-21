/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect, vi } from 'vitest'
import { MDCSlider } from './slider'
import { SliderDirection, SliderSize, SliderType } from './slider.interface'
import {
    clamp,
    computeTicks,
    fractionToValue,
    snapValue,
    toVisualFraction,
    valueToFraction,
} from './internal/slider-math'
import { GetFormValue } from '../../utils/form'

type SliderInternalMethods = {
    willUpdate(changed: Map<PropertyKey, unknown>): void
    render(): { strings: TemplateStringsArray; values: unknown[] }
    handleThumbKeyDown(thumb: 'start' | 'end'): (event: KeyboardEvent) => void
    handlePointerDown(event: PointerEvent): void
    handlePointerMove(event: PointerEvent): void
    handlePointerUp(event: PointerEvent): void
    getAriaLabelFor(thumb: 'start' | 'end'): string
    getAriaValueTextFor(thumb: 'start' | 'end'): string
    isStandardIconSupported(): boolean
}

type SliderTestable = Omit<MDCSlider, keyof SliderInternalMethods> & SliderInternalMethods

const createTestableSlider = (): SliderTestable => new MDCSlider() as unknown as SliderTestable

const serializeTemplate = (tpl: { strings?: readonly string[]; values?: readonly unknown[] } | unknown): string => {
    if (!tpl || typeof tpl !== 'object') return String(tpl ?? '')
    const obj = tpl as { strings?: readonly string[]; values?: readonly unknown[] }
    if (!Array.isArray(obj.strings)) return ''
    let out = ''
    for (let i = 0; i < obj.strings.length; i++) {
        out += obj.strings[i]
        if (obj.values && i < obj.values.length) {
            const val = obj.values[i]
            if (Array.isArray(val)) {
                out += val.map((item) => serializeTemplate(item)).join('')
            } else if (val && typeof val === 'object' && 'strings' in val) {
                out += serializeTemplate(val)
            } else if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
                out += String(val)
            }
        }
    }
    return out
}

const fakeKeyEvent = (key: string): KeyboardEvent =>
    ({
        key,
        preventDefault: vi.fn(),
    }) as unknown as KeyboardEvent

describe('slider-math', () => {
    it('clamps and snaps values cleanly without float drift', () => {
        expect(clamp(0, 100)(150)).toBe(100)
        expect(clamp(0, 100)(-10)).toBe(0)
        expect(snapValue(0, 1, 0.1)(0.30000000000000004)).toBe(0.3)
        expect(snapValue(0, 100, 10)(26)).toBe(30)
        expect(snapValue(0, 15, 10)(14)).toBe(10)
        expect(snapValue(0, 100, 0)(33.7)).toBe(33.7)
    })

    it('maps between values and fractions', () => {
        expect(valueToFraction(-50, 50)(0)).toBe(0.5)
        expect(fractionToValue(-50, 50, 5)(0.52)).toBe(0)
        expect(toVisualFraction(false)(0.25)).toBe(0.25)
        expect(toVisualFraction(true)(0.25)).toBe(0.75)
    })

    it('computes tick marks and omits ticks occluded by handle gap or terminal stop indicators', () => {
        const ticks = computeTicks({
            min: 0,
            max: 100,
            step: 25,
            reversed: false,
            activeStartVf: 0,
            activeEndVf: 0.5,
            handleCenters: [130],
            trackLength: 260,
            edgeInset: 2,
            handleHalf: 2,
            gap: 6,
            tickRadius: 2,
            hideStartEdge: false,
            hideEndEdge: true,
        })
        expect(ticks.map((t) => t.fraction)).toEqual([0, 0.25, 0.75])
        expect(ticks.map((t) => t.active)).toEqual([true, true, false])
    })
})

describe('MDCSlider', () => {
    it('instantiates with M3 Expressive defaults', () => {
        const slider = new MDCSlider()
        expect(slider.min).toBe(0)
        expect(slider.max).toBe(100)
        expect(slider.step).toBe(1)
        expect(slider.value).toBe(0)
        expect(slider.type).toBe(SliderType.Standard)
        expect(slider.size).toBe(SliderSize.ExtraSmall)
        expect(slider.direction).toBe(SliderDirection.Horizontal)
        expect(slider.reversed).toBe(false)
        expect(slider.ticks).toBe(false)
        expect(slider.labeled).toBe(false)
        expect(slider.disabled).toBe(false)
        expect(slider.icon).toBe('')
        expect(slider.name).toBe('')
    })

    it('renders accessible single slider thumb with no positive tabindex', () => {
        const slider = createTestableSlider()
        slider.value = 40
        slider.ariaLabel = 'Volume'
        slider.willUpdate(new Map())
        const markup = serializeTemplate(slider.render())

        expect(markup).toContain('role="slider"')
        expect(markup).toContain('class="track-segment"')
        expect(slider.getAriaLabelFor('end')).toBe('Volume')
        expect(slider.getAriaValueTextFor('end')).toBe('40')
    })

    it('defaults centered slider value to midpoint and renders center-anchored segments', () => {
        const slider = createTestableSlider()
        slider.type = SliderType.Centered
        slider.min = -100
        slider.max = 100
        slider.willUpdate(new Map())
        expect(slider.value).toBe(0)

        slider.value = 50
        slider.willUpdate(new Map([['value', 0]]))
        const markup = serializeTemplate(slider.render())
        expect(markup).toContain('data-edge="center"')
        expect(markup).toContain('data-role=active')
    })

    it('renders range slider with dual thumbs and no spurious center dot', () => {
        const slider = createTestableSlider()
        slider.type = SliderType.Range
        slider.valueStart = 20
        slider.valueEnd = 80
        slider.willUpdate(new Map())

        const markup = serializeTemplate(slider.render())
        expect(markup).toContain('id=thumb-start')
        expect(markup).toContain('id=thumb-end')
        expect(markup).not.toContain('data-edge="center"')
    })

    it('clamps range slider start <= end in willUpdate', () => {
        const slider = createTestableSlider()
        slider.type = SliderType.Range
        slider.valueStart = 90
        slider.valueEnd = 40
        slider.willUpdate(new Map())
        expect(slider.valueStart).toBe(40)
        expect(slider.valueEnd).toBe(40)
    })

    it('handles keyboard navigation across standard, reversed, vertical, and range sliders', () => {
        const events: string[] = []
        const slider = createTestableSlider()
        slider.step = 5
        slider.value = 50
        slider.willUpdate(new Map())
        slider.addEventListener('input', () => events.push('input'))
        slider.addEventListener('change', () => events.push('change'))

        const onKey = slider.handleThumbKeyDown('end')
        onKey(fakeKeyEvent('ArrowRight'))
        expect(slider.value).toBe(55)
        expect(events).toEqual(['input', 'change'])

        onKey(fakeKeyEvent('PageDown'))
        expect(slider.value).toBe(45)

        onKey(fakeKeyEvent('Home'))
        expect(slider.value).toBe(0)

        onKey(fakeKeyEvent('End'))
        expect(slider.value).toBe(100)

        slider.reversed = true
        slider.value = 50
        slider.willUpdate(new Map())
        onKey(fakeKeyEvent('ArrowRight'))
        expect(slider.value).toBe(45)
    })

    it('clamps range slider thumbs via keyboard and supports vertical orientation', () => {
        const slider = createTestableSlider()
        slider.type = SliderType.Range
        slider.direction = SliderDirection.Vertical
        slider.step = 10
        slider.valueStart = 40
        slider.valueEnd = 50
        slider.willUpdate(new Map())

        const onStartKey = slider.handleThumbKeyDown('start')
        onStartKey(fakeKeyEvent('ArrowUp'))
        expect(slider.valueStart).toBe(50)
        onStartKey(fakeKeyEvent('ArrowUp'))
        expect(slider.valueStart).toBe(50)
    })

    it('blocks keyboard interaction when disabled', () => {
        const slider = createTestableSlider()
        slider.disabled = true
        slider.value = 30
        slider.willUpdate(new Map())

        slider.handleThumbKeyDown('end')(fakeKeyEvent('ArrowRight'))
        expect(slider.value).toBe(30)
    })

    it('supports inset icon only on M/L/XL standard sliders', () => {
        const slider = createTestableSlider()
        slider.size = SliderSize.Medium
        slider.icon = 'volume_up'
        expect(slider.isStandardIconSupported()).toBe(true)

        slider.size = SliderSize.ExtraSmall
        expect(slider.isStandardIconSupported()).toBe(false)

        slider.size = SliderSize.Large
        slider.type = SliderType.Range
        expect(slider.isStandardIconSupported()).toBe(false)
    })

    it('formats value indicator labels with valueLabel and valueFormatter', () => {
        const slider = createTestableSlider()
        slider.labeled = true
        slider.value = 72
        slider.valueFormatter = (v) => `${v}%`
        slider.willUpdate(new Map())

        expect(slider.getAriaValueTextFor('end')).toBe('72%')
        slider.valueLabel = 'High'
        expect(slider.getAriaValueTextFor('end')).toBe('High')
    })

    it('provides FormAssociated values and form reset support', () => {
        const slider = createTestableSlider()
        slider.setAttribute('value', '35')
        slider.value = 35
        slider.name = 'brightness'
        slider.willUpdate(new Map())
        expect(slider[GetFormValue]()).toBe('35')

        slider.value = 80
        expect(slider[GetFormValue]()).toBe('80')
        slider.formResetCallback()
        expect(slider.value).toBe(35)

        slider.type = SliderType.Range
        slider.nameStart = 'low'
        slider.nameEnd = 'high'
        slider.valueStart = 10
        slider.valueEnd = 90
        const fd = slider[GetFormValue]() as FormData
        expect(fd.get('low')).toBe('10')
        expect(fd.get('high')).toBe('90')
    })

    it('enforces minSeparation in willUpdate, keyboard navigation, and step snapping', () => {
        const slider = createTestableSlider()
        slider.type = SliderType.Range
        slider.min = 0
        slider.max = 100
        slider.step = 10
        slider.minSeparation = 15
        slider.valueStart = 40
        slider.valueEnd = 50
        slider.willUpdate(new Map())
        // 50 - 15 = 35 -> snapped down to 30 on step=10
        expect(slider.valueStart).toBe(30)
        expect(slider.valueEnd).toBe(50)

        const onStartKey = slider.handleThumbKeyDown('start')
        onStartKey(fakeKeyEvent('ArrowRight'))
        expect(slider.valueStart).toBe(30)

        onStartKey(fakeKeyEvent('End'))
        expect(slider.valueStart).toBe(30)

        const onEndKey = slider.handleThumbKeyDown('end')
        onEndKey(fakeKeyEvent('Home'))
        // 30 + 15 = 45 -> snapped up to 50 on step=10
        expect(slider.valueEnd).toBe(50)
    })

    it('supports values tuple getter/setter and throws on invalid tuple', () => {
        const slider = createTestableSlider()
        slider.type = SliderType.Range
        slider.values = [25, 75]
        slider.willUpdate(new Map())
        expect(slider.values).toEqual([25, 75])
        expect(slider.valueStart).toBe(25)
        expect(slider.valueEnd).toBe(75)

        expect(() => {
            slider.values = [10] as unknown as [number, number]
        }).toThrow()
    })
})
