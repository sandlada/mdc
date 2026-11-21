/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
export class EdgeSlideMotion {
    private animations: Animation[] = []

    public stop(): void {
        for (const animation of this.animations) animation.cancel()
        this.animations = []
    }

    public async play(
        host: HTMLElement,
        inner: HTMLElement | null,
        hostFrames: Keyframe[],
        innerFrames: Keyframe[],
        options: KeyframeAnimationOptions,
    ): Promise<void> {
        if (!inner) return
        const animations: Animation[] = []
        this.animations = animations
        try {
            animations.push(host.animate(hostFrames, options))
            animations.push(inner.animate(innerFrames, options))
            await Promise.all(animations.map(async (animation) => {
                try {
                    await animation.finished
                } catch (error) {
                    if ((error as DOMException | null)?.name !== 'AbortError') throw error
                }
            }))
        } catch (error) {
            if (this.animations === animations) this.stop()
            throw error
        }
    }
}
