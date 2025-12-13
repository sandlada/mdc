/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { property, query } from 'lit/decorators.js'
import { SelectionController } from '../../controller/selection-controller'
import { internals } from '../element-internals'
import type { MixinBase, MixinReturn } from '../mixin'

export interface ICheckableAttributes {
    checked            : boolean
    value              : 'on' | string & ({})
    required           : boolean
    type               : 'radio' | 'checkbox'
    selectionController: SelectionController
    renderInput()      : TemplateResult
}

const SChecked = Symbol('checked')

export function mixinCheckable<T extends MixinBase<LitElement>>(base: T): MixinReturn<T, ICheckableAttributes> {
    abstract class WithCheckable extends base implements ICheckableAttributes {

        public declare abstract disabled: boolean
        public declare abstract [internals]: ElementInternals
        public abstract type: 'radio' | 'checkbox'

        private [SChecked]: boolean = false

        @property({ type: Boolean, reflect: true })
        public get checked(): boolean {
            return this[SChecked]
        }
        public set checked(value: boolean) {
            if(this[SChecked] === value) return
            const oldValue = this[SChecked]
            this[SChecked] = value
            this.requestUpdate('checked', oldValue)
        }

        @property({ type: String })
        public value: 'on' | (string & {}) = 'on'

        @property({ type: Boolean, reflect: true })
        public required: boolean = false


        public selectionController = new SelectionController(this, {
            onBeforeSelect: (host) => {
                if(this.disabled) return
                host.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            },
            onAfterSelected: (host) => {
                if(this.disabled) return
                host.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
            }
        })

        @query('.checkable-input')
        protected readonly inputElement!: HTMLInputElement | null

        public renderInput(): TemplateResult {
            return html`
                <input
                    class="checkable-input touch-target"
                    type="${this.type}"
                    .checked="${this.checked}"
                    ?disabled="${this.disabled}"
                    ?required="${this.required}"
                    tabindex="-1"
                />
            `
        }

        public override connectedCallback(): void {
            super.connectedCallback()
            this.updateSelectionControllerMode()
        }

        protected override willUpdate(changedProperties: PropertyValues<this>): void {
            super.willUpdate(changedProperties)

            if (changedProperties.has('type')) {
                this.updateSelectionControllerMode()
                this[internals].role = this.type
            }

            if (changedProperties.has('checked')) {
                this[internals].ariaChecked = String(this.checked)
            }
        }

        private updateSelectionControllerMode() {
            // Checkbox allows multiple selection in a group/controller context
            // Radio enforces single selection
            this.selectionController.multiple = (this.type === 'checkbox')
        }

    }

    return WithCheckable
}
