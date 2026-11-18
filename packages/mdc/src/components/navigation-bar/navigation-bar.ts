/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Navigation bar container with scope propagation, variant styles, and
 * show/hide/scroll-driven collapse behavior.
 *
 * @example
 * ```html
 * <mdc-navigation-bar
 *   navigation-scope="main-nav"
 *   variant="horizontal"
 * >
 *   <mdc-navigation-tab name="bar-tabs" value="/home">Home</mdc-navigation-tab>
 *   <mdc-navigation-tab name="bar-tabs" value="/search">Search</mdc-navigation-tab>
 * </mdc-navigation-bar>
 * ```
 */
import { customElement, property } from 'lit/decorators.js'
import { BaseNavigationBar } from './internal/base-navigation-bar'
import { html, nothing, type CSSResultGroup, type PropertyValues, type TemplateResult } from 'lit'
import {
    type INavigationBar,
    type INavigationBarVisibilityChangeDetail,
    NavigationBarScrollBehavior,
    NavigationBarVariant,
    NavigationBarVisibilityChangeEvent,
} from './navigation-bar.interface'
import { NavigationBarStyles } from './navigation-bar.style'
import { classMap } from 'lit/directives/class-map.js'
import { NavigationTabVariant } from '../navigation-tab/navigation-tab.interface'

const BarTabVariants = {
    Horizontal: NavigationTabVariant.BarHorizontal,
    Vertical  : NavigationTabVariant.BarVertical,
    VerticalXR: NavigationTabVariant.BarXRVertical,
} as const satisfies Record<keyof typeof NavigationBarVariant, NavigationTabVariant>

/**
 * Maps a navigation-bar `variant` value to its {@link BarTabVariants} entry.
 */
const BarTabVariantByValue = {
    [NavigationBarVariant.Horizontal]: BarTabVariants.Horizontal,
    [NavigationBarVariant.Vertical]  : BarTabVariants.Vertical,
    [NavigationBarVariant.VerticalXR]: BarTabVariants.VerticalXR,
} as const satisfies Record<NavigationBarVariant, NavigationTabVariant>

declare global {
    interface HTMLElementTagNameMap {
        'mdc-navigation-bar': MDCNavigationBar
    }
}

/**
 * @version "Material Design 3"
 *
 * @fires navigation-bar-visibility-change - Fired when `collapsed` changes.
 *
 * @link
 * https://m3.material.io/components/navigation-bar/overview
 */
@customElement('mdc-navigation-bar')
export class MDCNavigationBar extends BaseNavigationBar implements INavigationBar {

    static override styles?: CSSResultGroup | undefined = NavigationBarStyles

    @property({ type: String, reflect: true, attribute: 'variant' })
    public variant: NavigationBarVariant = NavigationBarVariant.Horizontal

    @property({ type: String, reflect: true, attribute: 'scroll-behavior' })
    public scrollBehavior: NavigationBarScrollBehavior = NavigationBarScrollBehavior.Pinned

    @property({ type: Boolean, reflect: true })
    public collapsed: boolean = false

    @property({ attribute: 'scroll-target' })
    public scrollTarget: HTMLElement | Window | string | null = null

    private currentScrollElement: HTMLElement | Window | null = null
    private boundScrollHandler: (() => void) | null = null
    private lastScrollTop: number = 0

    public override connectedCallback(): void {
        super.connectedCallback()
        if (typeof document !== 'undefined') {
            this.setupScrollTarget()
        }
    }

    public override disconnectedCallback(): void {
        this.cleanupScrollTarget()
        super.disconnectedCallback()
    }

    public show(): void {
        this.collapsed = false
    }

    public hide(): void {
        this.collapsed = true
    }

    public toggle(): void {
        this.collapsed = !this.collapsed
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        if (!Object.hasOwn(BarTabVariantByValue, this.variant)) {
            throw new Error(`[mdc-navigation-bar] Unsupported variant "${String(this.variant)}". Navigation bars support only "horizontal" | "vertical" | "vertical-xr".`)
        }
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (typeof document !== 'undefined' && (changedProperties.has('scrollTarget') || changedProperties.has('scrollBehavior'))) {
            this.cleanupScrollTarget()
            this.setupScrollTarget()
        }
        if (changedProperties.has('collapsed')) {
            this.dispatchEvent(new CustomEvent<INavigationBarVisibilityChangeDetail>(NavigationBarVisibilityChangeEvent, {
                bubbles : true,
                composed: true,
                detail  : { collapsed: this.collapsed },
            }))
        }
    }

    protected override resolveTabVariant(): NavigationTabVariant {
        const variant: NavigationTabVariant | undefined = Object.hasOwn(BarTabVariantByValue, this.variant)
            ? BarTabVariantByValue[this.variant]
            : undefined
        if (variant === undefined) {
            throw new Error(`[mdc-navigation-bar] Unsupported variant "${String(this.variant)}". Navigation bars support only "horizontal" | "vertical" | "vertical-xr".`)
        }
        return variant
    }

    protected override shouldSyncTabVariants(changedProperties: PropertyValues<this>): boolean {
        return changedProperties.has('variant')
    }

    protected override render(): TemplateResult {
        return html`
            <div
                role="navigation"
                aria-label=${this.getAttribute('aria-label') || nothing}
                class=${classMap(this.getRenderClasses())}
            >
                ${this.renderSlot()}
                ${this.renderBackground()}
            </div>
        `
    }

    private getRenderClasses() {
        return ({
            'container'    : true,
            [this.variant] : true,
            'is-hidden'    : this.collapsed,
        })
    }

    protected renderBackground(): TemplateResult {
        return html`
            <div aria-hidden="true" class="background"></div>
        `
    }

    private setupScrollTarget(): void {
        if (this.scrollBehavior !== NavigationBarScrollBehavior.ExitAlways) return

        let target: HTMLElement | Window | null = null
        if (typeof this.scrollTarget === 'string') {
            if (this.scrollTarget === 'window') {
                target = typeof window !== 'undefined' ? window : null
            } else if (this.scrollTarget.length > 0) {
                const root = typeof this.getRootNode === 'function'
                    ? (this.getRootNode() as Document | ShadowRoot)
                    : null
                target = root?.querySelector?.(this.scrollTarget) ??
                    (typeof document !== 'undefined' ? document.querySelector(this.scrollTarget) : null)
            }
        } else if (
            (typeof HTMLElement !== 'undefined' && this.scrollTarget instanceof HTMLElement) ||
            (typeof window !== 'undefined' && this.scrollTarget === window) ||
            (this.scrollTarget !== null && typeof this.scrollTarget === 'object' && 'addEventListener' in this.scrollTarget)
        ) {
            target = this.scrollTarget as HTMLElement | Window
        }

        if (!target) return

        this.currentScrollElement = target
        this.lastScrollTop = this.readScrollTop(target)

        this.boundScrollHandler = () => {
            const scrollTop = this.readScrollTop(target)
            const delta = scrollTop - this.lastScrollTop
            if (scrollTop <= 0) {
                this.collapsed = false
            } else if (delta > 4) {
                this.collapsed = true
            } else if (delta < -4) {
                this.collapsed = false
            }
            this.lastScrollTop = scrollTop
        }

        target.addEventListener('scroll', this.boundScrollHandler, { passive: true })
    }

    private cleanupScrollTarget(): void {
        if (this.currentScrollElement && this.boundScrollHandler) {
            this.currentScrollElement.removeEventListener('scroll', this.boundScrollHandler)
        }
        this.currentScrollElement = null
        this.boundScrollHandler = null
    }

    private readScrollTop(target: HTMLElement | Window): number {
        if (typeof window !== 'undefined' && target === window) {
            return window.scrollY || document.documentElement.scrollTop || 0
        }
        if ('scrollTop' in target) {
            return (target as HTMLElement).scrollTop || 0
        }
        return 0
    }

}
