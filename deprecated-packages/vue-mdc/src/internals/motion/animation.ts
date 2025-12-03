/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @link https://github.com/material-components/material-web/blob/main/internal/motion/animation.ts
 */


export interface AnimationSignal {
    /**
     * Starts the abortable task. Any previous tasks started with this instance
     * will be aborted.
     *
     * @return An `AbortSignal` for the current task.
     */
    start(): AbortSignal
    /**
     * Complete the current task.
     */
    finish(): void
}

export function createAnimationSignal(): AnimationSignal {
    // The current animation's AbortController
    let animationAbortController: AbortController | null = null

    return {
        start() {
            // Tell the previous animation to cancel.
            animationAbortController?.abort()
            // Set up a new AbortController for the current animation.
            animationAbortController = new AbortController()
            // Provide the AbortSignal so that the caller can check aborted status
            // and add listeners.
            return animationAbortController.signal
        },
        finish() {
            animationAbortController = null
        },
    }
}
