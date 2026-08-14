/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-segmented-button-set` — the container that owns
 * selection across its `mdc-segmented-button` children.
 *
 * Segments are pure views: they report activation through the
 * `segmented-button-interaction` event and the set decides whether the
 * selection commits, mirroring the Material Web segmented-button-set
 * semantics and the Flutter `SegmentedButton` API shape. The set re-emits
 * committed changes as a composed `segmented-button-set-selection` event.
 */
import { html, isServer, LitElement, nothing, type TemplateResult } from 'lit'
import { property, queryAssignedElements } from 'lit/decorators.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import {
    SEGMENTED_BUTTON_INTERACTION_EVENT,
    SEGMENTED_BUTTON_SET_SELECTION_EVENT,
    type ISegmentedButtonSet,
    type ISegmentedButtonSetSelectionEventDetail,
} from '../segmented-button.interface'
import type { BaseSegmentedButton } from './base-segmented-button'
import { SegmentedButtonSetStyles } from './segmented-button-set.style'

/** Only `mdc-segmented-button` children take part in selection. */
const SEGMENT_SELECTOR = 'mdc-segmented-button'

export abstract class BaseSegmentedButtonSet extends composeMixin(
    mixinDelegatesAria
)(LitElement) implements ISegmentedButtonSet {

    static override styles = SegmentedButtonSetStyles

    /**
     * When `true` any number of segments may be selected (checkbox semantics);
     * otherwise exactly one segment is selected at a time (radio semantics,
     * where the selected segment cannot be deselected by clicking it).
     */
    @property({ type: Boolean, reflect: true })
    public multiselect = false

    @queryAssignedElements({ selector: SEGMENT_SELECTOR, flatten: true })
    private readonly assignedButtons!: BaseSegmentedButton[]

    private buttons: BaseSegmentedButton[] = []

    public getButtonDisabled(index: number): boolean {
        if (this.indexOutOfBounds(index)) return false
        return this.buttons[index].disabled
    }

    public setButtonDisabled(index: number, disabled: boolean): void {
        if (this.indexOutOfBounds(index)) return
        this.buttons[index].disabled = disabled
    }

    public getButtonSelected(index: number): boolean {
        if (this.indexOutOfBounds(index)) return false
        return this.buttons[index].selected
    }

    public setButtonSelected(index: number, selected: boolean): void {
        if (this.indexOutOfBounds(index)) return
        if (this.getButtonDisabled(index)) return

        const button = this.buttons[index]

        if (this.multiselect) {
            if (button.selected === selected) return
            button.selected = selected
            this.emitSelectionEvent(index)
            return
        }

        // Single-select segments cannot be deselected by clicking them.
        if (!selected || button.selected) return

        button.selected = true
        for (let i = 0; i < this.buttons.length; i++) {
            if (i !== index) {
                this.buttons[i].selected = false
            }
        }
        this.emitSelectionEvent(index)
    }

    public toggleSelection(index: number): void {
        if (this.indexOutOfBounds(index)) return
        this.setButtonSelected(index, !this.buttons[index].selected)
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        return html`
            <span
                class="container"
                role="group"
                aria-label=${ariaLabel || nothing}
                @segmented-button-interaction=${this.handleSegmentedButtonInteraction}
            >
                <slot @slotchange=${this.handleSlotChange}></slot>
            </span>
        `
    }

    private readonly handleSegmentedButtonInteraction = (event: Event): void => {
        const index = this.buttons.indexOf(event.target as BaseSegmentedButton)
        this.toggleSelection(index)
    }

    private readonly handleSlotChange = (): void => {
        this.buttons = this.assignedButtons
        // Normalize the initial state: single-select keeps at most one segment.
        if (!this.multiselect) {
            let foundSelected = false
            for (const button of this.buttons) {
                if (button.selected) {
                    if (foundSelected) {
                        button.selected = false
                    } else {
                        foundSelected = true
                    }
                }
            }
        }
    }

    private emitSelectionEvent(index: number): void {
        const button = this.buttons[index]
        this.dispatchEvent(new CustomEvent<ISegmentedButtonSetSelectionEventDetail>(
            SEGMENTED_BUTTON_SET_SELECTION_EVENT,
            {
                detail: { button, selected: button.selected, index },
                bubbles: true,
                composed: true,
            },
        ))
    }

    private indexOutOfBounds(index: number): boolean {
        return index < 0 || index >= this.buttons.length
    }
}
