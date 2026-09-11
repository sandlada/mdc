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

const interactiveDefinition = JSON.stringify({
    states: ['enabled', 'hovered', 'focused', 'disabled'],
    tokens: {
        'container-color': {
            enabled: '#0b57d0',
            hovered: '#0842a0',
            focused: '#062e6f',
            disabled: '#e0e2ec'
        },
        'label-color': {
            enabled: '#ffffff',
            hovered: '#ffffff',
            focused: '#ffffff',
            disabled: '#8e919a'
        }
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
        outlined: ':host([variant="outlined"])'
    }
}, null, 4)

const interactiveTables = JSON.stringify({
    states: {
        enabled: '',
        hovered: ':hover',
        focused: ':focus-visible',
        disabled: '[disabled]'
    },
    variants: {}
}, null, 4)

const sizePreview = [
    '<button class="small">Small Button</button>',
    '<button class="medium">Medium Button</button>',
    '<button class="large">Large Button</button>'
].join('\n')

const interactivePreview = [
    '<button>Standard Button</button>',
    '<button disabled>Disabled Button</button>'
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
            '    border: none;',
            '    padding: 8px 16px;',
            '    border-radius: 8px;',
            '    font-weight: 500;',
            '}'
        ].join('\n'),
        definition: sizeDefinition,
        tables: sizeTables,
        previewHtml: sizePreview,
        hostAttrs: {}
    },
    {
        key: 'variant',
        label: '@variant — filled / outlined',
        description: 'Variant shells wrap the state expansion. Use the variant dropdown above the preview to switch shells.',
        css: [
            '@variant(filled, outlined) {',
            '    @state(button) button {',
            '        background-color: var(--_container-color);',
            '        color: var(--_label-color);',
            '        padding: 8px 16px;',
            '        border-radius: 8px;',
            '        border: 1px solid transparent;',
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
            '    padding: 8px 16px;',
            '    border-radius: 8px;',
            '    border: 2px solid transparent;',
            '}',
            '',
            '@when(:host([checked])) {',
            '    button {',
            '        border-color: #146c2e;',
            '        outline: 2px solid #146c2e;',
            '        outline-offset: 2px;',
            '    }',
            '}'
        ].join('\n'),
        definition: sizeDefinition,
        tables: sizeTables,
        previewHtml: sizePreview,
        hostAttrs: { checked: '' }
    },
    {
        key: 'nested-when',
        label: '@state + nested @when — state-scoped condition hoisting',
        description: 'Nested @when inside @state hoists conditions to the top level while preserving inner state selectors.',
        css: [
            '@state(button) button {',
            '    background-color: var(--_container-color);',
            '    color: var(--_label-color);',
            '    padding: 8px 16px;',
            '    border-radius: 8px;',
            '    border: 2px solid transparent;',
            '',
            '    @when(:host([dense])) {',
            '        padding: 4px 8px;',
            '        font-size: 12px;',
            '    }',
            '',
            '    @when(:host([checked])) {',
            '        border-color: #0b57d0;',
            '        box-shadow: 0 0 0 2px #0b57d0;',
            '    }',
            '}'
        ].join('\n'),
        definition: sizeDefinition,
        tables: sizeTables,
        previewHtml: sizePreview,
        hostAttrs: { dense: '', checked: '' }
    },
    {
        key: 'interleaved',
        label: '@variant × @state × @when — full trio interleaving',
        description: 'Three-way at-rule nesting: variant shells hoist, state modifiers insert at tail, and host conditions nest as &.',
        css: [
            '@variant(filled, outlined) {',
            '    @state(button) button {',
            '        background-color: var(--_container-color);',
            '        color: var(--_label-color);',
            '        padding: 8px 16px;',
            '        border-radius: 8px;',
            '        border: 1px solid transparent;',
            '',
            '        @when(:host([checked])) {',
            '            outline: 3px solid #6750a4;',
            '            outline-offset: 2px;',
            '        }',
            '    }',
            '}'
        ].join('\n'),
        definition: sizeDefinition,
        tables: variantTables,
        previewHtml: sizePreview,
        hostAttrs: { variant: 'filled', checked: '' }
    },
    {
        key: 'macros',
        label: 'Macros — shape & logical padding',
        description: 'AST-level declaration expander expands shape into corner radii and padding into logical block/inline properties.',
        css: [
            '@state(button) button {',
            '    background-color: var(--_container-color);',
            '    color: var(--_label-color);',
            '    shape: 8px 16px;',
            '    padding: 8px 16px;',
            '    border: 1px solid #7cacf8;',
            '    cursor: pointer;',
            '}'
        ].join('\n'),
        definition: sizeDefinition,
        tables: sizeTables,
        previewHtml: sizePreview,
        hostAttrs: {}
    },
    {
        key: 'interactive',
        label: 'Interactive — hover, focus & disabled states',
        description: 'Interactive pseudo-classes (:hover, :focus-visible, [disabled]) showcase tail-canonical insertion.',
        css: [
            '@state(button) button {',
            '    background-color: var(--_container-color);',
            '    color: var(--_label-color);',
            '    padding: 10px 24px;',
            '    border-radius: 20px;',
            '    border: none;',
            '    font-weight: 500;',
            '    cursor: pointer;',
            '}'
        ].join('\n'),
        definition: interactiveDefinition,
        tables: interactiveTables,
        previewHtml: interactivePreview,
        hostAttrs: {}
    }
]
