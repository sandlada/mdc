/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { MDCAccordion } from './accordion'
import {
    AccordionDefinition,
    ElevatedExpansionPanelDefinition,
    ExpansionPanelDefinition,
    FilledExpansionPanelDefinition,
    FlatExpansionPanelDefinition,
    OutlinedExpansionPanelDefinition,
} from './accordion.definition'
import {
    AccordionMode,
    AccordionShape,
    AccordionSize,
    AccordionVariant,
} from './accordion.interface'
import { MDCExpansionPanel } from './expansion-panel'

describe('MDCAccordion & MDCExpansionPanel unit tests', () => {
    it('initializes MDCAccordion with expected defaults', () => {
        const accordion = new MDCAccordion()
        expect(accordion.mode).toBe(AccordionMode.Multiple)
        expect(accordion.collapsible).toBe(true)
        expect(accordion.variant).toBe(AccordionVariant.Outlined)
        expect(accordion.size).toBe(AccordionSize.Medium)
        expect(accordion.shape).toBe(AccordionShape.Round)
        expect(accordion.connected).toBe(false)
        expect(accordion.quick).toBe(false)
        expect(accordion.panels).toEqual([])
        expect(accordion.expandedPanels).toEqual([])
    })

    it('initializes MDCExpansionPanel with expected defaults', () => {
        const panel = new MDCExpansionPanel()
        expect(panel.expanded).toBe(false)
        expect(panel.disabled).toBe(false)
        expect(panel.variant).toBe(AccordionVariant.Outlined)
        expect(panel.size).toBe(AccordionSize.Medium)
        expect(panel.shape).toBe(AccordionShape.Round)
        expect(panel.headline).toBe('')
        expect(panel.supportingText).toBe('')
        expect(panel.icon).toBe('')
        expect(panel.expandIcon).toBe('expand_more')
        expect(panel.hideIndicator).toBe(false)
        expect(panel.hideSummaryOnExpand).toBe(false)
        expect(panel.noDivider).toBe(false)
        expect(panel.headingLevel).toBe(0)
        expect(panel.quick).toBe(false)
        expect(panel.value).toBe('')
    })

    it('exports style definitions with valid token structures', () => {
        expect(AccordionDefinition).toBeDefined()
        expect(AccordionDefinition['panel-gap']).toBeDefined()

        expect(ExpansionPanelDefinition).toBe(OutlinedExpansionPanelDefinition)
        for (const def of [
            OutlinedExpansionPanelDefinition,
            ElevatedExpansionPanelDefinition,
            FilledExpansionPanelDefinition,
            FlatExpansionPanelDefinition,
        ]) {
            expect(def['enabled-container-color']).toBeDefined()
            expect(def['enabled-headline-color']).toBeDefined()
            expect(def['headline-leading']).toBeDefined()
            expect(def['body-leading']).toBeDefined()
            expect((def['header-min-height'] as Record<string, string>)['medium']).toBe('56px')
        }
    })
})
