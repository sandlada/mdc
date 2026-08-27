/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { analyzeDefinitionSource } from '../src/core/definition-analyzer'
import { analyzeStylesheetSource } from '../src/core/stylesheet-analyzer'
import { formatStylesheetCodeLens } from '../src/core/codelens-formatter'
import { getContextScopedCompletions } from '../src/core/completion-engine'
import { getHoverInfoForToken } from '../src/core/hover-engine'
import type { DefinitionMeta } from '../src/core/types'

describe('MDC VSCode Core Engine (AST, CodeLens, Completions, Hover)', () => {
    const sampleDefinitionSource = `
        import { Color, Space } from '@sandlada/mdk'
        import { createStyleDefinition, forwardTokens } from '@sandlada/mdc/utils'
        import { IconDefinition } from './icon.definition'
        import { RippleDefinition } from './ripple.definition'

        export const ButtonDefinition = createStyleDefinition({
            'container-color': [Color.Primary, Color.PrimaryHover, Color.PrimaryActive, Color.PrimaryFocus, Color.Disabled],
            'container-height': '40px',
            'container-shape-start-start': '20px',
            'container-elevation': [0, 1, 1, 0, 0],
            'label-color': [Color.OnPrimary, Color.OnPrimary, Color.OnPrimary, Color.OnPrimary, Color.OnDisabled],

            ...forwardTokens(IconDefinition, {
                targetPrefix: '--mdc-icon',
                name: 'icon',
                tokens: {
                    'color': [Color.OnPrimary, Color.OnHover, Color.OnActive, Color.OnFocus, Color.Disabled],
                    'size': '18px',
                },
            }),

            ...forwardTokens(RippleDefinition, {
                targetPrefix: '--mdc-ripple',
                name: 'ripple',
                tokens: {
                    'hovered-color': Color.OnPrimary,
                    'hovered-opacity': '0.08',
                },
            }),
        })
    `

    const sampleStylesheetSource = `
        import { css } from 'lit'
        import { createStyleSheet, defineComponentTokenRefs } from '@sandlada/mdc/utils'
        import { ButtonDefinition } from './button.definition'

        const tokens = defineComponentTokenRefs(ButtonDefinition, { prefix: '--mdc-button' })

        export const ButtonStyles = [
            css\`:host { \${tokens} }\`,
            createStyleSheet(ButtonDefinition, () => css\`
                :host {
                    display: inline-flex;
                }

                @anchor .container {
                    height: var(--_container-height);
                    background-color: var(--_container-color);
                    border-radius: var(--_container-shape-start-start);

                    .label {
                        color: var(--_label-color);
                    }

                    mdc-icon {
                        --mdc-icon-enabled-color: var(--_icon-color);
                        --mdc-icon-enabled-size: var(--_icon-size);
                    }

                    mdc-ripple {
                        --mdc-ripple-hovered-color: var(--_hovered-state-layer-color);
                        --mdc-ripple-hovered-opacity: var(--_hovered-state-layer-opacity);
                    }
                }
            \`),
        ]
    `

    it('accurately parses Definition AST into ownTokens and forwarded child tokens', () => {
        const meta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')
        expect(meta).not.toBeNull()
        expect(meta!.name).toBe('ButtonDefinition')

        // Check own tokens
        expect(meta!.ownTokens.has('container-color')).toBe(true)
        const containerColor = meta!.ownTokens.get('container-color')!
        expect(containerColor.isTuple).toBe(true)
        expect(containerColor.states).toEqual(['enabled', 'hovered', 'pressed', 'focused', 'disabled'])

        const containerHeight = meta!.ownTokens.get('container-height')!
        expect(containerHeight.isTuple).toBe(false)
        expect(containerHeight.states).toEqual(['static'])

        // Check forwarded child definitions
        expect(meta!.forwarded.has('IconDefinition')).toBe(true)
        const iconFwd = meta!.forwarded.get('IconDefinition')!
        expect(iconFwd.targetPrefix).toBe('--mdc-icon')
        expect(iconFwd.namespace).toBe('icon')
        expect(iconFwd.tokens).toHaveProperty('color')
        expect(iconFwd.tokens).toHaveProperty('size')

        expect(meta!.forwarded.has('RippleDefinition')).toBe(true)
        const rippleFwd = meta!.forwarded.get('RippleDefinition')!
        expect(rippleFwd.targetPrefix).toBe('--mdc-ripple')
    })

    it('analyzes stylesheet AST and extracts used private tokens, child bridge tokens, and unused tokens', () => {
        const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
        const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

        const analyses = analyzeStylesheetSource(sampleStylesheetSource, metaMap, 'button.style.ts')
        expect(analyses.length).toBe(1)

        const analysis = analyses[0]
        expect(analysis.styleVarName).toBe('ButtonStyles')
        expect(analysis.definitionName).toBe('ButtonDefinition')

        // Check used private tokens
        const privateTokens = analysis.usedPrivateTokens.map((t) => t.token)
        expect(privateTokens).toContain('--_container-height')
        expect(privateTokens).toContain('--_container-color')
        expect(privateTokens).toContain('--_container-shape-start-start')
        expect(privateTokens).toContain('--_label-color')
        expect(privateTokens).toContain('--_icon-color')
        expect(privateTokens).toContain('--_icon-size')

        // Check used child bridge tokens
        const childTokens = analysis.usedChildBridgeTokens.map((t) => t.token)
        expect(childTokens).toContain('--mdc-icon-enabled-color')
        expect(childTokens).toContain('--mdc-icon-enabled-size')
        expect(childTokens).toContain('--mdc-ripple-hovered-color')
        expect(childTokens).toContain('--mdc-ripple-hovered-opacity')

        // Check unused token detection
        expect(analysis.unusedTokens).toContain('var(--_container-elevation)')
    })

    it('generates modular CodeLens pills and rich full inspection reports', () => {
        const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
        const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])
        const analysis = analyzeStylesheetSource(sampleStylesheetSource, metaMap, 'button.style.ts')[0]

        // Check multi-line detection
        expect(analysis.declarationLine).toBeDefined()
        expect(analysis.createStyleSheetLine).toBeDefined()
        expect(analysis.tokenRecords).toBeDefined()
        expect(analysis.tokenRecords!.length).toBeGreaterThan(0)
        expect(analysis.tokenRecords![0].definitionName).toBe('ButtonDefinition')

        const codeLenses = formatStylesheetCodeLens(analysis, 4)
        expect(codeLenses.length).toBeGreaterThanOrEqual(4)

        // 1. References Pill
        expect(codeLenses[0].title).toBe('📌 4 references')

        // 2. Definition Pill
        expect(codeLenses[1].title).toBe('📦 ButtonDefinition (8/5 - 160%)')

        // 3. Private Tokens Pill
        const privatePill = codeLenses.find((c) => c.title.includes('Private Tokens'))
        expect(privatePill).toBeDefined()
        expect(privatePill!.title).toBe('🎨 8 Private Tokens')

        // 4. Child Tokens Pill
        const childPill = codeLenses.find((c) => c.title.includes('Child Tokens'))
        expect(childPill).toBeDefined()
        expect(childPill!.title).toBe('🔗 4 Child Tokens')

        // 5. Unused Tokens Pill
        const unusedPill = codeLenses.find((c) => c.title.includes('Unused'))
        expect(unusedPill).toBeDefined()
        expect(unusedPill!.title).toBe('⚠️ 1 Unused')
    })

    it('provides context-scoped completions for private variables and forwarded child variables', () => {
        const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!

        // Trigger private variable completions
        const privateCompletions = getContextScopedCompletions(defMeta, 'var(--_')
        expect(privateCompletions.some((c) => c.label === '--_container-color')).toBe(true)
        expect(privateCompletions.some((c) => c.label === '--_container-height')).toBe(true)

        // Trigger child bridge completions
        const childCompletions = getContextScopedCompletions(defMeta, '--mdc-icon')
        expect(childCompletions.some((c) => c.label.startsWith('--mdc-icon-'))).toBe(true)
    })

    it('generates rich hover markdown information for private and child tokens', () => {
        const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!

        // Hover on private token
        const privateHover = getHoverInfoForToken(defMeta, '--_container-color')
        expect(privateHover).toContain('### 📦 MDC Component Token: `--_container-color`')
        expect(privateHover).toContain('5-State Tuple')
        expect(privateHover).toContain('• `enabled`')

        // Hover on child token
        const childHover = getHoverInfoForToken(defMeta, '--mdc-icon-enabled-color')
        expect(childHover).toContain('### 🔗 Forwarded Child Token: `--mdc-icon-enabled-color`')
        expect(childHover).toContain('**Target Component**: `IconDefinition`')
    })
})
