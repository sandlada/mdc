/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { NavigationBarStyles } from './navigation-bar.style'

const cssText = NavigationBarStyles.cssText

const Directions = ['vertical', 'horizontal', 'vertical-xr'] as const

const getContainerBlock = (direction: string): string => {
    const match = new RegExp(`\\.${direction}\\.container\\s*\\{([^}]*)\\}`).exec(cssText)

    if (match === null) {
        throw new Error(`[navigation-bar.style.spec] Missing .${direction}.container rule`)
    }

    return match[1]
}

const getDeclaration = (block: string, property: string): string => {
    const match = new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+);`).exec(block)

    if (match === null) {
        throw new Error(`[navigation-bar.style.spec] Missing declaration "${property}"`)
    }

    return match[1].trim()
}

describe('NavigationBarStyles container axes', () => {
    it.each(Directions)('%s maps inline padding to inline tokens', (direction) => {
        const block = getContainerBlock(direction)

        expect(getDeclaration(block, 'padding-inline-start'))
            .toBe(`var(--_${direction}-container-inline-leading-space)`)
        expect(getDeclaration(block, 'padding-inline-end'))
            .toBe(`var(--_${direction}-container-inline-trailing-space)`)
    })

    it.each(Directions)('%s maps block padding to block tokens', (direction) => {
        const block = getContainerBlock(direction)

        expect(getDeclaration(block, 'padding-block-start'))
            .toBe(`var(--_${direction}-container-block-leading-space)`)
        expect(getDeclaration(block, 'padding-block-end'))
            .toBe(`var(--_${direction}-container-block-trailing-space)`)
    })

    it.each(Directions)('%s maps each corner radius to a shape token', (direction) => {
        const block = getContainerBlock(direction)

        expect(getDeclaration(block, 'border-top-left-radius'))
            .toBe(`var(--_${direction}-container-shape-start-start)`)
        expect(getDeclaration(block, 'border-top-right-radius'))
            .toBe(`var(--_${direction}-container-shape-start-end)`)
        expect(getDeclaration(block, 'border-bottom-right-radius'))
            .toBe(`var(--_${direction}-container-shape-end-end)`)
        expect(getDeclaration(block, 'border-bottom-left-radius'))
            .toBe(`var(--_${direction}-container-shape-end-start)`)
    })

    it('never references non-existent shape-radius tokens', () => {
        expect(cssText).not.toContain('shape-radius')
    })

    it('maps vertical-xr corners to the full-shape tokens', () => {
        const block = getContainerBlock('vertical-xr')

        expect(getDeclaration(block, 'border-top-left-radius'))
            .toBe('var(--_vertical-xr-container-shape-start-start)')
        expect(getDeclaration(block, 'border-bottom-right-radius'))
            .toBe('var(--_vertical-xr-container-shape-end-end)')
    })
})
