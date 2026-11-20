// @vitest-environment happy-dom
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, it, expect, afterEach } from 'vitest'
import { Shape } from '@sandlada/mdk'
import { MDCTooltip } from './tooltip'
import { PlainTooltipDefinition, RichTooltipDefinition } from './tooltip.definition'

describe('MDCTooltip', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('instantiates with defaults', () => {
        const tooltip = new MDCTooltip()
        expect(tooltip.position).toBe('top')
        expect(tooltip.open).toBe(false)
        expect(tooltip.rich).toBe(false)
        expect(tooltip.plain).toBe(false)
        expect(tooltip.caret).toBe(false)
        expect(tooltip.hasContent).toBe(false)
        expect(tooltip.hasActions).toBe(false)
    })

    it('allows updating properties', () => {
        const tooltip = new MDCTooltip()
        tooltip.position = 'bottom'
        tooltip.open = true
        tooltip.rich = true
        tooltip.plain = true
        tooltip.caret = true
        expect(tooltip.position).toBe('bottom')
        expect(tooltip.open).toBe(true)
        expect(tooltip.rich).toBe(true)
        expect(tooltip.plain).toBe(true)
        expect(tooltip.caret).toBe(true)
    })

    it('uses Material 3 ExtraSmall shape and 24x40 min-size tokens for plain tooltips', () => {
        expect(PlainTooltipDefinition['container-shape-start-start']).toBe(Shape.ExtraSmall)
        expect(PlainTooltipDefinition['container-min-height']).toBe('24px')
        expect(PlainTooltipDefinition['container-min-width']).toBe('40px')
        expect(PlainTooltipDefinition['container-max-width']).toBe('200px')
        expect(PlainTooltipDefinition['label-leading']).toBeDefined()
    })

    it('uses Material 3 RichTooltip tokens with leading suffix and OnSurfaceVariant colors', () => {
        expect(RichTooltipDefinition['container-shape-start-start']).toBe(Shape.Medium)
        expect(RichTooltipDefinition['container-max-width']).toBe('320px')
        expect(RichTooltipDefinition['container-padding-block-start']).toBe('12px')
        expect(RichTooltipDefinition['headline-padding-block-end']).toBe('4px')
        expect(RichTooltipDefinition['label-leading']).toBeDefined()
        expect(RichTooltipDefinition['headline-leading']).toBeDefined()
    })

    it('detects text-only content slot and auto-detects plain vs rich mode', async () => {
        const plain = document.createElement('mdc-tooltip') as MDCTooltip
        plain.textContent = 'Delete item'
        document.body.appendChild(plain)
        await plain.updateComplete
        expect(plain.plain).toBe(true)
        expect(plain.rich).toBe(false)
        expect(plain.hasContent).toBe(true)

        const rich = document.createElement('mdc-tooltip') as MDCTooltip
        rich.innerHTML = `<span slot="headline">Title</span><span>Body</span><button slot="actions">OK</button>`
        document.body.appendChild(rich)
        await rich.updateComplete
        expect(rich.rich).toBe(true)
        expect(rich.plain).toBe(false)
        expect(rich.hasActions).toBe(true)
    })

    it('renders caret svg when caret is true', async () => {
        const tooltip = document.createElement('mdc-tooltip') as MDCTooltip
        tooltip.caret = true
        tooltip.textContent = 'Caret tip'
        document.body.appendChild(tooltip)
        await tooltip.updateComplete
        expect(tooltip.shadowRoot?.querySelector('svg.caret')).not.toBeNull()
    })

    it('toggles hiding class on host when closing', async () => {
        const tooltip = document.createElement('mdc-tooltip') as MDCTooltip
        tooltip.textContent = 'Tip'
        document.body.appendChild(tooltip)
        await tooltip.show()
        await tooltip.updateComplete
        expect(tooltip.open).toBe(true)

        await tooltip.hide()
        await tooltip.updateComplete
        expect(tooltip.open).toBe(false)
        expect(tooltip.classList.contains('hiding')).toBe(true)
    })
})
