/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { compileStateSheet } from '@sandlada/styles/compiler'
import type { StyleDiagnosticWarning } from '@sandlada/styles/compiler'
import { createStyleDefinition } from '@sandlada/styles/create-style-definition'
import { defineSchema } from '@sandlada/styles/define-schema'
import { emptyTables, isTriggerTables } from '@sandlada/styles/triggers'
import type { TriggerTables } from '@sandlada/styles/triggers'
import { stringifyTokens } from '@sandlada/styles/tokens'
import { PRESETS, type PlaygroundPreset } from './styles-playground-presets.js'
import { formatCss, formatHtml, formatJson } from './playground-format.js'

// Debounce for live recompilation on keystrokes. The compiler is synchronous
// and fast, so a short delay is enough to avoid thrashing on paste/type.
const COMPILE_DEBOUNCE_MS = 150

// Idle delay before auto-formatting the field being edited. Deliberately much
// longer than the compile debounce — formatting rewrites text and must never
// fight active typing.
const AUTO_FORMAT_IDLE_MS = 2000

const SHARE_HASH_PREFIX = '#s='

type EditorField = 'css' | 'definition' | 'tables' | 'preview'

interface SharedState {
    readonly preset: string
    readonly css: string
    readonly definition: string
    readonly tables: string
    readonly preview: string
    readonly attrs: Readonly<Record<string, string>>
}

const escapeStyleClose = (value: string): string => value.replace(/<\/style/gi, '<\\/style')

/**
 * `<styles-playground>` is a live `@sandlada/styles` compiler playground.
 *
 * Left: styles-format CSS input plus authoring definition / trigger-table
 * JSON editors. Right: compiled CSS output plus compiler warnings.
 * Below: an isolated preview stage (own shadow root) rendering sample
 * markup with the compiled CSS and generated token variables applied, with
 * host-attribute chips to toggle `:host(...)` conditions live.
 *
 * Only DOM-free barrels are imported (`compiler`, `define-schema`,
 * `create-style-definition`, `triggers`, `tokens`) — never `lit` or
 * `rolldown` subpaths.
 */
@customElement('styles-playground')
export class StylesPlayground extends LitElement {

    public static override styles = css`
        :host {
            display: block;
        }
        .toolbar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }
        .toolbar select {
            font: inherit;
            padding: 6px 10px;
            border-radius: 8px;
            border: 1px solid var(--md-sys-color-outline-variant);
            background: var(--md-sys-color-surface-container-low);
            color: var(--md-sys-color-on-surface);
        }
        .toolbar button {
            font: inherit;
            padding: 6px 14px;
            border-radius: 8px;
            border: 1px solid var(--md-sys-color-outline-variant);
            background: var(--md-sys-color-surface-container-low);
            color: var(--md-sys-color-on-surface);
            cursor: pointer;
        }
        .toolbar button:hover {
            background: var(--md-sys-color-surface-container-high);
        }
        .auto-format {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: var(--md-sys-color-on-surface-variant);
            cursor: pointer;
        }
        .format-notice {
            flex-basis: 100%;
            margin: 0;
            font-size: 13px;
            color: var(--md-sys-color-error);
        }
        .preset-description {
            flex-basis: 100%;
            margin: 0;
            color: var(--md-sys-color-on-surface-variant);
            font-size: 14px;
        }
        .editors {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
        }
        @media (max-width: 1100px) {
            .editors {
                grid-template-columns: 1fr;
            }
        }
        .editor label {
            display: block;
            margin: 0 0 6px;
            font-size: 13px;
            font-weight: 500;
            color: var(--md-sys-color-on-surface-variant);
        }
        .editor textarea {
            width: 100%;
            min-height: 320px;
            box-sizing: border-box;
            resize: vertical;
            font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
            font-size: 13px;
            line-height: 1.5;
            padding: 12px;
            border-radius: 12px;
            border: 1px solid var(--md-sys-color-outline-variant);
            background: var(--md-sys-color-surface-container-lowest);
            color: var(--md-sys-color-on-surface);
            white-space: pre;
        }
        .error {
            margin: 16px 0 0;
            padding: 12px 16px;
            border-radius: 12px;
            border: 1px solid var(--md-sys-color-error);
            background: var(--md-sys-color-error-container);
            color: var(--md-sys-color-on-error-container);
            font-size: 14px;
            white-space: pre-wrap;
        }
        .warnings {
            margin: 16px 0 0;
            padding: 12px 16px;
            border-radius: 12px;
            border: 1px solid var(--md-sys-color-outline-variant);
            background: var(--md-sys-color-surface-container-low);
            font-size: 14px;
        }
        .warnings h3 {
            margin: 0 0 8px;
            font-size: 13px;
            font-weight: 500;
            color: var(--md-sys-color-on-surface-variant);
        }
        .warnings ul {
            margin: 0;
            padding-left: 20px;
        }
        .warnings code {
            font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
            font-size: 12px;
        }
        .output-head {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 16px 0 6px;
        }
        .output-head h3 {
            margin: 0;
            font-size: 13px;
            font-weight: 500;
            color: var(--md-sys-color-on-surface-variant);
        }
        .output-head button {
            font: inherit;
            font-size: 13px;
            padding: 4px 12px;
            border-radius: 8px;
            border: 1px solid var(--md-sys-color-outline-variant);
            background: var(--md-sys-color-surface-container-low);
            color: var(--md-sys-color-on-surface);
            cursor: pointer;
        }
        .output {
            margin: 0;
            padding: 12px 16px;
            border-radius: 12px;
            border: 1px solid var(--md-sys-color-outline-variant);
            background: var(--md-sys-color-surface-container-lowest);
            font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
            font-size: 13px;
            line-height: 1.5;
            white-space: pre-wrap;
            word-break: break-word;
            min-height: 48px;
        }
        .preview-head {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
            margin: 24px 0 8px;
        }
        .preview-head h3 {
            margin: 0 8px 0 0;
            font-size: 13px;
            font-weight: 500;
            color: var(--md-sys-color-on-surface-variant);
        }
        .attr-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            padding: 4px 12px;
            border-radius: 999px;
            border: 1px solid var(--md-sys-color-outline-variant);
            background: var(--md-sys-color-surface-container-low);
            color: var(--md-sys-color-on-surface);
            cursor: pointer;
            user-select: none;
        }
        .attr-chip[aria-pressed="true"] {
            background: var(--md-sys-color-primary-container);
            color: var(--md-sys-color-on-primary-container);
            border-color: transparent;
        }
        .attr-chip select {
            font: inherit;
            border: 0;
            background: transparent;
            color: inherit;
            cursor: pointer;
        }
        .attr-hint {
            flex-basis: 100%;
            margin: 0;
            font-size: 12px;
            color: var(--md-sys-color-on-surface-variant);
        }
        #stage-host {
            display: block;
            padding: 24px;
            border-radius: 12px;
            border: 1px solid var(--md-sys-color-outline-variant);
            background: var(--md-sys-color-surface-container-lowest);
        }
    `

    @state()
    private presetKey: string = PRESETS[0]?.key ?? 'state'

    @state()
    private cssText: string = ''

    @state()
    private definitionText: string = ''

    @state()
    private tablesText: string = ''

    @state()
    private previewText: string = ''

    @state()
    private hostAttrs: Record<string, string> = {}

    @state()
    private output: string = ''

    @state()
    private warnings: StyleDiagnosticWarning[] = []

    @state()
    private error: string = ''

    @state()
    private shareLabel: string = 'Share link'

    @state()
    private autoFormatEnabled: boolean = true

    @state()
    private formatNotice: string = ''

    private compileTimer: number = 0
    private autoFormatTimer: number = 0
    private autoFormatField: EditorField | null = null
    private stageHost: HTMLElement | null = null
    private stageRoot: ShadowRoot | null = null

    public override connectedCallback(): void {
        super.connectedCallback()
        if (!this.restoreFromHash()) {
            this.loadPreset(this.currentPreset())
        }
        this.compileNow()
    }

    public override disconnectedCallback(): void {
        window.clearTimeout(this.compileTimer)
        window.clearTimeout(this.autoFormatTimer)
        super.disconnectedCallback()
    }

    protected override firstUpdated(): void {
        const host = this.shadowRoot?.getElementById('stage-host')
        if (host !== null && host !== undefined) {
            this.stageHost = host as HTMLElement
            this.stageRoot = this.stageHost.attachShadow({ mode: 'open' })
            this.renderStage()
        }
    }

    public override render() {
        const preset = this.currentPreset()
        return html`
            <div class="toolbar">
                <select
                    aria-label="Example preset"
                    .value=${this.presetKey}
                    @change=${this.onPresetChange}
                >
                    ${PRESETS.map((p) => html`
                        <option value=${p.key} ?selected=${p.key === this.presetKey}>${p.label}</option>
                    `)}
                </select>
                <button type="button" @click=${this.onReset}>Reset</button>
                <button type="button" @click=${this.onFormatAll}>Format all</button>
                <button type="button" @click=${this.onShare}>${this.shareLabel}</button>
                <label class="auto-format">
                    <input
                        type="checkbox"
                        .checked=${this.autoFormatEnabled}
                        @change=${this.onAutoFormatToggle}
                    />
                    Auto-format on idle
                </label>
                ${this.formatNotice !== '' ? html`<p class="format-notice" role="status">${this.formatNotice}</p>` : ''}
                <p class="preset-description">${preset.description}</p>
            </div>
            <div class="editors">
                <div class="editor">
                    <label for="play-css">Styles CSS input</label>
                    <textarea
                        id="play-css"
                        data-field="css"
                        spellcheck="false"
                        .value=${this.cssText}
                        @input=${this.onCssInput}
                        @keydown=${this.onEditorKeydown}
                    ></textarea>
                </div>
                <div class="editor">
                    <label for="play-definition">Definition JSON — { states, tokens }</label>
                    <textarea
                        id="play-definition"
                        data-field="definition"
                        spellcheck="false"
                        .value=${this.definitionText}
                        @input=${this.onDefinitionInput}
                        @keydown=${this.onEditorKeydown}
                    ></textarea>
                </div>
                <div class="editor">
                    <label for="play-tables">Tables JSON — { states, variants }</label>
                    <textarea
                        id="play-tables"
                        data-field="tables"
                        spellcheck="false"
                        .value=${this.tablesText}
                        @input=${this.onTablesInput}
                        @keydown=${this.onEditorKeydown}
                    ></textarea>
                </div>
            </div>
            ${this.error !== '' ? html`<p class="error" role="alert">${this.error}</p>` : ''}
            ${this.warnings.length > 0 ? html`
                <div class="warnings">
                    <h3>Compiler warnings (${this.warnings.length})</h3>
                    <ul>
                        ${this.warnings.map((w) => html`<li><code>${w.type}</code> — ${w.message}</li>`)}
                    </ul>
                </div>
            ` : ''}
            <div class="output-head">
                <h3>Compiled CSS</h3>
                <button type="button" @click=${this.onCopyOutput}>Copy</button>
            </div>
            <pre class="output">${this.output}</pre>
            <div class="preview-head">
                <h3>Live preview</h3>
                ${this.attrNames().map((name) => name === 'variant' ? html`
                    <label class="attr-chip" aria-pressed=${name in this.hostAttrs ? 'true' : 'false'}>
                        variant=
                        <select .value=${this.hostAttrs['variant'] ?? ''} @change=${this.onVariantSelect}>
                            ${this.variantNames().map((v) => html`
                                <option value=${v} ?selected=${v === this.hostAttrs['variant']}>${v}</option>
                            `)}
                        </select>
                    </label>
                ` : html`
                    <button
                        type="button"
                        class="attr-chip"
                        aria-pressed=${name in this.hostAttrs ? 'true' : 'false'}
                        @click=${() => this.toggleHostAttr(name)}
                    >[${name in this.hostAttrs ? '' : 'no '}${name}]</button>
                `)}
                <p class="attr-hint">Chips toggle attributes on the preview stage host — this is what <code>:host(...)</code> conditions match against. The preview editor below sets the sample markup.</p>
            </div>
            <div id="stage-host"></div>
            <div class="editors" style="margin-top: 16px;">
                <div class="editor">
                    <label for="play-preview">Preview markup</label>
                    <textarea
                        id="play-preview"
                        data-field="preview"
                        spellcheck="false"
                        .value=${this.previewText}
                        @input=${this.onPreviewInput}
                        @keydown=${this.onEditorKeydown}
                    ></textarea>
                </div>
            </div>
        `
    }

    private currentPreset(): PlaygroundPreset {
        return PRESETS.find((p) => p.key === this.presetKey) ?? PRESETS[0] as PlaygroundPreset
    }

    private loadPreset(preset: PlaygroundPreset): void {
        this.cssText = preset.css
        this.definitionText = preset.definition
        this.tablesText = preset.tables
        this.previewText = preset.previewHtml
        this.hostAttrs = { ...preset.hostAttrs }
    }

    private onPresetChange = (event: Event): void => {
        const select = event.target as HTMLSelectElement
        this.presetKey = select.value
        this.loadPreset(this.currentPreset())
        window.history.replaceState(null, '', window.location.pathname)
        this.compileNow()
    }

    private onReset = (): void => {
        this.loadPreset(this.currentPreset())
        window.history.replaceState(null, '', window.location.pathname)
        this.compileNow()
    }

    private onCssInput = (event: Event): void => {
        this.cssText = (event.target as HTMLTextAreaElement).value
        this.formatNotice = ''
        this.scheduleCompile()
        this.scheduleAutoFormat('css')
    }

    private onDefinitionInput = (event: Event): void => {
        this.definitionText = (event.target as HTMLTextAreaElement).value
        this.formatNotice = ''
        this.scheduleCompile()
        this.scheduleAutoFormat('definition')
    }

    private onTablesInput = (event: Event): void => {
        this.tablesText = (event.target as HTMLTextAreaElement).value
        this.formatNotice = ''
        this.scheduleCompile()
        this.scheduleAutoFormat('tables')
    }

    private onPreviewInput = (event: Event): void => {
        this.previewText = (event.target as HTMLTextAreaElement).value
        this.formatNotice = ''
        this.scheduleCompile()
        this.scheduleAutoFormat('preview')
    }

    private scheduleCompile(): void {
        window.clearTimeout(this.compileTimer)
        this.compileTimer = window.setTimeout(() => this.compileNow(), COMPILE_DEBOUNCE_MS)
    }

    private compileNow(): void {
        try {
            const definition = this.buildDefinition()
            const tables = this.buildTables()
            const collected: StyleDiagnosticWarning[] = []
            const compiled = compileStateSheet(definition, this.cssText, {
                tables,
                onWarn: (warning) => {
                    collected.push(warning)
                }
            })
            const tokenVars = stringifyTokens({ prefix: '--play', selector: ':host' })(definition).cssText
            this.output = formatCss(compiled)
            this.warnings = collected
            this.error = ''
            this.renderStage(tokenVars, compiled)
        } catch (unknownError) {
            this.output = ''
            this.warnings = []
            this.error = unknownError instanceof Error ? unknownError.message : String(unknownError)
            this.renderStage('', '')
        }
    }

    private buildDefinition(): Record<string, unknown> {
        let parsed: unknown
        try {
            parsed = JSON.parse(this.definitionText)
        } catch {
            throw new Error('[playground] Definition is not valid JSON.')
        }
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('[playground] Definition must be a JSON object shaped { states, tokens }.')
        }
        const record = parsed as Record<string, unknown>
        if (!Array.isArray(record['states']) || record['states'].length === 0) {
            throw new Error('[playground] Definition.states must be a non-empty array of state names.')
        }
        if (record['tokens'] === null || typeof record['tokens'] !== 'object' || Array.isArray(record['tokens'])) {
            throw new Error('[playground] Definition.tokens must be a JSON object.')
        }
        const schema = defineSchema(record['states'] as string[])
        return createStyleDefinition(schema)(record['tokens'] as Record<string, unknown>) as unknown as Record<string, unknown>
    }

    private buildTables(): TriggerTables {
        if (this.tablesText.trim().length === 0) {
            return emptyTables
        }
        let parsed: unknown
        try {
            parsed = JSON.parse(this.tablesText)
        } catch {
            throw new Error('[playground] Tables is not valid JSON.')
        }
        if (!isTriggerTables(parsed)) {
            throw new Error('[playground] Tables must match { states: {…}, variants: {…} }.')
        }
        return parsed
    }

    private attrNames(): string[] {
        return [...new Set([...Object.keys(this.hostAttrs), ...Object.keys(this.currentPreset().hostAttrs)])]
    }

    private variantNames(): string[] {
        try {
            const parsed: unknown = JSON.parse(this.tablesText)
            if (isTriggerTables(parsed)) {
                return Object.keys(parsed.variants)
            }
        } catch {
            // Invalid tables JSON — the compile error banner covers it.
        }
        return []
    }

    private toggleHostAttr(name: string): void {
        if (name in this.hostAttrs) {
            const next = { ...this.hostAttrs }
            delete next[name]
            this.hostAttrs = next
        } else {
            const presetValue = this.currentPreset().hostAttrs[name] ?? ''
            this.hostAttrs = { ...this.hostAttrs, [name]: presetValue }
        }
        this.compileNow()
    }

    private onVariantSelect = (event: Event): void => {
        const select = event.target as HTMLSelectElement
        this.hostAttrs = { ...this.hostAttrs, variant: select.value }
        this.compileNow()
    }

    private fieldFormatter(field: EditorField): (source: string) => string {
        if (field === 'css') {
            return formatCss
        }
        if (field === 'preview') {
            return formatHtml
        }
        return formatJson
    }

    private fieldText(field: EditorField): string {
        if (field === 'css') {
            return this.cssText
        }
        if (field === 'definition') {
            return this.definitionText
        }
        if (field === 'tables') {
            return this.tablesText
        }
        return this.previewText
    }

    private setFieldText(field: EditorField, value: string): void {
        if (field === 'css') {
            this.cssText = value
        } else if (field === 'definition') {
            this.definitionText = value
        } else if (field === 'tables') {
            this.tablesText = value
        } else {
            this.previewText = value
        }
    }

    private fieldOf(target: EventTarget | null): EditorField | null {
        const field = (target as HTMLElement | null)?.dataset?.['field']
        if (field === 'css' || field === 'definition' || field === 'tables' || field === 'preview') {
            return field
        }
        return null
    }

    private onEditorKeydown = (event: KeyboardEvent): void => {
        const area = event.target as HTMLTextAreaElement
        if (event.key === 'Tab') {
            event.preventDefault()
            this.indentSelection(area, event.shiftKey ? -1 : 1)
            return
        }
        if (event.key === 'Backspace' && !event.metaKey && !event.ctrlKey && !event.altKey) {
            this.unindentBackspace(area, event)
        }
    }

    private syncFromArea(area: HTMLTextAreaElement): void {
        const field = this.fieldOf(area)
        if (field !== null) {
            this.setFieldText(field, area.value)
        }
        this.scheduleCompile()
        if (field !== null) {
            this.scheduleAutoFormat(field)
        }
    }

    private indentSelection(area: HTMLTextAreaElement, direction: 1 | -1): void {
        const value = area.value
        const start = area.selectionStart ?? 0
        const end = area.selectionEnd ?? value.length
        const sliceStart = value.lastIndexOf('\n', start - 1) + 1
        const nextBreak = value.indexOf('\n', end)
        const sliceEnd = nextBreak === -1 ? value.length : nextBreak
        const updated = value.slice(sliceStart, sliceEnd).split('\n').map((line) => {
            if (direction === 1) {
                return `    ${line}`
            }
            return line.replace(/^ {1,4}/, '')
        }).join('\n')
        area.value = `${value.slice(0, sliceStart)}${updated}${value.slice(sliceEnd)}`
        const delta = updated.length - (sliceEnd - sliceStart)
        area.setSelectionRange(start + (direction === 1 ? 4 : 0), end + delta)
        this.syncFromArea(area)
    }

    private unindentBackspace(area: HTMLTextAreaElement, event: KeyboardEvent): void {
        const pos = area.selectionStart ?? 0
        const end = area.selectionEnd ?? 0
        if (pos !== end || pos === 0) {
            return
        }
        const lineStart = area.value.lastIndexOf('\n', pos - 1) + 1
        const column = pos - lineStart
        const trailing = / *$/.exec(area.value.slice(lineStart, pos))?.[0].length ?? 0
        if (trailing === 0) {
            return
        }
        event.preventDefault()
        const remove = column % 4 === 0 ? Math.min(4, trailing) : Math.min(column % 4, trailing)
        area.value = `${area.value.slice(0, pos - remove)}${area.value.slice(pos)}`
        area.setSelectionRange(pos - remove, pos - remove)
        this.syncFromArea(area)
    }

    private onAutoFormatToggle = (event: Event): void => {
        this.autoFormatEnabled = (event.target as HTMLInputElement).checked
        window.clearTimeout(this.autoFormatTimer)
        this.autoFormatField = null
    }

    private scheduleAutoFormat(field: EditorField): void {
        window.clearTimeout(this.autoFormatTimer)
        this.autoFormatField = null
        if (!this.autoFormatEnabled) {
            return
        }
        this.autoFormatField = field
        this.autoFormatTimer = window.setTimeout(() => this.runAutoFormat(), AUTO_FORMAT_IDLE_MS)
    }

    private runAutoFormat(): void {
        const field = this.autoFormatField
        this.autoFormatField = null
        if (field === null || !this.autoFormatEnabled) {
            return
        }
        const area = this.shadowRoot?.querySelector(`textarea[data-field="${field}"]`)
        if (!(area instanceof HTMLTextAreaElement) || this.shadowRoot?.activeElement !== area) {
            return
        }
        let formatted = ''
        try {
            formatted = this.fieldFormatter(field)(area.value)
        } catch {
            return
        }
        if (formatted === area.value) {
            return
        }
        this.applyFormatted(field, area, formatted)
        this.scheduleCompile()
    }

    private applyFormatted(field: EditorField, area: HTMLTextAreaElement, formatted: string): void {
        const caret = area.selectionStart ?? area.value.length
        const before = area.value.slice(0, caret)
        let common = 0
        while (common < before.length && common < formatted.length && before[common] === formatted[common]) {
            common++
        }
        this.setFieldText(field, formatted)
        const position = Math.min(common, formatted.length)
        void this.updateComplete.then(() => {
            area.setSelectionRange(position, position)
        })
    }

    private onFormatAll = (): void => {
        const failed: string[] = []
        const focused = this.shadowRoot?.activeElement
        for (const field of ['css', 'definition', 'tables', 'preview'] as const) {
            const current = this.fieldText(field)
            try {
                const formatted = this.fieldFormatter(field)(current)
                if (formatted === current) {
                    continue
                }
                this.setFieldText(field, formatted)
                if (focused instanceof HTMLTextAreaElement && focused.dataset['field'] === field) {
                    const caret = focused.selectionStart ?? current.length
                    const before = current.slice(0, caret)
                    let common = 0
                    while (common < before.length && common < formatted.length && before[common] === formatted[common]) {
                        common++
                    }
                    const position = Math.min(common, formatted.length)
                    void this.updateComplete.then(() => {
                        focused.setSelectionRange(position, position)
                    })
                }
            } catch {
                failed.push(field)
            }
        }
        this.formatNotice = failed.length === 0
            ? ''
            : `Skipped invalid JSON (kept as-is): ${failed.join(', ')}.`
        this.scheduleCompile()
    }

    private renderStage(tokenVars: string = '', compiled: string = ''): void {
        if (this.stageHost === null || this.stageRoot === null) {
            return
        }
        for (const attr of [...this.stageHost.attributes]) {
            if (attr.name !== 'id') {
                this.stageHost.removeAttribute(attr.name)
            }
        }
        for (const [name, value] of Object.entries(this.hostAttrs)) {
            this.stageHost.setAttribute(name, value)
        }
        const styleBody = `:host {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 12px;\n}\n${tokenVars}\n${compiled}`
        this.stageRoot.innerHTML = `<style>${escapeStyleClose(styleBody)}</style>${this.previewText}`
    }

    private onCopyOutput = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(this.output)
        } catch {
            // Clipboard may be unavailable (non-secure context) — no-op.
        }
    }

    private onShare = async (): Promise<void> => {
        const shared: SharedState = {
            preset: this.presetKey,
            css: this.cssText,
            definition: this.definitionText,
            tables: this.tablesText,
            preview: this.previewText,
            attrs: this.hostAttrs
        }
        const hash = `${SHARE_HASH_PREFIX}${encodeURIComponent(JSON.stringify(shared))}`
        window.history.replaceState(null, '', hash)
        try {
            await navigator.clipboard.writeText(window.location.href)
            this.shareLabel = 'Link copied'
            window.setTimeout(() => {
                this.shareLabel = 'Share link'
            }, 1500)
        } catch {
            this.shareLabel = 'Link in address bar'
        }
    }

    private restoreFromHash(): boolean {
        if (!window.location.hash.startsWith(SHARE_HASH_PREFIX)) {
            return false
        }
        try {
            const restored = JSON.parse(decodeURIComponent(window.location.hash.slice(SHARE_HASH_PREFIX.length))) as Partial<SharedState>
            if (typeof restored.css !== 'string' || typeof restored.definition !== 'string' || typeof restored.tables !== 'string') {
                return false
            }
            if (typeof restored.preset === 'string' && PRESETS.some((p) => p.key === restored.preset)) {
                this.presetKey = restored.preset
            }
            this.cssText = restored.css
            this.definitionText = restored.definition
            this.tablesText = restored.tables
            this.previewText = typeof restored.preview === 'string' ? restored.preview : this.currentPreset().previewHtml
            this.hostAttrs = restored.attrs !== null && typeof restored.attrs === 'object' && !Array.isArray(restored.attrs)
                ? { ...(restored.attrs as Record<string, string>) }
                : { ...this.currentPreset().hostAttrs }
            return true
        } catch {
            return false
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'styles-playground': StylesPlayground
    }
}
