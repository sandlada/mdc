/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Duration, Easing } from '@sandlada/mdk'
import { html, isServer, LitElement } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
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

    protected isOpen = false
    protected isOpening = false
    protected currentAnimationPromise: Promise<void> | null = null

    @property({ type: Boolean, noAccessor: true })
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
        return html`
            <span class="icon">
                <slot name="icon" .aria-hidden=${this.ariaLabel} @slotchange=${this.handleIconSlotChange}></slot>
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
            animation.finish()
        })
        await animation.finished.catch(() => { })
    }

    public async show() {
        this.isOpening = true
        await this.isConnectedPromise
        await this.updateComplete

        if (!this.buttonElement || !this.isOpening) {
            this.isOpening = false
            return
        }

        const preventOpen = !this.dispatchEvent(
            new Event('open', { cancelable: true }),
        )
        if (preventOpen) {
            this.open = false
            this.isOpening = false
            return
        }

        this.setAttribute('show', '')
        this.open = true
        await this.animateButton(
            [
                { 'scale': '0', 'opacity': '0' },
                { 'scale': '1', 'opacity': '1' },
            ],
            {
                duration: Duration.Number.ExpressiveFastSpatial,
                easing: Easing.ExpressiveFastSpatial
            },
        )
        this.dispatchEvent(new Event('opened'))
        this.isOpening = false
    }

    public async close() {
        this.isOpening = false
        if (!this.isConnected) {
            this.open = false
            return
        }

        await this.updateComplete
        if (!this.buttonElement || this.isOpening) {
            this.open = false
            return
        }

        const preventClose = !this.dispatchEvent(
            new Event('close', { cancelable: true }),
        )
        if (preventClose) {
            return
        }

        await this.animateButton(
            [
                { 'scale': '1', 'opacity': '1' },
                { 'scale': '0', 'opacity': '0' },
            ],
            {
                duration: Duration.Number.ExpressiveFastEffects,
                easing: Easing.ExpressiveFastEffects
            }
        )

        this.open = false
        this.dispatchEvent(new Event('closed'))
        this.removeAttribute('show')
        await this.updateComplete

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
        this.isConnectedPromise = this.getIsConnectedPromise()
    }

}
