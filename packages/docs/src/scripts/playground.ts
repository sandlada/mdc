/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { renderDemo } from './demo-viewer'

const Source = document.getElementById('playground-source')
const Stage = document.getElementById('playground-stage')

if (Source instanceof HTMLTextAreaElement && Stage instanceof HTMLElement) {
    let timer: number | undefined
    const update = (): void => {
        renderDemo(Stage, Source.value)
    }
    Source.addEventListener('input', () => {
        window.clearTimeout(timer)
        timer = window.setTimeout(update, 250)
    })
    update()
}
