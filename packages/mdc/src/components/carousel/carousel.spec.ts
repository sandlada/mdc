/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { Carousel } from './carousel'
import { CarouselItem } from './carousel-item'

describe('Carousel', () => {
    it('initializes with default properties', () => {
        const el = new Carousel()
        expect(el.variant).toBe('multi-browse')
        expect(el.preferredItemWidth).toBe(186)
        expect(el.activeIndex).toBe(-1)
    })

    it('allows updating properties', () => {
        const el = new Carousel()
        el.variant = 'uncontained'
        el.preferredItemWidth = 240
        expect(el.variant).toBe('uncontained')
        expect(el.preferredItemWidth).toBe(240)
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