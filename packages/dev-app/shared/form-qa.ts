/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import './base-imports'
import './theme'
import './docs-shell'

type Attributes = Record<string, string>
type Control = HTMLElement & {
    updateComplete?: Promise<boolean>
    validationMessage?: string
    validity?: ValidityState
    willValidate?: boolean
    show?: () => Promise<void>
}

interface Example {
    readonly key: string
    readonly title: string
    readonly tag: string
    readonly attributes?: Attributes
    readonly content?: string
    readonly label?: string
}

const ButtonTypes = ['submit', 'reset', 'button'] as const
const ToggleTypes = ['checkbox', 'radio'] as const
const FormTargets = ['qa-primary', 'qa-secondary', 'qa-missing'] as const
const TextTypes = [
    'text', 'email', 'number', 'password', 'search', 'tel', 'url', 'color',
    'date', 'datetime-local', 'month', 'time', 'week', 'textarea',
] as const
const BooleanAttributes = new Set([
    'disabled', 'required', 'readonly', 'checked', 'selected', 'default-checked',
    'default-selected', 'indeterminate', 'tristate', 'ranged', 'is-24-hour',
])
const AttributeOptions: Record<string, readonly string[]> = {
    form: FormTargets,
    for: ['qa-external-check', 'qa-secondary-check', 'qa-missing'],
    selection: ['single', 'range'],
}
const ComponentAttributes: Record<string, readonly string[]> = {
    'mdc-button': ['value', 'type'],
    'mdc-icon-button': ['value', 'type'],
    button: ['value', 'type'],
    'mdc-checkbox': ['value', 'required', 'checked', 'default-checked', 'indeterminate', 'tristate'],
    'mdc-radio-button': ['value', 'required', 'checked', 'default-checked'],
    'mdc-switch': ['value', 'required', 'selected', 'default-selected'],
    'mdc-navigation-tab': ['value', 'required', 'checked', 'default-checked'],
    'mdc-toggle-button': ['value', 'required', 'type', 'checked', 'default-checked'],
    'mdc-toggle-icon-button': ['value', 'required', 'type', 'checked', 'default-checked'],
    'mdc-text-field': ['value', 'required', 'readonly', 'type', 'pattern', 'minlength', 'maxlength', 'min', 'max', 'step'],
    'mdc-select': ['value', 'required', 'selected-index'],
    'mdc-slider': ['value', 'type', 'min', 'max', 'step', 'value-start', 'value-end', 'name-start', 'name-end',
        'default-value', 'default-value-start', 'default-value-end'],
    'mdc-legacy-slider': ['value', 'ranged', 'min', 'max', 'step', 'value-start', 'value-end', 'name-start', 'name-end',
        'default-value', 'default-value-start', 'default-value-end'],
    'mdc-date-picker': ['value', 'required', 'selection', 'range-start', 'range-end', 'min', 'max'],
    'mdc-time-picker': ['hour', 'minute', 'is-24-hour'],
}
const TypesByTag: Record<string, readonly string[]> = {
    'mdc-slider': ['standard', 'centered', 'range'],
    'mdc-text-field': TextTypes,
    'mdc-toggle-button': ToggleTypes,
    'mdc-toggle-icon-button': ToggleTypes,
}
const CurrentProperties = [
    'type', 'name', 'value', 'checked', 'selected', 'selectedIndex', 'disabled', 'required',
    'readOnly', 'indeterminate', 'valueStart', 'valueEnd', 'rangeStart', 'rangeEnd', 'hour', 'minute',
] as const
const StateFamilies = [
    ['checkbox', 'mdc-checkbox', 'checked'],
    ['switch', 'mdc-switch', 'selected'],
    ['radio', 'mdc-radio-button', 'checked'],
    ['navigation-tab', 'mdc-navigation-tab', 'checked'],
    ['toggle-button', 'mdc-toggle-button', 'checked'],
    ['toggle-icon', 'mdc-toggle-icon-button', 'checked'],
] as const
const StatePresets = [
    ['initial', 'Current only', true, false],
    ['default', 'Reset default only', false, true],
    ['both', 'Current and reset default', true, true],
] as const

function element<T extends HTMLElement>(id: string): T {
    const node = document.getElementById(id)
    if (!node) throw new Error(`Missing Form QA element: ${id}`)
    return node as T
}

const FormA = element<HTMLFormElement>('qa-primary')
const FormB = element<HTMLFormElement>('qa-secondary')
const Forms = [FormA, FormB]
const Selector = element<HTMLSelectElement>('qa-example')
const Editor = element('qa-attributes')
const State = element('qa-state')
const Events = element('qa-events')
const Status = element('qa-status')
const Controls = new Map<string, { example: Example; control: Control }>()
const Editors = new Map<string, HTMLInputElement | HTMLSelectElement>()

function createControl(example: Example): Control {
    // Assemble fixture markup in an inert template so the browser upgrades it on insertion.
    // The tag and content come only from the fixtures in this module.
    const template = document.createElement('template')
    template.innerHTML = `<${example.tag}>${example.content ?? ''}</${example.tag}>`
    const control = template.content.firstElementChild as Control
    control.id = `qa-${example.key}`
    control.setAttribute('aria-label', example.title)
    for (const [attribute, value] of Object.entries(example.attributes ?? {})) {
        control.setAttribute(attribute, value)
    }
    return control
}

function addExample(example: Example, container: HTMLElement): void {
    const control = createControl(example)
    Controls.set(example.key, { example, control })
    Selector.add(new Option(example.title, example.key))
    if (example.label) {
        control.removeAttribute('aria-label')
        const label = document.createElement('label')
        label.id = `qa-label-${example.key}`
        label.htmlFor = control.id
        label.textContent = example.label
        container.append(label)
    }
    container.append(control)
}

function addCard(example: Example, container: HTMLElement, note?: string): void {
    const card = document.createElement('div')
    card.className = 'qa-preset'
    addExample(example, card)
    const caption = document.createElement('small')
    caption.textContent = note ?? example.title
    card.prepend(caption)
    if (example.tag === 'mdc-date-picker' || example.tag === 'mdc-time-picker') {
        const open = document.createElement('button')
        open.type = 'button'
        open.textContent = `Open ${example.title}`
        open.addEventListener('click', () => void Controls.get(example.key)?.control.show?.())
        card.append(open)
    }
    container.append(card)
}

function addButtonCases(): void {
    const inside = element('qa-inside-buttons')
    const external = element('qa-external-examples')
    const buttons = [
        ['button', 'mdc-button', 'MDC'],
        ['icon', 'mdc-icon-button', 'Icon'],
        ['native', 'button', 'Native'],
    ] as const
    const icons: Record<string, string> = { submit: 'send', reset: 'restart_alt', button: 'touch_app' }

    for (const [key, tag, label] of buttons) {
        for (const type of ButtonTypes) {
            const title = `${label} ${type}`
            addExample({
                key: `${key}-${type}`,
                tag,
                title,
                attributes: { type, name: 'action', value: `${key}-${type}` },
                content: tag === 'mdc-icon-button' ? `<mdc-icon>${icons[type]}</mdc-icon>` : title,
            }, inside)
        }
    }
    addExample({
        key: 'disabled-submit', tag: 'mdc-button', title: 'Disabled submit', content: 'Disabled submit',
        attributes: { type: 'submit', name: 'action', value: 'disabled', disabled: '' },
    }, inside)
    addExample({
        key: 'external-submit', tag: 'mdc-button', title: 'External submit A', content: 'External submit A',
        attributes: { type: 'submit', form: FormA.id, name: 'action', value: 'external-submit' },
    }, external)
    addExample({
        key: 'external-reset', tag: 'mdc-icon-button', title: 'External reset A', content: '<mdc-icon>restart_alt</mdc-icon>',
        attributes: { type: 'reset', form: FormA.id },
    }, external)

    for (const [action, title] of [['requestSubmit', 'Request submit A'], ['reset', 'Reset A via API']] as const) {
        const button = document.createElement('button')
        button.type = 'button'
        button.textContent = title
        button.addEventListener('click', () => FormA[action]())
        inside.append(button)
    }
}

function addStateCases(): void {
    for (const [family, tag, state] of StateFamilies) {
        const group = document.createElement('fieldset')
        const legend = document.createElement('legend')
        legend.textContent = tag
        const row = document.createElement('div')
        row.className = 'qa-grid'
        for (const [preset, title, current, reset] of StatePresets) {
            const key = `${family}-${preset}`
            const attributes: Attributes = { name: key, value: 'on' }
            if (current) attributes[state] = ''
            if (reset) attributes[`default-${state}`] = ''
            if (tag === 'mdc-toggle-button' || tag === 'mdc-toggle-icon-button') attributes['type'] = 'checkbox'
            if (tag === 'mdc-navigation-tab') attributes['label'] = title
            const content = tag === 'mdc-toggle-icon-button' ? '<mdc-icon>check</mdc-icon>' : title
            const note = [current && state, reset && `default-${state}`].filter(Boolean).join(' + ')
            addCard({ key, title: `${tag} · ${title}`, tag, attributes, content }, row, note)
        }
        group.append(legend, row)
        element('qa-states').append(group)
    }

    const group = document.createElement('fieldset')
    const legend = document.createElement('legend')
    legend.textContent = 'Same-name radio groups'
    const row = document.createElement('div')
    row.className = 'qa-actions'
    for (const tag of ['mdc-radio-button', 'mdc-toggle-button', 'mdc-toggle-icon-button']) {
        const name = `${tag}-group`
        for (const variant of ['A', 'B']) {
            const title = `${tag} ${variant}`
            const attributes: Attributes = { name, value: variant }
            if (tag !== 'mdc-radio-button') attributes['type'] = 'radio'
            if (variant === 'A') attributes['checked'] = ''
            if (variant === 'B') attributes['default-checked'] = ''
            addCard({
                key: `${name}-${variant.toLowerCase()}`, title, tag, attributes,
                content: tag === 'mdc-toggle-icon-button' ? `<mdc-icon>looks_${variant === 'A' ? 'one' : 'two'}</mdc-icon>` : title,
            }, row)
        }
    }
    group.append(legend, row)
    element('qa-states').append(group)
}

function addValueCases(): void {
    const startDate = String(Date.UTC(2026, 0, 12))
    const examples: Example[] = [
        { key: 'email', title: 'Email', tag: 'mdc-text-field',
            attributes: { name: 'email', label: 'Email', type: 'email', value: 'qa@example.test', required: '' } },
        { key: 'fruit', title: 'Fruit', tag: 'mdc-select', attributes: { name: 'fruit', label: 'Fruit' },
            content: '<mdc-select-option value="apple" selected>Apple</mdc-select-option><mdc-select-option value="pear">Pear</mdc-select-option>' },
        { key: 'slider', title: 'Slider', tag: 'mdc-slider',
            attributes: { name: 'rating', value: '30', 'default-value': '60', min: '0', max: '100', step: '5' } },
        { key: 'range', title: 'Range slider', tag: 'mdc-slider',
            attributes: { type: 'range', 'name-start': 'price', 'name-end': 'price', 'value-start': '20',
                'value-end': '80', 'aria-label-start': 'Minimum price', 'aria-label-end': 'Maximum price' } },
        { key: 'legacy', title: 'Legacy slider', tag: 'mdc-legacy-slider', attributes: { name: 'legacy', value: '25' } },
        { key: 'date', title: 'Date picker', tag: 'mdc-date-picker',
            attributes: { name: 'date', value: startDate, headline: 'Select date', variant: 'modal' } },
        { key: 'time', title: 'Time picker', tag: 'mdc-time-picker',
            attributes: { name: 'time', hour: '9', minute: '30', headline: 'Select time', variant: 'input' } },
    ]
    for (const example of examples) addCard(example, element('qa-values'))
    addExample({
        key: 'secondary-check', title: 'Form B checkbox', tag: 'mdc-checkbox', label: 'Form B checkbox label',
        attributes: { name: 'second', value: 'yes', checked: '' },
    }, element('qa-secondary-values'))
    addExample({
        key: 'external-check', title: 'External checkbox', tag: 'mdc-checkbox', label: 'External checkbox label',
        attributes: { name: 'external', value: 'yes', form: FormA.id, 'default-checked': '' },
    }, element('qa-external-examples'))
}

function owner(control: Control): HTMLFormElement | undefined {
    return Forms.find(form => Array.from(form.elements).includes(control))
}

function labelFor(example: Example): HTMLLabelElement | null {
    return document.querySelector<HTMLLabelElement>(`#qa-label-${example.key}`)
}

function dataEntries(form: HTMLFormElement, submitter?: HTMLElement | null): [string, FormDataEntryValue][] {
    // The library supplies the custom submitter value through ElementInternals.
    // The FormData submitter argument only accepts native submit buttons.
    const native = submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement
    return Array.from(new FormData(form, native ? submitter : undefined).entries())
}

function formatData(data: [string, FormDataEntryValue][]): string {
    return data.length ? data.map(([name, value]) => `${JSON.stringify(name)} = ${JSON.stringify(value)}`).join('\n') : '(empty)'
}

function readState(control: Control): string {
    const properties = CurrentProperties.flatMap(property => {
        const value: unknown = Reflect.get(control, property)
        return value === undefined ? [] : [`${property} = ${JSON.stringify(value)}`]
    })
    const valid = control.validity?.valid ?? (control.matches(':valid') ? true : control.matches(':invalid') ? false : undefined)
    const focused = document.activeElement
    return [
        `owner = ${owner(control)?.id ?? '(none)'}`,
        `focused = ${focused === control ? control.id : (focused?.id || focused?.localName || '(none)')}`,
        `willValidate = ${control.willValidate ?? '(unavailable)'}`,
        `valid = ${valid ?? '(unavailable)'}`,
        ...(control.validationMessage ? [`validationMessage = ${control.validationMessage}`] : []),
        ...properties,
    ].join('\n')
}

function snapshot(): void {
    const entry = Controls.get(Selector.value)
    if (entry) {
        State.textContent = readState(entry.control)
        for (const [name, editor] of Editors) {
            if (document.activeElement === editor) continue
            const target = name === 'for' ? labelFor(entry.example) : entry.control
            const value = target?.getAttribute(name) ?? ''
            if (editor instanceof HTMLInputElement && editor.type === 'checkbox') {
                editor.checked = target?.hasAttribute(name) ?? false
            } else {
                editor.value = value
            }
        }
    }
    for (const form of Forms) element(`${form.id}-data`).textContent = formatData(dataEntries(form))
}

function addLog(event: string, target: string, detail?: string): void {
    const item = document.createElement('li')
    const title = document.createElement('strong')
    title.textContent = `${event} · ${target}`
    item.append(title)
    if (detail !== undefined) {
        const lines = document.createElement('pre')
        lines.textContent = detail
        item.append(lines)
    }
    Events.prepend(item)
    if (Events.childElementCount > 50) Events.lastElementChild?.remove()
}

async function settle(): Promise<void> {
    // Yield past native reset reactions and wait for Lit to commit form values.
    await Promise.resolve()
    await Promise.all(Array.from(Controls.values(), ({ control }) => control.updateComplete))
    snapshot()
}

function renderInspector(): void {
    const entry = Controls.get(Selector.value)
    if (!entry) return
    const { example, control } = entry
    Editor.replaceChildren()
    Editors.clear()
    const names = ['name', 'form', 'disabled', ...ComponentAttributes[example.tag]]
    if (example.label) names.push('for')
    for (const name of names) {
        const field = document.createElement('div')
        field.className = 'qa-field'
        const label = document.createElement('label')
        label.textContent = name
        const options = name === 'type' ? (TypesByTag[example.tag] ?? ButtonTypes) : AttributeOptions[name]
        const input = options ? document.createElement('select') : document.createElement('input')
        input.id = `qa-attr-${name}`
        label.htmlFor = input.id
        if (input instanceof HTMLSelectElement && options) {
            input.add(new Option(name === 'form' ? 'No form attribute' : 'Attribute omitted', ''))
            for (const option of options) input.add(new Option(option, option))
        } else if (input instanceof HTMLInputElement && BooleanAttributes.has(name)) {
            input.type = 'checkbox'
        }
        input.addEventListener('change', () => {
            const target = name === 'for' ? labelFor(example) : control
            if (!target) throw new Error(`Missing editable target: ${example.key}`)
            if (input instanceof HTMLInputElement && input.type === 'checkbox') {
                target.toggleAttribute(name, input.checked)
            } else if (input.value || input instanceof HTMLInputElement) {
                target.setAttribute(name, input.value)
            } else {
                target.removeAttribute(name)
            }
            void settle()
        })
        Editors.set(name, input)
        field.append(label, input)
        Editor.append(field)
    }
    snapshot()
}

addButtonCases()
addStateCases()
addValueCases()
Selector.value = 'checkbox-initial'
Selector.addEventListener('change', renderInspector)
element('qa-restore').addEventListener('click', () => {
    const entry = Controls.get(Selector.value)
    if (!entry) return
    const replacement = createControl(entry.example)
    const label = labelFor(entry.example)
    if (label) {
        replacement.removeAttribute('aria-label')
        label.htmlFor = replacement.id
    }
    entry.control.replaceWith(replacement)
    entry.control = replacement
    renderInspector()
    void settle()
})
element('qa-clear').addEventListener('click', () => {
    Events.replaceChildren()
    Status.textContent = ''
})
element('qa-request-submit-b').addEventListener('click', () => FormB.requestSubmit())
element('qa-reset-b').addEventListener('click', () => FormB.reset())

for (const form of Forms) {
    form.addEventListener('submit', (event: SubmitEvent) => {
        event.preventDefault()
        const submitter = event.submitter
        const description = submitter ? `${submitter.localName}#${submitter.id}` : '(none)'
        addLog('submit', form.id, `submitter = ${description}\n${formatData(dataEntries(form, submitter))}`)
        Status.textContent = `Submitted ${form.id}`
        void settle()
    })
    form.addEventListener('reset', () => {
        void settle().then(() => {
            addLog('reset', form.id, formatData(dataEntries(form)))
            Status.textContent = `Reset ${form.id}`
        })
    })
}

for (const type of ['input', 'change', 'invalid']) {
    document.addEventListener(type, event => {
        const control = event.composedPath().find(target =>
            target instanceof HTMLElement && Controls.get(target.id.slice(3))?.control === target,
        ) as Control | undefined
        if (!control) return
        addLog(type, control.id, type === 'invalid' ? control.validationMessage : undefined)
        if (type === 'invalid') Status.textContent = `Validation failed for ${control.id}`
        void settle()
    }, { capture: true })
}

document.addEventListener('focusin', () => queueMicrotask(snapshot))
renderInspector()
void settle()
