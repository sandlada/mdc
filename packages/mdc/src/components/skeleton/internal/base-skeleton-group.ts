/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ContextProvider } from '@lit/context'
import { html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import {
    SkeletonGroupLoadedEvent,
    type IMDCSkeletonGroup,
    type IMDCSkeletonGroupLoadedEventDetail,
} from '../skeleton-group.interface'
import { SkeletonGroupStyles } from '../skeleton-group.style'
import { SkeletonAnimation, SkeletonSize } from '../skeleton.interface'
import { SkeletonContext, type ISkeletonGroupContext } from './skeleton-context'

export abstract class BaseSkeletonGroup extends LitElement implements IMDCSkeletonGroup {

    public static override styles = SkeletonGroupStyles

    @property({ type: Boolean, reflect: true })
    public loading: boolean = false

    @property({ type: String, reflect: true })
    public animation: SkeletonAnimation = SkeletonAnimation.Shimmer

    @property({ type: String, reflect: true })
    public size: SkeletonSize = SkeletonSize.Medium

    @property({ type: String, reflect: true })
    public label: string = 'Loading'

    private _wasLoading: boolean = false

    private readonly contextProvider = new ContextProvider(this, {
        context: SkeletonContext,
        initialValue: this.createContextValue(),
    })

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        if (
            changedProperties.has('loading') ||
            changedProperties.has('animation') ||
            changedProperties.has('size')
        ) {
            this.contextProvider.setValue(this.createContextValue())
        }
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (this._wasLoading && !this.loading) {
            this.dispatchEvent(
                new CustomEvent<IMDCSkeletonGroupLoadedEventDetail>(SkeletonGroupLoadedEvent, {
                    bubbles: true,
                    composed: true,
                    detail: { group: this },
                })
            )
        }
        this._wasLoading = this.loading
    }

    protected getRenderClasses(): Record<string, boolean> {
        return {
            group: true,
            loading: this.loading,
        }
    }

    protected override render(): TemplateResult {
        return html`
            <div
                class=${classMap(this.getRenderClasses())}
                role=${this.loading ? 'status' : nothing}
                aria-busy=${this.loading ? 'true' : nothing}
                aria-label=${this.loading && this.label.trim().length > 0 ? this.label : nothing}
            >
                <slot></slot>
            </div>
        `
    }

    private createContextValue(): ISkeletonGroupContext {
        return {
            loading: this.loading,
            animation: this.animation,
            size: this.size,
            inGroup: true,
        }
    }
}
