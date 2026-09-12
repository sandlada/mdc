/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest'
import { typographyStyles } from './typography.styles'
import { TypographyVariant } from './typography.interface'

describe('typographyStyles', () => {
    it('defines every referenced private variable with 150 combo tokens', () => {
        const cssText = typographyStyles.cssText
        const refs = new Set<string>()
        for (const m of cssText.matchAll(/var\(\s*(--_[a-zA-Z0-9_-]+)/g)) {
            refs.add(m[1]!)
        }
        const defs = new Set<string>()
        for (const m of cssText.matchAll(/(--_[a-zA-Z0-9_-]+)\s*:/g)) {
            defs.add(m[1]!)
        }
        expect([...refs].filter(r => !defs.has(r))).toEqual([])
        expect(
            [...defs].filter(d => /--_(display|headline|title|label|body)-(small|medium|large)-(regular|emphasized)-(font|size|weight|line-height|tracking)$/.test(d))
        ).toHaveLength(150)
    })

    it('expands one @state block into 30 host rules with combo variables', () => {
        const cssText = typographyStyles.cssText
        const comboRules = cssText.match(/:host\(\[variant\^=/g) ?? []

        expect(comboRules).toHaveLength(30)
        expect(cssText).toContain(':host([variant^="display-"][variant$="-small"]:not([emphasized]))')
        expect(cssText).toContain('var(--_display-small-regular-font)')
        expect(cssText).toContain(':host([variant^="body-"][variant$="-large"][emphasized])')
        expect(cssText).toContain('var(--_body-large-emphasized-weight)')
        expect(cssText).not.toContain('@state')
        expect(cssText).not.toContain('var(--_font);')
    })

    it('matches every variant/emphasized element state to exactly its combo rule', () => {
        const cssText = typographyStyles.cssText
        const rules: Array<{ selector: string, body: string }> = []
        for (const m of cssText.matchAll(/(:host\((?:[^()]*|\([^()]*\))*\))\s*\{([^}]*)\}/g)) {
            if (m[1]!.includes('[variant^=')) {
                rules.push({ selector: m[1]!, body: m[2]! })
            }
        }
        expect(rules).toHaveLength(30)

        const parseConditions = (selector: string) => ({
            rolePrefix: selector.match(/\[variant\^="([a-z]+)-"\]/)?.[1],
            sizeSuffix: selector.match(/\[variant\$="-([a-z]+)"\]/)?.[1],
            emphasized: selector.includes('[emphasized]') && !selector.includes(':not([emphasized])') ? true
                : selector.includes(':not([emphasized])') ? false
                    : null
        })

        const variants = Object.values(TypographyVariant)
        expect(variants).toHaveLength(15)
        for (const variant of variants) {
            const [role, size] = variant.split('-')
            for (const emphasized of [false, true]) {
                const expectedInfix = `${role}-${size}-${emphasized ? 'emphasized' : 'regular'}`
                const matches = rules.filter(rule => {
                    const conds = parseConditions(rule.selector)
                    return conds.rolePrefix !== undefined
                        && variant.startsWith(`${conds.rolePrefix}-`)
                        && conds.sizeSuffix !== undefined
                        && variant.endsWith(`-${conds.sizeSuffix}`)
                        && conds.emphasized === emphasized
                })
                expect(matches.map(r => r.selector)).toHaveLength(1)
                expect(matches[0]!.body).toContain(`var(--_${expectedInfix}-font)`)
                expect(matches[0]!.body).toContain(`var(--_${expectedInfix}-size)`)
                expect(matches[0]!.body).toContain(`var(--_${expectedInfix}-weight)`)
                expect(matches[0]!.body).toContain(`var(--_${expectedInfix}-line-height)`)
                expect(matches[0]!.body).toContain(`var(--_${expectedInfix}-tracking)`)
            }
        }
    })
})
