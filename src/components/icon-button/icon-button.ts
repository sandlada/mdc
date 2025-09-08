/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement, property } from 'lit/decorators.js'
import { internals } from '../../utils/behaviors/element-internals'
import { setupFormSubmitter, type FormSubmitter, type FormSubmitterType } from '../../utils/controller/form-submitter'
import { BaseMDCIconButton } from './base-icon-button'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-icon-button": MDCIconButton
    }
}

/**
 * @alias
 * mdc-icon-button
 * 
 * @slot default
 * 
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/icon-buttons/specs
 */
@customElement('mdc-icon-button')
export class MDCIconButton extends BaseMDCIconButton implements FormSubmitter {
    
    static override shadowRootOptions: ShadowRootInit = {
        mode: 'open',
        delegatesFocus: true,
    }

    static readonly formAssociated = true
    static {
        setupFormSubmitter(MDCIconButton)
    }

    public get name() {
        return this.getAttribute('name') ?? '';
    }
    public set name(name: string) {
        this.setAttribute('name', name);
    }

    public get form() {
        return this[internals].form
    }

    @property({ type: String })
    public type: FormSubmitterType = 'submit'

    @property({ type: String, reflect: true})
    public value: string = ''

    @property({ type: Boolean, reflect: true })
    public disabled = false

}
