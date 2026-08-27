/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect } from 'vitest'
import { analyzeDefinitionSource } from '../src/core/definition-analyzer'
import { computeTokenRenameEdits } from '../src/core/rename-engine'
import type { DefinitionMeta } from '../src/core/types'

describe('MDC Bidirectional Token Rename Engine', () => {
    const sampleDefinitionSource = `
        import { Color } from '@sandlada/mdk'
        import { createStyleDefinition } from '@sandlada/mdc/utils'

        export const ButtonDefinition = createStyleDefinition({
            'container-color': [Color.Primary, Color.PrimaryHover, Color.PrimaryActive, Color.PrimaryFocus, Color.Disabled],
            'container-height': '40px',
        })
    `

    const sampleStylesheetSource = `
        import { css } from 'lit'
        import { createStyleSheet } from '@sandlada/mdc/utils'
        import { ButtonDefinition } from './button.definition'

        export const ButtonStyles = [
            createStyleSheet(ButtonDefinition, () => css\`
                .container {
                    background-color: var(--_container-color);
                    height: var(--_container-height);

                    &:hover {
                        background-color: var(--_container-color);
                    }
                }
            \`),
        ]
    `

    it('computes synchronized rename edits across definition and all referencing stylesheets', () => {
        const defMeta = analyzeDefinitionSource(sampleDefinitionSource, 'button.definition.ts')!
        const metaMap = new Map<string, DefinitionMeta>([[defMeta.name, defMeta]])

        const allStyleFiles = [
            { filePath: 'button.style.ts', sourceText: sampleStylesheetSource },
        ]

        const edits = computeTokenRenameEdits(
            '--_container-color',
            'container-background',
            'button.style.ts',
            sampleStylesheetSource,
            metaMap,
            allStyleFiles
        )

        expect(edits.length).toBe(3) // 1 in definition + 2 in stylesheet

        // 1. Definition edit
        const defEdit = edits.find((e) => e.filePath === 'button.definition.ts')
        expect(defEdit).toBeDefined()
        expect(defEdit!.newText).toBe("'container-background'")

        // 2. Stylesheet edits
        const styleEdits = edits.filter((e) => e.filePath === 'button.style.ts')
        expect(styleEdits.length).toBe(2)
        expect(styleEdits[0].newText).toBe('--_container-background')
        expect(styleEdits[1].newText).toBe('--_container-background')
    })
})
