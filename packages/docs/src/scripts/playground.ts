/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { renderDemo } from './demo-viewer'

const initPlayground = (): void => {
    const Source = document.getElementById('playground-source')
    const Stage = document.getElementById('playground-stage')

    if (!(Source instanceof HTMLTextAreaElement) || !(Stage instanceof HTMLElement)) {
        return
    }
    if (Source.dataset.bound === 'true') {
        return
    }
    Source.dataset.bound = 'true'

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

document.addEventListener('astro:page-load', initPlayground)
