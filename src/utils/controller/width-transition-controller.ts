import type { ReactiveController, ReactiveControllerHost } from 'lit'

export class WidthTransitionController implements ReactiveController {

    private observer: MutationObserver | null = null

    private host: ReactiveControllerHost & Element
    private getTarget: () => HTMLElement | null

    private previousWidth: number = 0
    private isAnimating = false
    private initialized = false

    public constructor(
        host: ReactiveControllerHost & Element,
        getTarget: () => HTMLElement | null
    ) {
        this.host = host
        this.getTarget = getTarget
    }

    hostConnected() {
        this.observer = new MutationObserver(() => {
            this.animate()
        })

        this.observer.observe(this.host, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: false
        })
    }

    hostDisconnected() {
        this.observer?.disconnect()
    }

    hostUpdated() {
        if (!this.initialized) {
            const el = this.getTarget()
            if (el) {
                this.previousWidth = el.scrollWidth
                this.initialized = true
            }
        }
    }

    private animate() {
        const el = this.getTarget()
        if (!el || !this.initialized) return

        const targetWidth = el.scrollWidth
        const startWidth = this.previousWidth

        if (Math.abs(startWidth - targetWidth) < 1) {
            this.previousWidth = targetWidth
            return
        }

        if (this.isAnimating) {
            return
        }

        this.isAnimating = true

        el.style.opacity = '0'
        el.style.transition = 'none'
        el.style.width = `${startWidth}px`

        el.offsetHeight

        el.style.transition = 'width 0.3s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.3s'
        el.style.width = `${targetWidth}px`
        el.style.opacity = '1'

        const onEnd = () => {
            if (Math.abs(parseFloat(el.style.width) - targetWidth) < 1) {
                el.style.width = 'auto';
                el.style.transition = 'none';
            }

            this.isAnimating = false
            this.previousWidth = el.scrollWidth
        }

        el.addEventListener('transitionend', onEnd, { once: true })

        setTimeout(() => {
            if (this.isAnimating) {
                onEnd()
            }
        }, 400)
    }

}
