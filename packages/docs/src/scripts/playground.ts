/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { renderDemo } from './demo-viewer'

const source = document.getElementById('playground-source')
const stage = document.getElementById('playground-stage')

if (source instanceof HTMLTextAreaElement && stage instanceof HTMLElement) {
    let timer: number | undefined
    const update = (): void => {
        renderDemo(stage, source.value)
    }
    source.addEventListener('input', () => {
        window.clearTimeout(timer)
        timer = window.setTimeout(update, 250)
    })
    update()
}
