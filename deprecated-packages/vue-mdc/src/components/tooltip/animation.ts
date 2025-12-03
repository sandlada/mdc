/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { AnimationSignal } from '../../internals/motion/animation'
import { MaterialDesignSystem } from '../../utils'

export async function animateOpen(tooltipEl: HTMLElement, animationSignal: AnimationSignal) {
    const signal = animationSignal.start()

    const tooltipElementAnimation = tooltipEl.animate(
        [{ transform: 'scale(0.8)', opacity: '0' }, { transform: 'scale(1)', opacity: '1' }],
        {
            duration: 200,
            easing: MaterialDesignSystem.Motion.Easing.Emphasized,
        }
    )

    let resolveAnimation = (value: boolean) => { }
    const animationFinished = new Promise<boolean>((resolve) => {
        resolveAnimation = resolve
    })

    signal.addEventListener('abort', () => {
        tooltipElementAnimation.cancel()
        resolveAnimation(true)
    })

    tooltipElementAnimation.addEventListener('finish', () => {
        animationSignal.finish()
        resolveAnimation(false)
    })

    return await animationFinished
}

export function animateClose(tooltipEl: HTMLElement, animationSignal: AnimationSignal) {
    let resolve!: (value: boolean) => void

    // This promise blocks the surface position controller from setting
    // display: none on the surface which will interfere with this animation.
    const animationEnded = new Promise<boolean>((res) => {
        resolve = res
    })

    if (!tooltipEl) {
        resolve(false)
        return animationEnded
    }

    // const openDirection = this.openDirection
    // const closingDownwards = openDirection === 'UP'
    // this.dispatchEvent(new Event('closing'))
    // needs to be imperative because we don't want to mix animation and Lit
    // render timing
    // surfaceEl.classList.toggle('animating', true)

    const signal = animationSignal.start()

    const tooltipElementAnimation = tooltipEl.animate(
        [{ transform: 'scale(1)', opacity: '1' }, { transform: 'scale(0.8)', opacity: '0' }],

        {
            duration: 100,
            delay: 200
        },
    )

    signal.addEventListener('abort', () => {
        tooltipElementAnimation.cancel()
        resolve(false)
    })

    tooltipElementAnimation.addEventListener('finish', () => {
        animationSignal.finish()
        tooltipEl.dispatchEvent(new Event('closed'))
        resolve(true)
    })

    return animationEnded
}
