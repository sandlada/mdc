/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ContextConsumer } from '@lit/context'
import { html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { styleMap } from 'lit/directives/style-map.js'
import {
    SkeletonAnimation,
    SkeletonLoadedEvent,
    SkeletonSize,
    SkeletonVariant,
    type IMDCSkeleton,
    type IMDCSkeletonLoadedEventDetail,
} from '../skeleton.interface'
import { SkeletonStyles } from '../skeleton.style'
import { SkeletonContext, type ISkeletonGroupContext } from './skeleton-context'
import { computeSkeletonLines, normalizeCssDimension } from './skeleton-layout'

const hasMeaningfulChildNodes = (host: HTMLElement): boolean => {
    for (const node of Array.from(host.childNodes)) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            return true
        }
        if (node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim().length > 0) {
            return true
        }
    }
    return false
}

export abstract class BaseSkeleton extends LitElement implements IMDCSkeleton {

    public static override styles = SkeletonStyles

    private _loading: boolean = false
    private _animation: SkeletonAnimation = SkeletonAnimation.Shimmer
    private _size: SkeletonSize = SkeletonSize.Medium
    private _hasExplicitLoading: boolean = false
    private _hasExplicitAnimation: boolean = false
    private _hasExplicitSize: boolean = false
    private _wasLoading: boolean = false

    private readonly groupContextConsumer = new ContextConsumer(this, {
        context: SkeletonContext,
        subscribe: true,
    })

    @property({ type: String, reflect: true })
    public variant: SkeletonVariant = SkeletonVariant.Text

    @property({ type: Number, reflect: true })
    public lines: number = 1

    @property({ type: String, attribute: 'last-line-width', reflect: true })
    public lastLineWidth: string = ''

    @property({ type: String, reflect: true })
    public width: string = ''

    @property({ type: String, reflect: true })
    public height: string = ''

    @property({ type: String, attribute: 'aspect-ratio', reflect: true })
    public aspectRatio: string = ''

    @property({ type: String, reflect: true })
    public label: string = ''

    @state()
    private _hasSlottedContent: boolean = false

    @property({ type: Boolean, reflect: true })
    public get loading(): boolean {
        return this._loading
    }
    public set loading(value: boolean) {
        const oldValue = this._loading
        const nextValue = Boolean(value)
        this._hasExplicitLoading = true
        this._loading = nextValue
        this.requestUpdate('loading', oldValue)
    }

    @property({ type: String, reflect: true })
    public get animation(): SkeletonAnimation {
        return this._animation
    }
    public set animation(value: SkeletonAnimation) {
        const oldValue = this._animation
        this._hasExplicitAnimation = true
        this._animation = value
        this.requestUpdate('animation', oldValue)
    }

    @property({ type: String, reflect: true })
    public get size(): SkeletonSize {
        return this._size
    }
    public set size(value: SkeletonSize) {
        const oldValue = this._size
        this._hasExplicitSize = true
        this._size = value
        this.requestUpdate('size', oldValue)
    }

    public get hasSlottedContent(): boolean {
        return this._hasSlottedContent
    }

    public get isLoading(): boolean {
        if (this._hasExplicitLoading) {
            return this._loading
        }
        const group = this.groupContext
        if (group !== undefined) {
            return group.loading
        }
        return !this._hasSlottedContent
    }

    protected get groupContext(): ISkeletonGroupContext | undefined {
        return this.groupContextConsumer.value
    }

    protected get resolvedAnimation(): SkeletonAnimation {
        if (this._hasExplicitAnimation) {
            return this._animation
        }
        return this.groupContext?.animation ?? this._animation
    }

    protected get resolvedSize(): SkeletonSize {
        if (this._hasExplicitSize) {
            return this._size
        }
        return this.groupContext?.size ?? this._size
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        this.syncSlottedContent()
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        this.syncSlottedContent()
        this.syncHostClasses()
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        const currentLoading = this.isLoading
        if (this._wasLoading && !currentLoading) {
            this.dispatchEvent(
                new CustomEvent<IMDCSkeletonLoadedEventDetail>(SkeletonLoadedEvent, {
                    bubbles: true,
                    composed: true,
                    detail: { skeleton: this },
                })
            )
        }
        this._wasLoading = currentLoading
    }

    protected getHostClasses(): Record<string, boolean> {
        return {
            'has-content': this._hasSlottedContent,
            'standalone-idle': !this._hasSlottedContent && !this.isLoading,
        }
    }

    protected getRenderClasses(): Record<string, boolean> {
        return {
            root: true,
            loading: this.isLoading,
            'has-content': this._hasSlottedContent,
            [`variant-${this.variant}`]: true,
            [`animation-${this.resolvedAnimation}`]: true,
            [`size-${this.resolvedSize}`]: true,
        }
    }

    protected override render(): TemplateResult {
        const isLoading = this.isLoading
        const hasStatusLabel = !this.groupContext?.inGroup && this.label.trim().length > 0 && isLoading

        return html`
            <div
                id="root"
                class=${classMap(this.getRenderClasses())}
                role=${hasStatusLabel ? 'status' : nothing}
                aria-busy=${hasStatusLabel ? 'true' : nothing}
                aria-label=${hasStatusLabel ? this.label : nothing}
            >
                ${this._hasSlottedContent
                    ? this.renderWrapperMode(isLoading, hasStatusLabel)
                    : this.renderStandaloneMode(isLoading, hasStatusLabel)}
            </div>
        `
    }

    private renderWrapperMode(isLoading: boolean, hasStatusLabel: boolean): TemplateResult {
        const overlayStyles = this.buildDimensionStyleMap()
        return html`
            <div
                class="content"
                ?inert=${isLoading}
                aria-hidden=${isLoading ? 'true' : nothing}
            >
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
            <div
                class="shape overlay"
                style=${styleMap(overlayStyles)}
                ?hidden=${!isLoading}
                aria-hidden=${hasStatusLabel ? nothing : 'true'}
            ></div>
        `
    }

    private renderStandaloneMode(isLoading: boolean, hasStatusLabel: boolean): TemplateResult {
        if (!isLoading) {
            return html`
                <div class="slot-probe">
                    <slot @slotchange=${this.handleSlotChange}></slot>
                </div>
            `
        }

        const ariaHidden = hasStatusLabel ? nothing : 'true'
        const dimStyles = this.buildDimensionStyleMap()

        if (this.variant === SkeletonVariant.Text) {
            const lineSpecs = computeSkeletonLines(this.lastLineWidth)(this.lines)
            return html`
                <div class="slot-probe">
                    <slot @slotchange=${this.handleSlotChange}></slot>
                </div>
                <div class="lines" aria-hidden=${ariaHidden}>
                    ${lineSpecs.map((spec) => {
                        const lineStyle: Record<string, string | undefined> = { ...dimStyles }
                        if (spec.width !== null) {
                            lineStyle['width'] = spec.width
                        }
                        const lineClasses = {
                            shape: true,
                            line: true,
                            'line-last': lineSpecs.length > 1 && spec.isLast && spec.width === null,
                        }
                        return html`<div class=${classMap(lineClasses)} style=${styleMap(lineStyle)}></div>`
                    })}
                </div>
            `
        }

        return html`
            <div class="slot-probe">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
            <div
                class="shape"
                style=${styleMap(dimStyles)}
                aria-hidden=${ariaHidden}
            ></div>
        `
    }

    private buildDimensionStyleMap(): Record<string, string | undefined> {
        const styles: Record<string, string | undefined> = {}
        const w = normalizeCssDimension(this.width)
        const h = normalizeCssDimension(this.height)
        const ar = normalizeCssDimension(this.aspectRatio)

        if (w !== null) {
            styles['width'] = w
        }
        if (h !== null) {
            styles['height'] = h
        }
        if (ar !== null) {
            styles['aspect-ratio'] = ar
        }
        return styles
    }

    private syncSlottedContent(): void {
        const next = hasMeaningfulChildNodes(this)
        if (next !== this._hasSlottedContent) {
            this._hasSlottedContent = next
        }
    }

    private syncHostClasses(): void {
        const hostClasses = this.getHostClasses()
        for (const [name, active] of Object.entries(hostClasses)) {
            this.classList.toggle(name, active)
        }
    }

    private handleSlotChange = (): void => {
        this.syncSlottedContent()
    }
}
