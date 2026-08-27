/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { analyzeDefinitionSource } from '../src/core/definition-analyzer'
import { compileExportedStylesToCss, compileExportedStylesToCssSync } from '../src/core/compiler-engine'
import type { DefinitionMeta } from '../src/core/types'
import path from 'path'

describe('MDC Stylesheet Compiler Engine', () => {
    const sampleDefinitionSource = `
        import { Color } from '@sandlada/mdk'
        import { createStyleDefinition } from '@sandlada/mdc/utils'

        export const ButtonDefinition = createStyleDefinition({
            'container-color': [Color.Primary, Color.PrimaryHover, Color.PrimaryActive, Color.PrimaryFocus, Color.Disabled],
            'container-height': '40px',
            'label-color': [Color.OnPrimary, Color.OnHover, Color.OnActive, Color.OnFocus, Color.Disabled],
        })
    `

    it('compiles full exported stylesheet array with host tokens and createStyleSheet state expansion via static AST', () => {
        const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
        const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

        const sampleStyleSource = `
            import { css, unsafeCSS } from 'lit'
            import { ButtonDefinition } from './button.definition'
            import { createStyleSheet, defineTokenRefsRecord } from '@sandlada/mdc/utils'

            const tokenRecord = defineTokenRefsRecord(ButtonDefinition, { prefix: '--md-button' })

            const stylePart = createStyleSheet([ButtonDefinition], () => css\`
                :host {
                    box-sizing: border-box;
                    display: inline-flex;
                }

                @anchor .container {
                    height: var(--_container-height);
                    background-color: var(--_container-color);

                    .label {
                        color: var(--_label-color);
                    }
                }
            \`)

            export const ButtonStyles = [
                css\`:host { \${unsafeCSS(tokens)}; }\`,
                stylePart,
            ]
        `

        const result = compileExportedStylesToCssSync(sampleStyleSource, metaMap, 'button.style.ts')

        expect(result.exportName).toBe('ButtonStyles')
        expect(result.definitionNames).toContain('ButtonDefinition')
        expect(result.totalRules).toBeGreaterThan(0)

        // 1. Check Header
        expect(result.compiledCss).toContain('MDC Compiled Stylesheet Preview (Live)')
        expect(result.compiledCss).toContain('Export: ButtonStyles')

        // 2. Check Base / Enabled Rules
        expect(result.compiledCss).toContain('[Layer 2] Base / Enabled State Rules')
        expect(result.compiledCss).toContain(':host {')
        expect(result.compiledCss).toContain('.container {')
        expect(result.compiledCss).toContain('height: var(--_container-height);')
        expect(result.compiledCss).toContain('background-color: var(--_enabled-container-color);')
        expect(result.compiledCss).toContain('.container .label {')
        expect(result.compiledCss).toContain('color: var(--_enabled-label-color);')

        // 3. Check Hover Deltas
        expect(result.compiledCss).toContain('[Layer 2.1] Hovered State Deltas (:hover)')
        expect(result.compiledCss).toContain('.container:hover {')
        expect(result.compiledCss).toContain('background-color: var(--_hovered-container-color);')
        expect(result.compiledCss).toContain('.container:hover .label {')
        expect(result.compiledCss).toContain('color: var(--_hovered-label-color);')

        // 4. Static property should NOT be in hover rule
        expect(result.compiledCss).not.toContain('.container:hover {\n    height:')

        // 5. Check Focus, Press, and Disabled Deltas
        expect(result.compiledCss).toContain('.container:focus-within {')
        expect(result.compiledCss).toContain('background-color: var(--_focused-container-color);')

        expect(result.compiledCss).toContain('.container:active {')
        expect(result.compiledCss).toContain('background-color: var(--_pressed-container-color);')

        expect(result.compiledCss).toContain('.container.disabled {')
        expect(result.compiledCss).toContain('background-color: var(--_disabled-container-color);')
    })

    it('compiles standalone createStyleSheet with @when and @media rules via static AST', () => {
        const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
        const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

        const sampleStyleSource = `
            import { css } from 'lit'
            import { ButtonDefinition } from './button.definition'
            import { createStyleSheet } from '@sandlada/mdc/utils'

            export const ButtonStyles = createStyleSheet(ButtonDefinition, () => css\`
                @anchor .container {
                    background-color: var(--_container-color);

                    @when(.selected) {
                        background-color: var(--_container-color);
                    }
                }

                @media (forced-colors: active) {
                    .container {
                        forced-color-adjust: none;
                        background-color: Highlight;
                    }
                }
            \`)
        `

        const result = compileExportedStylesToCssSync(sampleStyleSource, metaMap, 'button.style.ts')

        // 1. Base rule and when condition
        expect(result.compiledCss).toContain('.container.selected {')
        expect(result.compiledCss).toContain('background-color: var(--_enabled-container-color);')

        // 2. Hovered rule with when condition
        expect(result.compiledCss).toContain('.container.selected:hover {')
        expect(result.compiledCss).toContain('background-color: var(--_hovered-container-color);')

        // 3. Media query preservation
        expect(result.compiledCss).toContain('@media (forced-colors: active) {')
        expect(result.compiledCss).toContain('forced-color-adjust: none;')
        expect(result.compiledCss).toContain('background-color: Highlight;')
    })

    it('dynamically compiles real component stylesheet files with 100% genuine CSSResult output', async () => {
        const badgeStylePath = path.resolve(__dirname, '../../mdc/src/components/badge/badge.style.ts')
        const result = await compileExportedStylesToCss('', undefined, badgeStylePath)

        expect(result.exportName).toBe('BadgeStyles')
        expect(result.totalRules).toBeGreaterThan(0)
        expect(result.compiledCss).toContain('Genuine CSSResult Compilation')
        expect(result.compiledCss).toContain('--_enabled-large-container-color')
        expect(result.compiledCss).toContain('.container.large')
        expect(result.compiledCss).toContain('.container.small')
    })
})
