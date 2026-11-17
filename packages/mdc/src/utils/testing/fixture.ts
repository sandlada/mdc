/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { render, type TemplateResult } from 'lit'

export interface LitElementLike extends HTMLElement {
    readonly updateComplete: Promise<boolean>
}

export async function fixture<T extends LitElementLike>(template: string | TemplateResult): Promise<T> {
    const container = document.createElement('div')
    document.body.appendChild(container)

    if (typeof template === 'string') {
        container.innerHTML = template
    } else {
        render(template, container)
    }

    const element = container.firstElementChild as T | null
    if (!element) {
        throw new Error('fixture() expected template to produce a root element.')
    }

    if ('updateComplete' in element) {
        await element.updateComplete
    }

    return element
}

export function oneEvent<T extends Event = Event>(target: EventTarget, eventName: string): Promise<T> {
    return new Promise((resolve) => {
        target.addEventListener(eventName, (event) => resolve(event as T), { once: true })
    })
}

export function nextFrame(): Promise<void> {
    return new Promise((resolve) => {
        requestAnimationFrame(() => resolve())
    })
}
