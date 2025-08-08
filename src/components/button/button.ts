/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement, property } from 'lit/decorators.js'
import { internals } from '../../utils/behaviors/element-internals'
import { setupFormSubmitter, type FormSubmitter, type FormSubmitterType } from '../../utils/controller/form-submitter'
import { BaseButton } from './base-button'

/**
 * The normal Button class does not implement the function of the anchor element.
 * Because you only need to wrap the Button component with <a></a>.
 *
 * @see
 * Note:
 * Please set the tabindex of the a element that wraps the button component to -1.
 * ```html
 * <a tabindex="-1" href="#a">
 *      <mdc-button shape="square">
 *          <span>Link Button</span>
 *     </mdc-button>
 * </a>
 * ```
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/buttons/overview
 * https://www.figma.com/design/4GM7ohCF2Qtjzs7Fra6jlp/Material-3-Design-Kit--Community-?node-id=57994-2227&t=kLfic7eA8vKtkiiO-0
 */
@customElement('mdc-button')
export class MDCButton extends BaseButton implements FormSubmitter {

    static readonly formAssociated = true
    static {
        setupFormSubmitter(MDCButton)
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
    public disabled: boolean = false

}
