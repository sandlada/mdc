/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * `mdc-expressive-slider` — Material Design 3 Expressive slider.
 *
 * Layout pulled from the Figma prototype (node-id `58008:10353`):
 * - Standard: `[active-track] [handle] [inactive-track]`, with the visible
 *   track inset by `handleWidth/2` from each slider edge so the handle
 *   never sits flush against the slider edge.
 * - Centered: two inactive halves split at 50%, with the same inset
 *   mirrored around the center (`--_center-inset`) so the active overlay
 *   has a center gap and rounded ends on BOTH sides.
 * - Range: two inactive halves with two handles symmetric about the
 *   center and a center dot at the 50% mark.
 *
 * Five size presets (`extra-small` / `small` / `medium` / `large` /
 * `extra-large`) and two orientations (`horizontal` / `vertical`).
 *
 * @link https://m3.material.io/components/sliders/specs
 */

import { html, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { styleMap } from 'lit/directives/style-map.js'
import { when } from 'lit/directives/when.js'
import { BaseSlider } from '../slider/internal/base-slider'
import { ExpressiveSliderStyles } from './expressive-slider.style'
import {
    type ExpressiveSliderDirection,
    ExpressiveSliderDirection as Direction,
    type ExpressiveSliderSize,
    type ExpressiveSliderType,
    ExpressiveSliderType as Type,
    type IExpressiveSlider,
} from './expressive-slider.interface'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-expressive-slider': MDCExpressiveSlider
    }
}

/**
 * @version
 * Material Design 3 Expressive
 */
@customElement('mdc-expressive-slider')
export class MDCExpressiveSlider extends BaseSlider implements IExpressiveSlider {
    static override styles = ExpressiveSliderStyles

    /**
     * Size preset: `'extra-small'`, `'small'`, `'medium'` (default),
     * `'large'`, or `'extra-large'`. Reflects to the `size` attribute.
     */
    @property({ type: String, reflect: true })
    public size: ExpressiveSliderSize = 'medium'

    /** Slider orientation. Reflects to the `direction` attribute. */
    @property({ type: String, reflect: true })
    public direction: ExpressiveSliderDirection = Direction.Horizontal

    /** Behavioral type. Reflects to the `type` attribute. */
    @property({ type: String, reflect: true })
    public type: ExpressiveSliderType = Type.Standard

    /**
     * Whether the value scale is reversed.
     *
     * - When `false` (default):
     *   - `horizontal`: small to large, left-to-right (min at left, max at right).
     *   - `vertical`: small to large, top-to-bottom (min at top, max at bottom).
     * - When `true`:
     *   - `horizontal`: large to small, left-to-right (max at left, min at right).
     *   - `vertical`: large to small, top-to-bottom (max at top, min at bottom).
     *
     * Reflects to the `reversed` attribute.
     */
    @property({ type: Boolean, reflect: true })
    public reversed: boolean = false

    /**
     * Backward-compat alias for the legacy `range` boolean. Setting
     * `range=true` switches `type` to `'range'`; reading returns whether
     * `type === 'range'`.
     */
    public override get range(): boolean {
        return this.type === Type.Range
    }
    public override set range(value: boolean) {
        if (value && this.type !== Type.Range) {
            this.type = Type.Range
        }
    }

    /**
     * Compose the classes for the `.container` element. Per CLAUDE.md
     * convention for non-host root elements. The classes map every
     * reflected attribute (size / direction / type / reversed) onto the container
     * so CSS selectors can target combinations like
     * `:host([size='medium']) .container` without duplicating the lookup.
     */
    protected getRenderClasses() {
        return {
            ranged: this.type === Type.Range,
            centered: this.type === Type.Centered,
            reversed: this.reversed,
            [this.size]: true,
            [this.direction]: true,
        }
    }

    protected override render() {
        const fractions = this.computeFractions()
        const {
            visualNormalized,
            visualStartFraction,
            visualEndFraction,
            minVisualFraction,
            maxVisualFraction,
        } = fractions
        const step = this.step === 0 ? 1 : this.step
        const range = Math.max(this.max - this.min, step)

        const containerStyles: Record<string, string> = {
            '--_start-fraction': String(minVisualFraction),
            '--_end-fraction': String(maxVisualFraction),
            '--_tick-count': String(range / step),
        }

        // Centered: the input range runs from -max..+max so the cursor
        // position matches the handle position exactly (cursor at 50%
        // → value=0 → handle centered). The slider's `min` is ignored
        // because the value is symmetric around 0.
        const centeredInputMin = -this.max
        const centeredInputMax = this.max

        // Main axis is always the INLINE axis — horizontal in default
        // writing mode (horizontal-tb), vertical in vertical-lr. The
        // writing-mode declaration on :host reorients the inline axis,
        // so the same `inset-inline-start` / `inset-inline-end` strings
        // work for both directions.
        const posMainStart = 'inset-inline-start'

        // ── Inline position styles ──────────────────────────────────────────
        // The container is `display: block` (no flex gap). Tracks and
        // handles are positioned absolutely. All positions are computed
        // against the visible track range `[edge-inset, 100% - edge-inset]`
        // (set by `--_edge-inset` in the CSS), where `edge-inset` is
        // `handleWidth/2` per MD3E spec. The handle's INTERACTION CENTER
        // lands at the visible track's edge at value=0 and value=max.
        //
        // The visible gap between the handle and the surrounding tracks
        // is `--_thumb-track-gap` (4px by default), positioned at the
        // handle's leading/trailing edge so the rounded track cap is
        // visible on both sides of the handle.

        // Handle: `inset-inline-start = fraction * (100% - handleWidth)`.
        // At fraction=0, left/top edge at 0, center at handleWidth/2 (= edge-inset).
        // At fraction=1, left/top edge at 100% - handleWidth, center at 100% - handleWidth/2.
        const handlePosStyle = (fraction: number) =>
            `${posMainStart}: calc(${fraction} * (100% - var(--_handle-width)));`

        // For range mode, publish --_clip-to-start / --_clip-to-end so the
        // two native inputs split at the MIDPOINT of the two handle
        // positions (not at fixed 50%). The split moves with the values.
        if (this.type === Type.Range) {
            const midFraction = (visualStartFraction + visualEndFraction) / 2
            containerStyles['--_clip-to-start'] =
                `calc(var(--_edge-inset) + ${midFraction} * (100% - 2 * var(--_edge-inset)))`
            containerStyles['--_clip-to-end'] = `calc(100% - ${containerStyles['--_clip-to-start']})`
        }

        const labelStart = this.valueLabelStart || String(this.renderValueStart)
        const labelEnd =
            (this.type === Type.Range ? this.valueLabelEnd : this.valueLabel) ||
            String(this.renderValueEnd)

        return html`
            <div class="container ${classMap(this.getRenderClasses())}" style="${styleMap(containerStyles)}">
                ${this.renderTrackStart()}
                ${when(this.type === Type.Range, () => this.renderTrackMiddle(minVisualFraction, maxVisualFraction))}
                ${this.type === Type.Standard
                    ? this.renderHandle({
                          start: false,
                          hover: this.handleEndHover,
                          label: labelEnd,
                          style: handlePosStyle(visualNormalized),
                      })
                    : nothing}
                ${this.renderTrackEnd()}
                ${this.type === Type.Centered
                    ? this.renderHandle({
                          start: false,
                          hover: this.handleEndHover,
                          label: labelEnd,
                          style: handlePosStyle(visualNormalized),
                      })
                    : nothing}
                ${when(this.type === Type.Range, () => this.renderHandle({
                    start: false,
                    hover: this.handleEndHover,
                    label: labelEnd,
                    style: handlePosStyle(visualEndFraction),
                }))}
                ${when(this.type === Type.Range, () => this.renderHandle({
                    start: true,
                    hover: this.handleStartHover,
                    label: labelStart,
                    style: handlePosStyle(visualStartFraction),
                }))}
                ${when(this.type === Type.Range, () => this.renderCenterDot())}
                ${when(this.type === Type.Centered, () => this.renderCenteredOverlay(fractions))}
                ${this.ticks ? html`<div class="tickmarks"></div>` : nothing}
                ${when(this.type === Type.Range, () => this.renderInput({
                    start: true,
                    value: this.renderValueStart,
                    ariaLabel: this.renderAriaLabelStart,
                    ariaValueText: this.renderAriaValueTextStart,
                    ariaMin: this.min,
                    ariaMax: this.max,
                    inputMin: this.min,
                    inputMax: this.max,
                }))}
                ${this.renderInput({
                    start: false,
                    value: this.renderValueEnd,
                    ariaLabel: this.renderAriaLabelEnd,
                    ariaValueText: this.renderAriaValueTextEnd,
                    ariaMin:
                        this.type === Type.Centered ? centeredInputMin : this.min,
                    ariaMax:
                        this.type === Type.Centered ? centeredInputMax : this.max,
                    inputMin:
                        this.type === Type.Centered ? centeredInputMin : this.min,
                    inputMax:
                        this.type === Type.Centered ? centeredInputMax : this.max,
                })}
            </div>
        `
    }

    /**
     * Compute the fractions needed by the render tree, based on
     * the current `type`, `direction`, `reversed`, and the slider's value state.
     * Centralised so each render method doesn't recompute.
     */
    private computeFractions() {
        const step = this.step === 0 ? 1 : this.step
        const range = Math.max(this.max - this.min, step)
        let startFraction: number
        let endFraction: number
        let normalized = 0
        let centeredFraction: number | undefined

        if (this.type === Type.Range) {
            startFraction = ((this.renderValueStart ?? this.min) - this.min) / range
            endFraction = ((this.renderValueEnd ?? this.min) - this.min) / range
            normalized = endFraction
        } else if (this.type === Type.Centered) {
            const halfRange = this.max
            const cv = this.value ?? 0
            normalized = (cv + halfRange) / (2 * halfRange)
            centeredFraction = normalized
            startFraction = normalized < 0.5 ? (0.5 - normalized) * 2 : 0
            endFraction = normalized > 0.5 ? (normalized - 0.5) * 2 : 0
        } else {
            startFraction = 0
            normalized = ((this.renderValueEnd ?? this.min) - this.min) / range
            endFraction = normalized
        }

        // isVisualReversed determines whether value 0 is at visual start (inline-start)
        // or visual end (inline-end).
        // - Horizontal: default (reversed=false) is Left(0)->Right(100), so isVisualReversed=false.
        // - Vertical: default (reversed=false) is Bottom(0)->Top(100), so isVisualReversed=true (since inline-start is Top).
        const isVisualReversed =
            this.direction === Direction.Vertical ? !this.reversed : this.reversed

        const visualNormalized = isVisualReversed ? 1 - normalized : normalized
        let visualStartFraction: number
        let visualEndFraction: number
        let minVisualFraction: number
        let maxVisualFraction: number

        if (this.type === Type.Range) {
            visualStartFraction = isVisualReversed ? 1 - startFraction : startFraction
            visualEndFraction = isVisualReversed ? 1 - endFraction : endFraction
            minVisualFraction = Math.min(visualStartFraction, visualEndFraction)
            maxVisualFraction = Math.max(visualStartFraction, visualEndFraction)
        } else if (this.type === Type.Centered) {
            visualStartFraction = visualNormalized
            visualEndFraction = visualNormalized
            minVisualFraction = Math.min(0.5, visualNormalized)
            maxVisualFraction = Math.max(0.5, visualNormalized)
        } else {
            visualStartFraction = 0
            visualEndFraction = visualNormalized
            minVisualFraction = isVisualReversed ? visualNormalized : 0
            maxVisualFraction = isVisualReversed ? 1 : visualNormalized
        }

        return {
            startFraction,
            endFraction,
            normalized,
            centeredFraction,
            isVisualReversed,
            visualNormalized,
            visualStartFraction,
            visualEndFraction,
            minVisualFraction,
            maxVisualFraction,
        }
    }

    /**
     * Left/top track segment. Standard: the active track (fills from
     * the left edge up to the handle position). Centered / Range: the
     * inactive background of the left half.
     */
    protected renderTrackStart() {
        return this.renderTrackSegment('start')
    }

    /** Right/bottom track segment. */
    protected renderTrackEnd() {
        return this.renderTrackSegment('end')
    }

    /**
     * Middle track for range sliders — represents the selected portion
     * (valueStart..valueEnd). Both edges are inset from the handle
     * centers by `--_thumb-track-gap`; both caps are rounded (CornerFull).
     */
    protected renderTrackMiddle(minVisualFraction: number, maxVisualFraction: number) {
        const posMainStart = 'inset-inline-start'
        const posMainEnd = 'inset-inline-end'
        const style =
            `${posMainStart}: calc(${minVisualFraction} * (100% - var(--_handle-width)) + var(--_handle-width) + var(--_thumb-track-gap)); ` +
            `${posMainEnd}: calc(100% - ${maxVisualFraction} * (100% - var(--_handle-width)) + var(--_thumb-track-gap));`
        return html`
            <div
                class="track track-middle"
                data-position="middle"
                data-active="true"
                style="${style}"
            ></div>
        `
    }

    protected renderTrackSegment(position: 'start' | 'end') {
        const isCentered = this.type === Type.Centered
        const isRange = this.type === Type.Range
        const isStandard = this.type === Type.Standard
        const fractions = this.computeFractions()
        const { isVisualReversed, visualNormalized, minVisualFraction, maxVisualFraction } = fractions

        const posMainStart = 'inset-inline-start'
        const posMainEnd = 'inset-inline-end'

        if (isStandard) {
            // Standard: active track fills from min up to current value.
            // When isVisualReversed=false: start segment is active, end segment is inactive.
            // When isVisualReversed=true: start segment is inactive, end segment is active.
            const active = isVisualReversed ? position === 'end' : position === 'start'
            const styleShift = position === 'start'
                ? `${posMainStart}: var(--_edge-inset); ${posMainEnd}: calc(100% - ${visualNormalized} * (100% - var(--_handle-width)) + var(--_thumb-track-gap));`
                : `${posMainStart}: calc(${visualNormalized} * (100% - var(--_handle-width)) + var(--_handle-width) + var(--_thumb-track-gap)); ${posMainEnd}: var(--_edge-inset);`
            return html`
                <div
                    class="track"
                    data-position="${position}"
                    data-active="${active}"
                    style="${styleShift}"
                >
                    <div class="stop-indicator"></div>
                </div>
            `
        }

        if (isRange) {
            // Range: track-start covers [edge-inset, minHandle - thumb-track-gap]
            // (inactive), track-end covers [maxHandle + thumb-track-gap, 100% - edge-inset]
            // (inactive). The middle track is rendered separately.
            const styleShift = position === 'start'
                ? `${posMainStart}: var(--_edge-inset); ${posMainEnd}: calc(100% - ${minVisualFraction} * (100% - var(--_handle-width)) + var(--_thumb-track-gap));`
                : `${posMainStart}: calc(${maxVisualFraction} * (100% - var(--_handle-width)) + var(--_handle-width) + var(--_thumb-track-gap)); ${posMainEnd}: var(--_edge-inset);`
            return html`
                <div
                    class="track"
                    data-position="${position}"
                    data-active="false"
                    style="${styleShift}"
                >
                    <div class="stop-indicator"></div>
                </div>
            `
        }

        if (isCentered) {
            // Centered: track-start fills [edge-inset, 50% - edge-inset]
            // (the left half minus the center gap). track-end fills
            // [50% + edge-inset, 100% - edge-inset]. The active overlay
            // is drawn on top of track-end (positive value) or track-
            // start (negative value) by renderCenteredOverlay.
            const style = position === 'start'
                ? `${posMainStart}: var(--_edge-inset); ${posMainEnd}: calc(50% + var(--_edge-inset));`
                : `${posMainStart}: calc(50% + var(--_edge-inset)); ${posMainEnd}: var(--_edge-inset);`
            return html`
                <div
                    class="track"
                    data-position="${position}"
                    data-active="false"
                    style="${style}"
                >
                    <div class="stop-indicator"></div>
                </div>
            `
        }

        // Fallback (shouldn't reach here).
        return html`
            <div
                class="track"
                data-position="${position}"
                data-active="false"
                style="${posMainStart}: var(--_edge-inset); ${posMainEnd}: var(--_edge-inset);"
            >
                <div class="stop-indicator"></div>
            </div>
        `
    }

    /**
     * Centered mode's active overlay. Sits on top of the value-side
     * inactive track segment, between the center gap and the handle's
     * leading edge. BOTH ends are rounded (CornerFull via
     * --_active-leading-shape) since the center-side edge sits against
     * the center gap rather than against the handle.
     *
     * When `value === 0` the overlay length is 0; we render a single
     * `.center-stop` dot at the 50% mark instead (per MD3E spec).
     */
    protected renderCenteredOverlay(fractions: ReturnType<MDCExpressiveSlider['computeFractions']>) {
        const { visualNormalized } = fractions
        const posMainStart = 'inset-inline-start'
        const posMainEnd = 'inset-inline-end'

        // Exactly at center: render a single stop indicator at 50%.
        if (visualNormalized === 0.5) {
            return html`<div class="center-stop" aria-hidden="true"></div>`
        }

        const isPositive = visualNormalized > 0.5
        // Positive side: overlay spans [50% + edge-inset, handleLeft - thumbTrackGap].
        // Negative side: overlay spans [handleRight + thumbTrackGap, 50% - edge-inset].
        const style = isPositive
            ? `${posMainStart}: calc(50% + var(--_edge-inset)); ${posMainEnd}: calc(100% - ${visualNormalized} * (100% - var(--_handle-width)) + var(--_thumb-track-gap));`
            : `${posMainStart}: calc(${visualNormalized} * (100% - var(--_handle-width)) + var(--_handle-width) + var(--_thumb-track-gap)); ${posMainEnd}: calc(50% + var(--_edge-inset));`
        return html`<div
            class="active-overlay"
            data-position="${isPositive ? 'end' : 'start'}"
            style="${style}"
        ></div>`
    }

    /** Center dot for range sliders — marks the geometric center. */
    protected renderCenterDot() {
        return html`<div class="center-dot" aria-hidden="true"></div>`
    }

    /**
     * Override the base slider's input renderer so we can drive the actual
     * `.min` / `.max` properties on the native `<input type="range">`,
     * not just the `aria-valuemin` / `aria-valuemax` attributes. The base
     * implementation only sets the ARIA attributes, which leaves the
     * input's clamp range at the slider's configured `[min, max]`. For
     * `type='centered'` we need the native clamp range to be
     * `[-max, +max]` so the cursor position matches the handle position.
     * For `type='range'` the clip-path (driven by `--_clip-to-start` /
     * `--_clip-to-end` published from the inline container style) decides
     * which half of the slider each input owns; the inputs themselves span
     * the full container so the cursor-to-value mapping stays linear.
     */
    protected override renderInput({
        start,
        value,
        ariaLabel,
        ariaValueText,
        ariaMin,
        ariaMax,
        inputMin,
        inputMax,
    }: {
        start: boolean
        value?: number
        ariaLabel: string
        ariaValueText: string
        ariaMin: number
        ariaMax: number
        inputMin: number
        inputMax: number
    }) {
        const name = start ? `start` : `end`
        const fractions = this.computeFractions()
        const dir = fractions.isVisualReversed ? 'rtl' : nothing
        return html`
            <input
                type="range"
                class="${classMap({start, end: !start})}"
                dir=${dir}
                @focus=${this.handleFocus}
                @pointerdown=${this.handleDown}
                @pointerup=${this.handleUp}
                @pointerenter=${this.handleEnter}
                @pointermove=${this.handleMove}
                @pointerleave=${this.handleLeave}
                @keydown=${this.handleKeydown}
                @keyup=${this.handleKeyup}
                @input=${this.handleInput}
                @change=${this.handleChange}
                id=${name}
                .disabled=${this.disabled}
                .min=${String(inputMin)}
                aria-valuemin=${ariaMin}
                .max=${String(inputMax)}
                aria-valuemax=${ariaMax}
                .step=${String(this.step)}
                .value=${String(value)}
                .tabIndex=${start ? 1 : 0}
                aria-label=${ariaLabel || nothing}
                aria-valuetext=${ariaValueText}
            />
        `
    }

    protected override renderHandle({
        start,
        hover,
        label,
        style,
    }: {
        start: boolean
        hover: boolean
        label: string
        style?: string
    }) {
        const isRange = this.type === Type.Range
        const name = start ? 'start' : 'end'
        const classes = {
            [name]: true,
            hover,
            'range-handle-start': isRange && start,
            'range-handle-end': isRange && !start,
        }
        return html`
            <div class="handle ${classMap(classes)}" style=${style || ''}>
                <mdc-focus-ring part="focus-ring" for=${name}></mdc-focus-ring>
                <mdc-ripple
                    for=${name}
                    class=${name}
                    ?disabled=${this.disabled}
                ></mdc-ripple>
                <div class="handleNub"></div>
                ${when(this.labeled, () => this.renderLabel(label))}
            </div>
        `
    }

    protected override renderLabel(value: string) {
        return html`
            <div class="label" aria-hidden="true">
                <span class="labelContent" part="label">${value}</span>
            </div>
        `
    }
}