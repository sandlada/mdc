/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Duration, Easing } from '@sandlada/mdk'
import { html, isServer, LitElement } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { mixinElementInternals } from '../../../utils/behaviors/element-internals'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { dispatchActivationClick, isActivationClick } from '../../../utils/event/form-label-activation'
import { mixinElevationOptions } from '../../elevation/mixin-elevation-options'
import { mixinFocusRingOptions } from '../../focus-ring/mixin-focus-ring-options'
import { mixinRippleOptions } from '../../ripple/mixin-ripple-options'

/**
 * Fab components provide an icon.
 *
 * @see
 * The fab component is the simplest button. Do not use the fab component in the form.
 *
 * Available in 6 variants:
 * - variant="primary"
 * - variant="secondary"
 * - variant="tertiary"
 * - variant="tonal-primary"
 * - variant="tonal-secondary" (default)
 * - variant="tonal-tertiary"
 *
 * The fab component is available in 3 sizes:
 * - size="small" (default)
 * - size="medium"
 * - size="large"
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/floating-action-button/overview
 */
export abstract class BaseFab extends composeMixin(
    mixinDelegatesAria,
    mixinElementInternals,
    mixinRippleOptions,
    mixinElevationOptions,
    mixinFocusRingOptions
)(LitElement) {

    @query('button')
    protected buttonElement!: HTMLElement | null

    public override get focusRingControl() { return this.buttonElement }

    protected isOpen = false
    private generation = 0

    @property({ type: Boolean, noAccessor: true, attribute: 'open' })
    public get open(): boolean {
        return this.isOpen
    }
    public set open(value: boolean) {
        if (value === this.isOpen) {
            return
        }
        this.isOpen = value
        if (value) {
            this.show?.()
        } else {
            this.close?.()
        }
    }

    @property({ type: String, reflect: true })
    public variant: 'primary' | 'secondary' | 'tertiary' | 'tonal-primary' | 'tonal-secondary' | 'tonal-tertiary' = 'tonal-secondary'

    @property({ type: String })
    public size: 'small' | 'medium' | 'large' = 'small'

    @state()
    private hasIcon: boolean = false

    protected animationAbort: AbortController | null = null

    protected getRenderClasses() {
        return ({
            [this.variant]: true,
            [this.size]: true,
            'has-icon': this.hasIcon,
        })
    }

    constructor() {
        super()
        if (isServer) {
            return
        }
        this.addEventListener('click', this.handleClick.bind(this))
    }

    protected override render(): unknown {
        return html`
            <button class="${classMap(this.getRenderClasses())}">
                ${this.renderRipple()}
                ${this.renderFocusRing()}
                ${this.renderElevation()}

                ${this.renderIcon()}
            </button>
        `
    }

    protected renderIcon() {
        const { ariaLabel } = this as AriaMixinStrict
        return html`
            <span class="icon" aria-hidden=${ariaLabel ? 'false' : 'true'}>
                <slot name="icon" @slotchange=${this.handleIconSlotChange}></slot>
            </span>
        `
    }

    private handleClick(e: Event) {
        if (!isActivationClick(e) || !this.buttonElement) {
            return
        }
        dispatchActivationClick(this.buttonElement)
    }

    private handleIconSlotChange(e: Event) {
        this.hasIcon = (e.target as HTMLSlotElement).assignedElements().length > 0
    }

    private async animateButton(keyframes: Keyframe[], options: number | KeyframeAnimationOptions) {
        this.animationAbort?.abort()
        this.animationAbort = new AbortController()

        if (!this.buttonElement) return

        const animation = this.buttonElement.animate(keyframes, options)
        this.animationAbort.signal.addEventListener('abort', () => {
            if (animation.playState !== 'finished') {
                animation.finish()
            }
        })
        await animation.finished.catch(() => { })
    }

    public async show() {
        const gen = ++this.generation
        await this.isConnectedPromise
        await this.updateComplete

        if (gen !== this.generation) return

        const preventOpen = !this.dispatchEvent(new Event('open', { cancelable: true }))
        if (preventOpen) {
            this.isOpen = false
            return
        }

        // Pre-initialize button state to prevent first-load background flash
        if (this.buttonElement) {
            this.buttonElement.style.setProperty('scale', '0')
            this.buttonElement.style.setProperty('opacity', '0')
        }
        this.setAttribute('show', '')

        await this.animateButton(
            [{ scale: '0', opacity: '0' }, { scale: '1', opacity: '1' }],
            {
                duration: Duration.ExpressiveFastSpatial.Value,
                easing: Easing.ExpressiveFastSpatial.ToCSSValue(),
            },
        )

        if (gen !== this.generation) return

        // Remove pre-initialization inline styles
        if (this.buttonElement) {
            this.buttonElement.style.removeProperty('scale')
            this.buttonElement.style.removeProperty('opacity')
        }
        this.isOpen = true
        this.dispatchEvent(new Event('opened'))
    }

    public async close() {
        const gen = ++this.generation

        if (!this.isConnected) {
            this.isOpen = false
            return
        }

        await this.updateComplete

        if (gen !== this.generation) return

        const preventClose = !this.dispatchEvent(new Event('close', { cancelable: true }))
        if (preventClose) {
            this.isOpen = true
            return
        }

        // Clear any pre-initialization inline styles left by show()
        if (this.buttonElement) {
            this.buttonElement.style.removeProperty('scale')
            this.buttonElement.style.removeProperty('opacity')
        }

        await this.animateButton(
            [{ scale: '1', opacity: '1' }, { scale: '0', opacity: '0' }],
            {
                duration: Duration.ExpressiveFastEffects.Value,
                easing: Easing.ExpressiveFastSpatial.ToCSSValue(),
            },
        )

        if (gen !== this.generation) return

        this.isOpen = false
        this.removeAttribute('show')
        await this.updateComplete
        this.dispatchEvent(new Event('closed'))
    }

    private isConnectedPromiseResolve!: () => void
    private isConnectedPromise = this.getIsConnectedPromise()
    private getIsConnectedPromise() {
        return new Promise<void>((resolve) => {
            this.isConnectedPromiseResolve = resolve
        })
    }

    public override connectedCallback() {
        super.connectedCallback()
        this.isConnectedPromiseResolve()
    }

    public override disconnectedCallback() {
        super.disconnectedCallback()
        ++this.generation  // Invalidate any in-flight show/close operations
        this.isConnectedPromise = this.getIsConnectedPromise()
    }

}
