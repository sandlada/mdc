/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
export const isContentMotionReduced = (target: Element): boolean =>
    target.ownerDocument.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false

/** Tracks and cancels one animation owned by its caller. */
export class ContentMotion {
    private current: Animation | null = null

    public get active(): boolean {
        return this.current !== null
    }

    public cancel(): void {
        const animation = this.current
        this.current = null
        animation?.cancel()
    }

    public play(target: HTMLElement, keyframes: Keyframe[], options: KeyframeAnimationOptions): Animation {
        this.cancel()
        const animation = target.animate(keyframes, options)
        this.current = animation
        const clear = () => {
            if (this.current === animation) this.current = null
        }
        void animation.finished.then(clear, (error: unknown) => {
            if (this.current !== animation) return
            clear()
            if ((error as DOMException | null)?.name !== 'AbortError') throw error
        })
        return animation
    }
}
