/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { mixinElevationOptions } from '../../elevation/elevation-options.mixin'
import {
    BottomAppBarScrollBehavior,
    BottomAppBarVisibilityChangeEvent,
    type IBottomAppBarVisibilityChangeDetail,
    type IMDCBottomAppBar,
} from '../bottom-appbar.interface'

/**
 * Base class for `mdc-bottom-appbar`.
 *
 * Implements Material Design 3 Bottom App Bar (`80dp` container, `SurfaceContainer`,
 * `Level2` elevation, up to 4 start-aligned icon actions, optional embedded `slot="fab"`,
 * and optional `exit-always` scroll behavior).
 */
export abstract class BaseBottomAppBar extends composeMixin(
    mixinElevationOptions,
)(LitElement) implements IMDCBottomAppBar {

    @property({ type: String, reflect: true, attribute: 'scroll-behavior' })
    public scrollBehavior: BottomAppBarScrollBehavior = BottomAppBarScrollBehavior.Pinned

    @property({ type: Boolean, reflect: true })
    public collapsed: boolean = false

    @property({ attribute: 'scroll-target' })
    public scrollTarget: HTMLElement | Window | string | null = null

    @property({ type: String })
    public label: string = 'Bottom app bar'

    @state()
    protected hasActions: boolean = false

    @state()
    protected hasFab: boolean = false

    private hasInitializedLightDomSlots: boolean = false
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

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        if (!this.hasInitializedLightDomSlots) {
            this.hasInitializedLightDomSlots = true
            this.refreshSlotPresenceFromLightDom()
        }
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (typeof document !== 'undefined' && (changedProperties.has('scrollTarget') || changedProperties.has('scrollBehavior'))) {
            this.cleanupScrollTarget()
            this.setupScrollTarget()
        }
        if (changedProperties.has('collapsed')) {
            this.dispatchEvent(new CustomEvent<IBottomAppBarVisibilityChangeDetail>(BottomAppBarVisibilityChangeEvent, {
                bubbles : true,
                composed: true,
                detail  : { collapsed: this.collapsed },
            }))
        }
    }

    public show(): void {
        this.collapsed = false
    }

    public hide(): void {
        this.collapsed = true
    }

    protected getRenderClasses(): Record<string, boolean> {
        return {
            'container'  : true,
            'has-actions': this.hasActions,
            'has-fab'    : this.hasFab,
            'is-hidden'  : this.collapsed,
        }
    }

    protected override render(): TemplateResult {
        return html`
            <div
                class="${classMap(this.getRenderClasses())}"
                role="toolbar"
                aria-label=${this.label || 'Bottom app bar'}
            >
                <mdc-elevation aria-hidden="true"></mdc-elevation>
                <div class="actions">
                    <slot @slotchange=${this.handleActionsSlotChange}></slot>
                </div>
                <div class="fab">
                    <slot name="fab" @slotchange=${this.handleFabSlotChange}></slot>
                </div>
            </div>
        `
    }

    protected handleActionsSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasActions = slot.assignedElements({ flatten: true }).length > 0
    }

    protected handleFabSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasFab = slot.assignedElements({ flatten: true }).length > 0
    }

    private refreshSlotPresenceFromLightDom(): void {
        const children = this.children
        if (!children) return
        let actions = false
        let fab = false
        for (let i = 0; i < children.length; i++) {
            const slotAttr = children[i].getAttribute?.('slot')
            if (slotAttr === 'fab') {
                fab = true
            } else if (!slotAttr) {
                actions = true
            }
        }
        this.hasActions = actions
        this.hasFab = fab
    }

    protected setupScrollTarget(): void {
        if (this.scrollBehavior !== BottomAppBarScrollBehavior.ExitAlways) return

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

    protected cleanupScrollTarget(): void {
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
