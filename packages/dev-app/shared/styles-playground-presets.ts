/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

// Built-in presets for `<styles-playground>`. All payloads use the authoring
// JSON shape (not the resolved internals): `definition` is
// `{ states, tokens }` and is run through the real `defineSchema` +
// `createStyleDefinition` pipeline in the browser; `tables` is
// `{ states, variants }` selector mappings validated by `isTriggerTables`.

export interface PlaygroundPreset {
    readonly key: string
    readonly label: string
    readonly description: string
    /** Styles-format CSS (`@state` / `@variant` / `@when`). */
    readonly css: string
    /** Pretty-printed authoring definition JSON shown in the editor. */
    readonly definition: string
    /** Pretty-printed trigger tables JSON shown in the editor. */
    readonly tables: string
    /** Sample markup rendered inside the isolated preview stage. */
    readonly previewHtml: string
    /** Initial attributes applied to the preview stage host. */
    readonly hostAttrs: Readonly<Record<string, string>>
}

const sizeDefinition = JSON.stringify({
    states: ['small', 'medium', 'large'],
    tokens: {
        'container-color': {
            small: '#d3e3fd',
            medium: '#a8c7fa',
            large: '#7cacf8'
        },
        'label-color': '#041e49'
    }
}, null, 4)

const sizeTables = JSON.stringify({
    states: {
        small: '.small',
        medium: '.medium',
        large: '.large'
    },
    variants: {}
}, null, 4)

const variantTables = JSON.stringify({
    states: {
        small: '.small',
        medium: '.medium',
        large: '.large'
    },
    variants: {
        filled: ':host([variant="filled"])',
        tonal: ':host([variant="tonal"])'
    }
}, null, 4)

const sizePreview = [
    '<button class="small">Small</button>',
    '<button class="medium">Medium</button>',
    '<button class="large">Large</button>'
].join('\n')

export const PRESETS: readonly PlaygroundPreset[] = [
    {
        key: 'state',
        label: '@state — size states',
        description: 'One state dimension expanded onto button targets. Try changing a color value in the definition JSON.',
        css: [
            '@state(button) button {',
            '    background-color: var(--_container-color);',
            '    color: var(--_label-color);',
            '}'
        ].join('\n'),
        definition: sizeDefinition,
        tables: sizeTables,
        previewHtml: sizePreview,
        hostAttrs: {}
    },
    {
        key: 'variant',
        label: '@variant — filled / tonal',
        description: 'Variant shells wrap the state expansion. Use the variant dropdown above the preview to switch shells.',
        css: [
            '@variant(filled, tonal) {',
            '    @state(button) button {',
            '        background-color: var(--_container-color);',
            '        color: var(--_label-color);',
            '    }',
            '}'
        ].join('\n'),
        definition: sizeDefinition,
        tables: variantTables,
        previewHtml: sizePreview,
        hostAttrs: { variant: 'filled' }
    },
    {
        key: 'when',
        label: '@when — host condition',
        description: 'The host condition hoists to a top-level shell. Toggle the checked chip above the preview to see it apply.',
        css: [
            '@state(button) button {',
            '    background-color: var(--_container-color);',
            '    color: var(--_label-color);',
            '}',
            '',
            '@when(:host([checked])) {',
            '    button {',
            '        outline: 3px solid #146c2e;',
            '        outline-offset: 2px;',
            '    }',
            '}'
        ].join('\n'),
        definition: sizeDefinition,
        tables: sizeTables,
        previewHtml: sizePreview,
        hostAttrs: { checked: '' }
    }
]
