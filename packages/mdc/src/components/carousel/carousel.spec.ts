/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it, vi } from 'vitest'
import { Carousel } from './carousel'
import { CarouselItem } from './carousel-item'
import { CarouselItemSize, CarouselVariant } from './carousel.interface'
import { buildKeylineStrategy, computeItemLayouts } from './internal/keyline'

describe('Carousel keyline engine', () => {
    it('multi-browse fills availableSpace edge-to-edge at scroll 0 and maxScroll', () => {
        const strategy = buildKeylineStrategy({
            variant: CarouselVariant.MultiBrowse,
            availableSpace: 600,
            itemCount: 8,
            preferredItemWidth: 186,
            itemSpacing: 8,
            minSmallItemWidth: 40,
            maxSmallItemWidth: 56,
        })

        const layoutsAtStart = computeItemLayouts(strategy, 0)
        const visibleAtStart = layoutsAtStart.filter((l) => l.visible)
        expect(visibleAtStart.length).toBeGreaterThanOrEqual(3)
        expect(visibleAtStart[0].size).toBe(CarouselItemSize.Large)
        expect(visibleAtStart[0].left).toBeCloseTo(0, 1)

        const lastVisibleStart = visibleAtStart[visibleAtStart.length - 1]
        expect(lastVisibleStart.left + lastVisibleStart.width).toBeCloseTo(600, 1)

        // At maxScroll, the last item becomes large and aligns with the trailing edge
        const layoutsAtEnd = computeItemLayouts(strategy, strategy.maxScroll)
        const visibleAtEnd = layoutsAtEnd.filter((l) => l.visible)
        const lastItem = visibleAtEnd[visibleAtEnd.length - 1]
        expect(lastItem.index).toBe(7)
        expect(lastItem.size).toBe(CarouselItemSize.Large)
        expect(lastItem.left + lastItem.width).toBeCloseTo(600, 1)
    })

    it('multi-browse smoothly interpolates widths during fractional scroll', () => {
        const strategy = buildKeylineStrategy({
            variant: CarouselVariant.MultiBrowse,
            availableSpace: 480,
            itemCount: 6,
            preferredItemWidth: 186,
            itemSpacing: 8,
            minSmallItemWidth: 40,
            maxSmallItemWidth: 56,
        })

        const atZero = computeItemLayouts(strategy, 0)
        const atHalf = computeItemLayouts(strategy, strategy.step * 0.5)
        const atOne = computeItemLayouts(strategy, strategy.step)

        // Item 0 shrinks as it scrolls off the leading edge
        expect(atHalf[0].width).toBeLessThan(atZero[0].width)
        expect(atHalf[0].width).toBeGreaterThan(0)

        // Item 2 (medium at 0) grows toward large as it scrolls left
        expect(atHalf[2].width).toBeGreaterThan(atZero[2].width)
        expect(atOne[2].width).toBeGreaterThan(atHalf[2].width)
    })

    it('hero places 1 large + 1 small at start and 1 small + 1 large at end', () => {
        const strategy = buildKeylineStrategy({
            variant: CarouselVariant.Hero,
            availableSpace: 500,
            itemCount: 5,
            preferredItemWidth: 186,
            itemSpacing: 8,
            minSmallItemWidth: 40,
            maxSmallItemWidth: 56,
        })

        const atStart = computeItemLayouts(strategy, 0).filter((l) => l.visible)
        expect(atStart.length).toBe(2)
        expect(atStart[0].size).toBe(CarouselItemSize.Large)
        expect(atStart[1].size).toBe(CarouselItemSize.Small)
        expect(atStart[1].left + atStart[1].width).toBeCloseTo(500, 1)

        const atEnd = computeItemLayouts(strategy, strategy.maxScroll).filter((l) => l.visible)
        expect(atEnd.length).toBe(2)
        expect(atEnd[0].size).toBe(CarouselItemSize.Small)
        expect(atEnd[1].size).toBe(CarouselItemSize.Large)
        expect(atEnd[1].left + atEnd[1].width).toBeCloseTo(500, 1)

        // Continuity check near maxScroll: no 8px jump as the leaving item exits startAnchor
        const nearEnd = computeItemLayouts(strategy, strategy.maxScroll - 1).filter((l) => l.visible)
        const item3NearEnd = nearEnd.find((l) => l.index === 3)
        const item3AtEnd = atEnd.find((l) => l.index === 3)
        expect(item3NearEnd).toBeDefined()
        expect(item3AtEnd).toBeDefined()
        expect(Math.abs(item3NearEnd!.left - item3AtEnd!.left)).toBeLessThan(2)
        expect(item3AtEnd!.left).toBeCloseTo(0, 1)
    })

    it('centered-hero shifts from start-aligned at 0 to centered in middle to end-aligned at maxScroll', () => {
        const strategy = buildKeylineStrategy({
            variant: CarouselVariant.CenteredHero,
            availableSpace: 500,
            itemCount: 5,
            preferredItemWidth: 186,
            itemSpacing: 8,
            minSmallItemWidth: 40,
            maxSmallItemWidth: 56,
        })

        const atStart = computeItemLayouts(strategy, 0).filter((l) => l.visible)
        expect(atStart[0].size).toBe(CarouselItemSize.Large)
        expect(atStart[1].size).toBe(CarouselItemSize.Small)

        const atMiddle = computeItemLayouts(strategy, strategy.step).filter((l) => l.visible)
        expect(atMiddle.length).toBe(3)
        expect(atMiddle[0].size).toBe(CarouselItemSize.Small)
        expect(atMiddle[1].size).toBe(CarouselItemSize.Large)
        expect(atMiddle[2].size).toBe(CarouselItemSize.Small)

        const atEnd = computeItemLayouts(strategy, strategy.maxScroll).filter((l) => l.visible)
        expect(atEnd[atEnd.length - 1].size).toBe(CarouselItemSize.Large)
        expect(atEnd[atEnd.length - 2].size).toBe(CarouselItemSize.Small)
    })

    it('full-screen fills the entire availableSpace with one focal item', () => {
        const strategy = buildKeylineStrategy({
            variant: CarouselVariant.FullScreen,
            availableSpace: 420,
            itemCount: 4,
            preferredItemWidth: 186,
            itemSpacing: 8,
            minSmallItemWidth: 40,
            maxSmallItemWidth: 56,
        })

        const atStart = computeItemLayouts(strategy, 0).filter((l) => l.visible)
        expect(atStart.length).toBe(1)
        expect(atStart[0].width).toBeCloseTo(420, 1)
        expect(atStart[0].size).toBe(CarouselItemSize.Large)
    })

    it('handles empty and single-item carousels cleanly', () => {
        const empty = buildKeylineStrategy({
            variant: CarouselVariant.MultiBrowse,
            availableSpace: 500,
            itemCount: 0,
            preferredItemWidth: 186,
            itemSpacing: 8,
            minSmallItemWidth: 40,
            maxSmallItemWidth: 56,
        })
        expect(computeItemLayouts(empty, 0)).toEqual([])

        const single = buildKeylineStrategy({
            variant: CarouselVariant.MultiBrowse,
            availableSpace: 500,
            itemCount: 1,
            preferredItemWidth: 186,
            itemSpacing: 8,
            minSmallItemWidth: 40,
            maxSmallItemWidth: 56,
        })
        const layouts = computeItemLayouts(single, 0)
        expect(layouts.length).toBe(1)
        expect(layouts[0].visible).toBe(true)
        expect(layouts[0].size).toBe(CarouselItemSize.Large)
    })
})

describe('Carousel', () => {
    it('initializes with default properties', () => {
        const el = new Carousel()
        expect(el.variant).toBe('multi-browse')
        expect(el.preferredItemWidth).toBe(186)
        expect(el.minSmallItemWidth).toBe(40)
        expect(el.maxSmallItemWidth).toBe(56)
        expect(el.activeIndex).toBe(-1)
    })

    it('allows updating properties', () => {
        const el = new Carousel()
        el.variant = 'centered-hero'
        el.preferredItemWidth = 240
        el.minSmallItemWidth = 44
        el.maxSmallItemWidth = 64
        expect(el.variant).toBe('centered-hero')
        expect(el.preferredItemWidth).toBe(240)
        expect(el.minSmallItemWidth).toBe(44)
        expect(el.maxSmallItemWidth).toBe(64)
    })

    it('scrolls to expand a non-active item when clicked', () => {
        const el = new Carousel()
        const item0 = new CarouselItem()
        const item1 = new CarouselItem()
        const item2 = new CarouselItem()

        ;(el as unknown as { items: CarouselItem[]; activeIndexValue: number }).items = [item0, item1, item2]
        ;(el as unknown as { activeIndexValue: number }).activeIndexValue = 0

        const scrollSpy = vi.spyOn(el, 'scrollToItem').mockImplementation(() => {})
        const handleClick = (el as unknown as { handleClick(e: { defaultPrevented: boolean; target: unknown }): void }).handleClick

        handleClick({
            defaultPrevented: false,
            target: { closest: () => item0 },
        })
        expect(scrollSpy).not.toHaveBeenCalled()

        handleClick({
            defaultPrevented: false,
            target: { closest: () => item2 },
        })
        expect(scrollSpy).toHaveBeenCalledTimes(1)
        expect(scrollSpy).toHaveBeenCalledWith(2)

        handleClick({
            defaultPrevented: true,
            target: { closest: () => item1 },
        })
        expect(scrollSpy).toHaveBeenCalledTimes(1)
    })
})

describe('CarouselItem', () => {
    it('initializes with default properties', () => {
        const el = new CarouselItem()
        expect(el.size).toBe('medium')
        expect(el.active).toBe(false)
        expect(el.index).toBe(0)
    })

    it('allows updating properties', () => {
        const el = new CarouselItem()
        el.size = 'large'
        el.active = true
        el.index = 3
        expect(el.size).toBe('large')
        expect(el.active).toBe(true)
        expect(el.index).toBe(3)
    })
})
