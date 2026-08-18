/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * `mdc-expressive-slider` — Material Design 3 Expressive slider.
 *
 * Layout pulled from the Figma prototype (node-id `58008:10353`):
 * - Standard: `[active-track] [handle] [inactive-track]` with the handle
 *   flush between segments. Active fills from min up to the handle position.
 * - Centered: two inactive halves split at 50%, with an active overlay
 *   growing from the center toward the value side.
 * - Range: two inactive halves with two handles symmetric about the center
 *   and a center dot at the 50% mark.
 *
 * Five size presets (`extra-small` / `small` / `medium` / `large` /
 * `extra-large`) and two orientations (`horizontal` / `vertical`).
 *
 * @slot icon-start — Optional icon at the start of the track.
 * @slot icon-end — Optional icon at the end of the track.
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

    protected override render() {
        const step = this.step === 0 ? 1 : this.step
        const range = Math.max(this.max - this.min, step)

        // Compute start/end fractions based on type.
        let startFraction: number
        let endFraction: number
        let normalized = 0
        if (this.type === Type.Range) {
            startFraction = ((this.renderValueStart ?? this.min) - this.min) / range
            endFraction = ((this.renderValueEnd ?? this.min) - this.min) / range
            normalized = endFraction
        } else if (this.type === Type.Centered) {
            // Centered: value goes from -max to +max (effective min = -max).
            // The handle sits at fraction `(value + max) / (2 * max)` of the
            // slider width, so the cursor matches the handle exactly.
            const halfRange = this.max
            const cv = this.value ?? 0
            normalized = (cv + halfRange) / (2 * halfRange)
            startFraction = normalized < 0.5 ? (0.5 - normalized) * 2 : 0
            endFraction = normalized > 0.5 ? (normalized - 0.5) * 2 : 0
        } else {
            startFraction = 0
            normalized = ((this.renderValueEnd ?? this.min) - this.min) / range
            endFraction = normalized
        }

        // `gap` is the visible empty space between the handle's edge and
        // the track's edge (in pixels). The handle's own width is taken
        // from the --_handle-width variable so the math stays readable
        // and the gap sizing is decoupled from the handle width.
        const gap = 4

        const containerStyles = {
            '--_start-fraction': String(startFraction),
            '--_end-fraction': String(endFraction),
            '--_tick-count': String(range / step),
        }
        const containerClasses = {
            ranged: this.type === Type.Range,
            centered: this.type === Type.Centered,
        }

        const labelStart = this.valueLabelStart || String(this.renderValueStart)
        const labelEnd =
            (this.type === Type.Range ? this.valueLabelEnd : this.valueLabel) ||
            String(this.renderValueEnd)

        // Centered: the input range runs from -max..+max so the cursor
        // position matches the handle position exactly (cursor at 50%
        // → value=0 → handle centered). The slider's `min` is ignored
        // because the value is symmetric around 0.
        const isVerticalDirection = this.direction === Direction.Vertical
        const centeredInputMin = -this.max
        const centeredInputMax = this.max

        // ── Inline position styles ──────────────────────────────────────────
        // The container is `display: block` (no flex gap). Tracks and
        // handles are positioned absolutely and sized by their inline
        // `left` / `right` so the cursor maps 1:1 onto the value (and
        // therefore the handle). The visible gap between the handle and
        // the surrounding tracks is the constant `gap` above.
        //
        // Standard mode: track-start (active) and track-end (inactive)
        //   meet at center with the handle centered between them.
        // Range mode:    track-start (inactive) - track-middle (active)
        //                - track-end (inactive) split around the two
        //                handles; the clip-path on the input splits
        //                pointer events at the slider's 50% mark.
        // Centered mode: track-start (inactive) fills the full left half;
        //                track-end (inactive) is split at the handle so
        //                the visible gap on the value side is background;
        //                the active overlay covers the active region only.
        //
        // In vertical mode every `left`/`right` becomes
        // `inset-block-start`/`inset-block-end` (writing-mode: vertical-lr).
        // The cross-axis (`inline-size` for the track, `block-size` for
        // the handle) is unaffected — the track is still a horizontal bar
        // and the handle is still a vertical bar.
        const posMainStart = isVerticalDirection ? 'inset-block-start' : 'inset-inline-start'
        const posMainEnd = isVerticalDirection ? 'inset-block-end' : 'inset-inline-end'

        // Handle inline-style: centered at `fraction%` of the container.
        // `inset-block-start: 50%` + `transform: translateY(-50%)` is already
        // supplied by the .handle CSS rule, so we only need the inline-start.
        const handlePosStyle = (fraction: number) =>
            `${posMainStart}: calc(${fraction} * 100% - var(--_handle-width) / 2);`

        // Returns inline style for the input clip used by range mode. The
        // clip is set at the slider's 50% mark so the start input owns the
        // left half and the end input owns the right half. The axis swap
        // for vertical mode is handled here (not in CSS) so the same rule
        // applies to both directions.
        const inputClipStyle = (isStart: boolean) =>
            isStart
                ? `${posMainEnd}: calc(50%)`
                : `${posMainStart}: calc(50%)`

        return html`
            <div
                class="container ${classMap(containerClasses)}"
                style="${styleMap(containerStyles)}"
            >
                ${when(this.type === Type.Range, () => this.renderInput({
                    start: true,
                    value: this.renderValueStart,
                    ariaLabel: this.renderAriaLabelStart,
                    ariaValueText: this.renderAriaValueTextStart,
                    ariaMin: this.min,
                    ariaMax: this.max,
                    // Both range inputs span the FULL slider range so the
                    // native click-to-value mapping stays linear with the
                    // cursor. The clip-path (CSS rules) decides which half
                    // each input owns.
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
                ${this.renderTrackStart()}
                ${when(this.type === Type.Range, () => this.renderTrackMiddle())}
                ${this.type === Type.Standard
                    ? this.renderHandle({
                          start: false,
                          hover: this.handleEndHover,
                          label: labelEnd,
                          style: handlePosStyle(normalized),
                      })
                    : nothing}
                ${this.renderTrackEnd()}
                ${this.type === Type.Centered
                    ? this.renderHandle({
                          start: false,
                          hover: this.handleEndHover,
                          label: labelEnd,
                          style: handlePosStyle(normalized),
                      })
                    : nothing}
                ${when(this.type === Type.Range, () => this.renderHandle({
                    start: false,
                    hover: this.handleEndHover,
                    label: labelEnd,
                    style: handlePosStyle(endFraction),
                }))}
                ${when(this.type === Type.Range, () => this.renderHandle({
                    start: true,
                    hover: this.handleStartHover,
                    label: labelStart,
                    style: handlePosStyle(startFraction),
                }))}
                ${when(this.type === Type.Range, () => this.renderCenterDot())}
                ${when(this.type === Type.Centered, () => this.renderCenteredOverlay())}
                ${this.ticks ? html`<div class="tickmarks"></div>` : nothing}
            </div>
        `
    }

    /**
     * Left/top track segment. For `standard`, this is the active track in
     * horizontal mode (or inactive in vertical mode). For `centered` and
     * `range`, it's an inactive background.
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
     * (valueStart..valueEnd). It carries the active color and spans the
     * gap between the two handles (minus the visible gap on each side).
     */
    protected renderTrackMiddle() {
        const step = this.step === 0 ? 1 : this.step
        const range = Math.max(this.max - this.min, step)
        const startFraction = ((this.renderValueStart ?? this.min) - this.min) / range
        const endFraction = ((this.renderValueEnd ?? this.min) - this.min) / range
        const gap = 4
        const isVertical = this.direction === Direction.Vertical
        const posMainStart = isVertical ? 'inset-block-start' : 'inset-inline-start'
        const posMainEnd = isVertical ? 'inset-block-end' : 'inset-inline-end'
        const hw = 2
        const style = `${posMainStart}: calc(${startFraction * 100}% + ${hw + gap}px); ${posMainEnd}: calc(100% - ${endFraction * 100}% + ${hw + gap}px);`
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
        const isVertical = this.direction === Direction.Vertical
        const isCentered = this.type === Type.Centered
        const isRange = this.type === Type.Range
        const isStandard = this.type === Type.Standard
        const step = this.step === 0 ? 1 : this.step
        const range = Math.max(this.max - this.min, step)
        const cv = this.value ?? 0
        const valueFraction = (cv - this.min) / range
        const centeredFraction = (cv + this.max) / (2 * this.max)
        const startFraction = ((this.renderValueStart ?? this.min) - this.min) / range
        const endFraction = ((this.renderValueEnd ?? this.min) - this.min) / range
        const gap = 4
        const hw = 2
        const posMainStart = isVertical ? 'inset-block-start' : 'inset-inline-start'
        const posMainEnd = isVertical ? 'inset-block-end' : 'inset-inline-end'

        let active = false

        if (isStandard) {
            // Standard: track-start (active) on the slider LEAD side of
            // the handle; track-end (inactive) on the TRAIL side. In
            // horizontal mode the active side is the LEFT segment; in
            // vertical mode it's the BOTTOM segment (min end).
            if (isVertical) {
                if (position === 'end') {
                    active = true
                }
            } else {
                if (position === 'start') {
                    active = true
                }
            }
            // IMPORTANT: `inset-inline-end` is the offset FROM the right
            // edge of the parent. For the track-start to end at
            // `handleLeft - gap` (i.e. 244px on a 500px slider when
            // value=50), the inset-inline-end must be
            // `containerWidth - 244 = 256px`. Equivalently:
            //   inset-inline-end = 100% - value% + (hw + gap)px
            // The earlier formula subtracted (hw + gap), which placed
            // the right edge 12px too far to the right (the track then
            // engulfed the handle).
            const styleShift = position === 'start'
                ? `${posMainStart}: 0; ${posMainEnd}: calc(100% - ${valueFraction * 100}% + ${hw + gap}px);`
                : `${posMainStart}: calc(${valueFraction * 100}% + ${hw + gap}px); ${posMainEnd}: 0;`
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
            // Range: track-start covers [min, valueStart] (inactive),
            // track-end covers [valueEnd, max] (inactive). Middle track
            // is rendered separately.
            const styleShift = position === 'start'
                ? `${posMainStart}: 0; ${posMainEnd}: calc(100% - ${startFraction * 100}% + ${hw + gap}px);`
                : `${posMainStart}: calc(${endFraction * 100}% + ${hw + gap}px); ${posMainEnd}: 0;`
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
            // Centered: track-start fills the FULL left half (the
            // [0%, 50%] inactive background). track-end is split at the
            // handle position so the visible gap on the value side is
            // the parent's background color.
            const isPositive = centeredFraction > 0.5
            const isExactlyZero = centeredFraction === 0.5
            const hw = 2
            if (position === 'start') {
                if (isCentered) {
                    if (isExactlyZero) {
                        // value=0: handle at 50%, no active overlay. The
                        // track-start covers [0, 50% - hw - gap] so the
                        // visible gap on the lead side of the handle is
                        // parent's background.
                        const style = `${posMainStart}: 0; ${posMainEnd}: calc(50% + ${hw + gap}px);`
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
                    if (isPositive) {
                        // Positive value: the left half is the full
                        // [0, 50%] inactive background.
                        const style = `${posMainStart}: 0; ${posMainEnd}: 50%;`
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
                    // Negative value: track-start is split at the handle
                    // position. Part 1 (far left, [0, value-hw-gap]) and
                    // part 2 (under the active overlay, [value+hw+gap,
                    // 50%]). Render as two segments.
                    const style1 = `${posMainStart}: 0; ${posMainEnd}: calc(100% - ${centeredFraction * 100}% + ${hw + gap}px);`
                    const style2 = `${posMainStart}: calc(${centeredFraction * 100}% + ${hw + gap}px); ${posMainEnd}: 50%;`
                    return html`
                        <div
                            class="track"
                            data-position="${position}"
                            data-active="false"
                            style="${style1}"
                        >
                            <div class="stop-indicator"></div>
                        </div>
                        <div
                            class="track"
                            data-position="${position}"
                            data-active="false"
                            style="${style2}"
                        ></div>
                    `
                }
            } else {
                // position === 'end': right half.
                if (isExactlyZero) {
                    // value=0: track-end is split at the handle's TRAIL
                    // edge so the visible gap is the parent's background.
                    // The handle sits at 50%, so its trail edge is at
                    // 50% + hw + gap.
                    const style = `${posMainStart}: calc(50% + ${hw + gap}px); ${posMainEnd}: 0;`
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
                if (isPositive) {
                    // Positive value: track-end covers [50%, value-hw-gap]
                    // (under the active overlay) AND [value+hw+gap, 100%]
                    // (the inactive tail). Render as two segments.
                    const style1 = `${posMainStart}: 50%; ${posMainEnd}: calc(100% - ${centeredFraction * 100}% + ${hw + gap}px);`
                    const style2 = `${posMainStart}: calc(${centeredFraction * 100}% + ${hw + gap}px); ${posMainEnd}: 0;`
                    return html`
                        <div
                            class="track"
                            data-position="${position}"
                            data-active="false"
                            style="${style2}"
                        >
                            <div class="stop-indicator"></div>
                        </div>
                        <div
                            class="track"
                            data-position="${position}"
                            data-active="false"
                            style="${style1}"
                        ></div>
                    `
                }
                // Negative value: track-end covers [50%, 100%].
                const style = `${posMainStart}: 50%; ${posMainEnd}: 0;`
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
        }

        // Fallback (shouldn't reach here).
        return html`
            <div
                class="track"
                data-position="${position}"
                data-active="${active}"
                style="${posMainStart}: 0; ${posMainEnd}: 0;"
            >
                <div class="stop-indicator"></div>
            </div>
        `
    }

    /**
     * Centered mode's active overlay. Sits on top of the value-side
     * track-end segment from 50% to value-handleHalfWidth-gap. The
     * visible gap on the value side shows the parent background (the
     * track-end segment is split at the handle position).
     */
    protected renderCenteredOverlay() {
        const cv = this.value ?? 0
        const centeredFraction = (cv + this.max) / (2 * this.max)
        const isVertical = this.direction === Direction.Vertical
        if (centeredFraction === 0.5) return nothing
        const mainAxisSize = isVertical ? 'block-size' : 'inline-size'
        const mainAxisStart = isVertical ? 'inset-block-end' : 'inset-inline-start'
        const hw = 2
        const gap = 4
        const isPositive = centeredFraction > 0.5
        // For positive value: overlay sits at mainAxisStart: 50% with
        // inline-size = handleLeft - 50% - gap = value%*100% - hw - 50% - gap.
        // For negative value: overlay sits at mainAxisStart: handleRight + gap
        // = value%*100% + hw + gap, with inline-size = 50% - handleRight - gap.
        const style = isPositive
            ? `${mainAxisStart}: 50%; ${mainAxisSize}: calc(${centeredFraction * 100}% - 50% - ${hw + gap}px);`
            : `${mainAxisStart}: calc(${centeredFraction * 100}% + ${hw + gap}px); ${mainAxisSize}: calc(50% - ${centeredFraction * 100}% - ${hw + gap}px);`
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
     * For `type='range'` we want the clamp to reflect the current handle
     * ordering so dragging past the other handle clamps correctly.
     *
     * `inlineStyle` lets the caller apply a per-type clip-path piece
     * (range mode) or any other positioning override. The base input
     * itself is already positioned to fill the container via the shared
     * `.container input[type='range']` rule.
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
        inlineStyle,
    }: {
        start: boolean
        value?: number
        ariaLabel: string
        ariaValueText: string
        ariaMin: number
        ariaMax: number
        inputMin: number
        inputMax: number
        inlineStyle?: string
    }) {
        const name = start ? `start` : `end`
        return html`
            <input
                type="range"
                class="${classMap({start, end: !start})}"
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
                style=${inlineStyle || ''}
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