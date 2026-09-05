/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * Contract: vscode-mdc must not fork `mdc` semantics. Pure helpers are
 * re-exported from `@sandlada/mdc/style-engine`; this spec pins parity so any
 * drift fails here, not silently in the IDE.
 */
import { describe, it, expect } from 'vitest'
import { analyzeDefinitionSource } from '../src/core/definition-analyzer'
import {
    extractStateTokenMetadataFromMeta,
    definitionMetasToStyleDefinition,
    compileExportedStylesToCssSync,
    splitSelectorByComma,
    appendToHostSelector,
    matchVariants,
    canonicalizeState,
    resolveTrigger,
    StateTriggerRegistry
} from '../src/core/compiler-engine'
import {
    compileStateSheet,
    extractStateTokenMetadata,
    splitSelectorByComma as mdcSplit,
    appendToHostSelector as mdcAppend,
    matchVariants as mdcMatch,
    canonicalizeState as mdcCanonicalize
} from '@sandlada/mdc/style-engine'

describe('style-engine parity contract', () => {
    it('re-exports pure selectors from mdc (no fork)', () => {
        expect(splitSelectorByComma).toBe(mdcSplit)
        expect(appendToHostSelector).toBe(mdcAppend)
        expect(matchVariants).toBe(mdcMatch)
        expect(canonicalizeState).toBe(mdcCanonicalize)
    })

    it('resolveTrigger delegates to StateTriggerRegistry (defaults, customs, heuristics)', () => {
        const registry = new StateTriggerRegistry()
        const cases: Array<[string, boolean]> = [
            ['hovered', false],
            ['hovered', true],
            ['pressed', false],
            ['disabled', false],
            ['selected', true],
            ['enabled', false],
            ['[foo]', false],
            [':hover', true],
            ['.custom', false],
            ['my-state', true],
            ['my-state', false]
        ]
        for (const [state, isHost] of cases) {
            const expected = registry.resolve(state, { anchor: '', isHostAnchor: isHost })
            const actual = resolveTrigger(state, isHost)
            expect(actual).toEqual({ target: expected.target, modifier: expected.modifier })
        }

        const custom = new Map([
            ['selected', { target: 'host' as const, modifier: '[data-selected]' }],
            ['hovered', { target: 'self' as const, modifier: ':hover' }]
        ])
        const customRegistry = new StateTriggerRegistry()
        for (const [name, c] of custom) {
            customRegistry.register(name, c.modifier)
        }
        for (const [state, isHost] of [['selected', false], ['hovered', true], ['hovered', false]] as Array<[string, boolean]>) {
            const expected = customRegistry.resolve(state, { anchor: '', isHostAnchor: isHost })
            expect(resolveTrigger(state, isHost, custom)).toEqual({ target: expected.target, modifier: expected.modifier })
        }
    })

    it('static metadata agrees with mdc runtime metadata', () => {
        const defMeta = analyzeDefinitionSource(`
            export const D = createStyleDefinition({
                'container-color': ['red', 'green', 'blue', 'yellow', 'gray'],
                'container-height': '40px',
                'overlay-opacity': { hovered: '0.08', pressed: '0.12' }
            })
        `, 'd.definition.ts')!
        const staticMeta = extractStateTokenMetadataFromMeta([defMeta])
        const synthetic = definitionMetasToStyleDefinition([defMeta])
        const runtimeMeta = extractStateTokenMetadata(synthetic)

        for (const key of ['container-color', 'container-height', 'overlay-opacity']) {
            expect(staticMeta.isStateToken(key)).toBe(runtimeMeta.isStateToken(key))
            expect(staticMeta.hasToken(key)).toBe(runtimeMeta.hasToken(key))
        }
        expect(staticMeta.hasStateDelta('container-color', 'hovered')).toBe(true)
        expect(runtimeMeta.hasStateDelta('container-color', 'hovered')).toBe(true)
        expect(staticMeta.hasStateDelta('container-height', 'hovered')).toBe(false)
        expect(runtimeMeta.hasStateDelta('container-height', 'hovered')).toBe(false)
        expect(staticMeta.resolveStateVarName('container-color', 'hovered'))
            .toBe(runtimeMeta.resolveStateVarName('container-color', 'hovered'))
    })

    it('mdc compileStateSheet via adapter agrees with vscode static preview', () => {
        const defMeta = analyzeDefinitionSource(`
            export const ButtonDefinition = createStyleDefinition({
                'container-color': ['red', 'green', 'blue', 'yellow', 'gray'],
                'container-height': '40px'
            })
        `, 'button.definition.ts')!
        const metaMap = new Map([[defMeta.name, defMeta]])
        const styleSource = `
            import { css } from 'lit'
            import { createStyleSheet } from '@sandlada/mdc/utils'
            export const ButtonStyles = createStyleSheet(ButtonDefinition, () => css\`
                @anchor .container {
                    height: var(--_container-height);
                    background-color: var(--_container-color);
                }
            \`)
        `
        const preview = compileExportedStylesToCssSync(styleSource, metaMap, 'button.style.ts')
        const synthetic = definitionMetasToStyleDefinition([defMeta])
        const direct = compileStateSheet(synthetic, '@anchor .container { height: var(--_container-height); background-color: var(--_container-color); }')

        for (const needle of [
            'height: var(--_container-height)',
            'background-color: var(--_enabled-container-color)',
            'background-color: var(--_hovered-container-color)'
        ]) {
            expect(preview.compiledCss).toContain(needle)
            expect(direct).toContain(needle)
        }
        expect(preview.compiledCss).not.toContain('.container:hover {\n    height:')
        expect(direct).not.toContain('height: var(--_hovered-container-height)')
    })
})
