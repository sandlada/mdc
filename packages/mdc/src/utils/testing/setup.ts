/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { afterEach } from 'vitest'

if (typeof HTMLElement !== 'undefined' && !HTMLElement.prototype.attachInternals) {
    HTMLElement.prototype.attachInternals = function () {
        return {
            shadowRoot: this.shadowRoot,
            form: null,
            states: new Set(),
            validity: { valid: true } as ValidityState,
            validationMessage: '',
            willValidate: true,
            labels: [] as unknown as NodeListOf<HTMLLabelElement>,
            setFormValue: () => {},
            setValidity: () => {},
            checkValidity: () => true,
            reportValidity: () => true,
        } as unknown as ElementInternals
    }
}

afterEach(() => {
    if (typeof document !== 'undefined') {
        document.body.innerHTML = ''
    }
})
