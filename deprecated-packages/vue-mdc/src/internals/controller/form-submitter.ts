/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @link
 * https://github.com/material-components/material-web/blob/main/internal/controller/form-submitter.ts
 *
 * [Modified by Sandlada & Kai Orion]
 *
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { isServer } from '../../utils/is-server'

export const FormSubmitterType = {
    Button: 'button',
    Submit: 'submit',
    Reset: 'reset',
} as const
export type TFormSubmitterType = typeof FormSubmitterType[keyof typeof FormSubmitterType]

export interface FormSubmitterElement extends HTMLButtonElement {
    /**
     * A string indicating the form submission behavior of the element.
     * Must be implemented by the custom element class.
     */
    type: TFormSubmitterType

    /**
     * The HTML name to use in form submission. When combined with a `value`, the
     * submitting button's name/value will be added to the form data.
     * Must be implemented by the custom element class, typically reflecting the 'name' attribute.
     */
    name: string

    /**
     * The value of the element. When combined with a `name`, the submitting
     * element's name/value will be added to the form data.
     * Must be implemented by the custom element class, typically reflecting the 'value' attribute.
     */
    value: string
}

// Store the click handler associated with each element instance
// to allow for proper removal in disconnectedCallback.
const clickHandlers = new WeakMap<FormSubmitterElement, EventListener>()

export function setupFormSubmitter(elementInstance: FormSubmitterElement): void {
    if (isServer()) {
        return
    }

    // Ensure we don't add multiple listeners if connected/disconnected rapidly
    if (clickHandlers.has(elementInstance)) {
        return
    }

    const handleClick = async (event: MouseEvent) => {
        const { type, form } = elementInstance

        // Do nothing if there's no form or the type is 'button'
        if (!form || type === 'button') {
            return
        }

        // Check if the element itself is disabled (e.g., via setFormValue(null))
        // or has a disabled attribute. Click events might still fire on the host
        // even if internal parts look disabled.
        // ToDo: Refine disabled check if needed based on element's specific implementation.
        if (elementInstance.hasAttribute('disabled')) {
            return
        }

        // Wait a task for event bubbling and potential event.preventDefault() calls
        await new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve())
        })

        // If the click was cancelled by another listener, do nothing.
        if (event.defaultPrevented) {
            return
        }

        // Handle form reset
        if (type === 'reset') {
            form.reset()
            return
        }

        // Handle form submission (type === 'submit')

        // Workaround: form.requestSubmit(elementInstance) does not correctly
        // set the `submitter` property on the SubmitEvent for form-associated
        // custom elements in some implementations/situations.
        // We manually patch the event dispatched by requestSubmit().
        // See https://github.com/WICG/webcomponents/issues/814
        const patchSubmitEvent = (submitEvent: SubmitEvent) => {
            Object.defineProperty(submitEvent, 'submitter', {
                configurable: true,
                enumerable: true,
                get: () => elementInstance,
            })
        }

        form.addEventListener('submit', patchSubmitEvent, { capture: true, once: true })

        try {
            if (elementInstance.name) {
            } else {
            }

        } catch (error) {
            console.error('Error during form submission request:', error)
            // Clean up the submit listener if submission fails before it fires
            form.removeEventListener('submit', patchSubmitEvent, { capture: true })
        }

        form.requestSubmit(elementInstance)
    }


    elementInstance.addEventListener('click', handleClick)
    // @ts-ignore
    clickHandlers.set(elementInstance, handleClick)
}

export function cleanupFormSubmitter(elementInstance: FormSubmitterElement): void {
    const handler = clickHandlers.get(elementInstance)
    if (handler) {
        elementInstance.removeEventListener('click', handler)
        clickHandlers.delete(elementInstance)
    }
}
