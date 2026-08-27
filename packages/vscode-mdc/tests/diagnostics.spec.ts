/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { analyzeDefinitionSource } from '../src/core/definition-analyzer'
import { analyzeStylesheetSource } from '../src/core/stylesheet-analyzer'
import { getStylesheetDiagnostics } from '../src/core/diagnostic-engine'
import type { DefinitionMeta } from '../src/core/types'

describe('MDC Diagnostic Linter & QuickFix Engine', () => {
    const sampleDefinitionSource = `
        import { Color } from '@sandlada/mdk'
        import { createStyleDefinition, forwardTokens } from '@sandlada/mdc/utils'
        import { IconDefinition } from './icon.definition'

        export const ButtonDefinition = createStyleDefinition({
            'container-color': [Color.Primary, Color.PrimaryHover, Color.PrimaryActive, Color.PrimaryFocus, Color.Disabled],
            'container-height': '40px',

            ...forwardTokens(IconDefinition, {
                targetPrefix: '--mdc-icon',
                name: 'icon',
                tokens: {
                    'color': [Color.OnPrimary, Color.OnHover, Color.OnActive, Color.OnFocus, Color.Disabled],
                    'size': '18px',
                },
            }),
        })
    `

    const sampleIconDefinitionSource = `
        import { Color } from '@sandlada/mdk'
        import { createStyleDefinition } from '@sandlada/mdc/utils'

        export const IconDefinition = createStyleDefinition({
            'color': Color.OnSurface,
            'size': '24px',
        })
    `

    it('emits MDC001 warning with QuickFix when handcrafted fallback is detected in CSS', () => {
        const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
        const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

        const invalidStylesheet = `
            import { css } from 'lit'
            import { createStyleSheet } from '@sandlada/mdc/utils'
            import { ButtonDefinition } from './button.definition'

            export const ButtonStyles = [
                createStyleSheet(ButtonDefinition, () => css\`
                    .container {
                        background-color: var(--_container-color, #ffffff);
                        height: var(--_container-height, 40px);
                    }
                \`),
            ]
        `

        const analyses = analyzeStylesheetSource(invalidStylesheet, metaMap, 'button.style.ts')
        const issues = getStylesheetDiagnostics(analyses[0], defMeta)

        const fallbackIssues = issues.filter((i) => i.code === 'MDC001')
        expect(fallbackIssues.length).toBe(2)

        // Verify issue 1
        expect(fallbackIssues[0].message).toContain('[MDC001]')
        expect(fallbackIssues[0].message).toContain('Handcrafted fallback "#ffffff"')
        expect(fallbackIssues[0].quickFix).toBeDefined()
        expect(fallbackIssues[0].quickFix!.replacement).toBe('var(--_container-color)')

        // Verify issue 2
        expect(fallbackIssues[1].message).toContain('Handcrafted fallback "40px"')
        expect(fallbackIssues[1].quickFix!.replacement).toBe('var(--_container-height)')
    })

    it('emits MDC002 error when ghost / undefined token is used in stylesheet', () => {
        const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
        const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

        const ghostStylesheet = `
            import { css } from 'lit'
            import { createStyleSheet } from '@sandlada/mdc/utils'
            import { ButtonDefinition } from './button.definition'

            export const ButtonStyles = [
                createStyleSheet(ButtonDefinition, () => css\`
                    .container {
                        background-color: var(--_container-color);
                        width: var(--_ghost-width);
                        padding: var(--_undefined-padding);
                    }
                \`),
            ]
        `

        const analyses = analyzeStylesheetSource(ghostStylesheet, metaMap, 'button.style.ts')
        const issues = getStylesheetDiagnostics(analyses[0], defMeta)

        const ghostIssues = issues.filter((i) => i.code === 'MDC002')
        expect(ghostIssues.length).toBe(2)

        expect(ghostIssues[0].severity).toBe('error')
        expect(ghostIssues[0].message).toContain('Unknown token "--_ghost-width" is not declared in ButtonDefinition')

        expect(ghostIssues[1].message).toContain('Unknown token "--_undefined-padding"')
    })

    it('emits MDC003 warning when assigning invalid state to non-stateful child component', () => {
        const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
        const iconDefMeta = analyzeDefinitionSource(sampleIconDefinitionSource, 'icon.definition.ts')!
        const metaMap = new Map<string, DefinitionMeta>([
            [defMeta.name, defMeta],
            [iconDefMeta.name, iconDefMeta],
        ])

        const invalidStateStylesheet = `
            import { css } from 'lit'
            import { createStyleSheet } from '@sandlada/mdc/utils'
            import { ButtonDefinition } from './button.definition'

            export const ButtonStyles = [
                createStyleSheet(ButtonDefinition, () => css\`
                    .container {
                        mdc-icon {
                            --mdc-icon-hovered-size: var(--_icon-size);
                            --mdc-icon-enabled-color: var(--_icon-color);
                        }
                    }
                \`),
            ]
        `

        const analyses = analyzeStylesheetSource(invalidStateStylesheet, metaMap, 'button.style.ts')
        const issues = getStylesheetDiagnostics(analyses[0], defMeta)

        const childIssues = issues.filter((i) => i.code === 'MDC003')
        expect(childIssues.length).toBe(1)

        expect(childIssues[0].severity).toBe('warning')
        expect(childIssues[0].message).toContain('Target component "IconDefinition" only defines "enabled" state for "size"')
        expect(childIssues[0].quickFix!.replacement).toBe('--mdc-icon-enabled-size')
    })
})
