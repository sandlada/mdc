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

        // Build inline position styles for absolutely-positioned handles.
// The container's writing-mode determines which inset property
// drives the value-driven axis (inline-start in both horizontal-tb
// and vertical-lr maps to the slider's main axis).
// The handle's CENTER (not its left/top edge) is positioned at
// fraction * 100% — subtracting half the handle width from inset-inline-start
// keeps the handle centered on the cursor across the whole range, instead
// of the previous formula which offset the center by up to half the handle
// width (and the offset grew with fraction).
        const handlePosStyle = (fraction: number) =>
            `position: absolute; inset-block-start: 50%; inset-inline-start: calc(${fraction} * 100% - var(--_handle-width) / 2);`

        const centeredHandleStyle =
            this.type === Type.Centered
                ? isVerticalDirection
                    ? `${handlePosStyle(normalized)} transform: translateX(-50%);`
                    : `${handlePosStyle(normalized)} transform: translateY(-50%);`
                : ''
        const rangeHandleEndStyle =
            this.type === Type.Range
                ? isVerticalDirection
                    ? `${handlePosStyle(endFraction)} transform: translateX(-50%);`
                    : `${handlePosStyle(endFraction)} transform: translateY(-50%);`
                : ''
        const rangeHandleStartStyle =
            this.type === Type.Range
                ? isVerticalDirection
                    ? `${handlePosStyle(startFraction)} transform: translateX(-50%);`
                    : `${handlePosStyle(startFraction)} transform: translateY(-50%);`
                : ''

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
                    // cursor. The clip-path (below) decides which half
                    // each input owns; the base-slider's clampAction /
                    // flipAction handle the case where one handle is
                    // dragged past the other. With per-half ranges the
                    // click would map to valueStart + X*(valueEnd-valueStart)
                    // and the handle would visibly lag the cursor.
                    inputMin: this.min,
                    inputMax: this.max,
                }))}
                ${this.renderInput({
                    start: false,
                    value: this.renderValueEnd,
                    ariaLabel: this.renderAriaLabelEnd,
                    ariaValueText: this.renderAriaValueTextEnd,
                    ariaMin:
                        this.type === Type.Range
                            ? this.valueStart ?? this.min
                            : this.type === Type.Centered
                                ? centeredInputMin
                                : this.min,
                    ariaMax:
                        this.type === Type.Centered ? centeredInputMax : this.max,
                    inputMin:
                        this.type === Type.Range
                            ? this.min
                            : this.type === Type.Centered
                                ? centeredInputMin
                                : this.min,
                    inputMax:
                        this.type === Type.Centered
                            ? centeredInputMax
                            : this.max,
                })}
                ${this.renderTrackStart()}
                ${when(this.type === Type.Range, () => this.renderTrackMiddle())}
                ${this.type !== Type.Range && this.type !== Type.Centered
                    ? this.renderHandle({ start: false, hover: this.handleEndHover, label: labelEnd })
                    : nothing}
                ${this.renderTrackEnd()}
                ${this.type === Type.Centered
                    ? this.renderHandle({
                          start: false,
                          hover: this.handleEndHover,
                          label: labelEnd,
                          style: centeredHandleStyle,
                      })
                    : nothing}
                ${when(this.type === Type.Range, () => this.renderHandle({
                    start: false,
                    hover: this.handleEndHover,
                    label: labelEnd,
                    style: rangeHandleEndStyle,
                }))}
                ${when(this.type === Type.Range, () => this.renderHandle({
                    start: true,
                    hover: this.handleStartHover,
                    label: labelStart,
                    style: rangeHandleStartStyle,
                }))}
                ${when(this.type === Type.Range, () => this.renderCenterDot())}
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
     * (valueStart..valueEnd). It carries the active color and its
     * flex-grow equals the difference between the two value fractions so
     * it exactly fills the gap between the two handles. Rounded ends
     * match the rest of the slider's geometry (sharp at both edges, since
     * it butts up against the handles in the gaps).
     */
    protected renderTrackMiddle() {
        const step = this.step === 0 ? 1 : this.step
        const range = Math.max(this.max - this.min, step)
        const startFraction = ((this.renderValueStart ?? this.min) - this.min) / range
        const endFraction = ((this.renderValueEnd ?? this.min) - this.min) / range
        const grow = Math.max(0, endFraction - startFraction)
        return html`
            <div
                class="track track-middle"
                data-position="middle"
                data-active="true"
                style="flex-grow: ${grow};"
            ></div>
        `
    }

    protected renderTrackSegment(position: 'start' | 'end') {
        const isVertical = this.direction === Direction.Vertical
        const isCentered = this.type === Type.Centered
        const isRange = this.type === Type.Range

        let grow: number | string
        let active = false

        if (isRange) {
            // Range: track-start covers [min, valueStart], track-end covers
            // [valueEnd, max]. The middle track fills the gap.
            grow = position === 'start'
                ? 'var(--_start-fraction, 0)'
                : 'calc(1 - var(--_end-fraction, 0))'
        } else if (isCentered) {
            grow = 1
        } else {
            // standard — active track grows with the value. In horizontal
            // mode it lives on the start (left); in vertical mode it lives on
            // the end (bottom) because min is at the bottom.
            if (isVertical) {
                grow = position === 'end'
                    ? 'var(--_end-fraction, 0)'
                    : 'calc(1 - var(--_end-fraction, 0))'
                active = position === 'end'
            } else {
                grow = position === 'start'
                    ? 'var(--_end-fraction, 0)'
                    : 'calc(1 - var(--_end-fraction, 0))'
                active = position === 'start'
            }
        }

        // Active overlay (centered only): grows from center toward value.
        // The overlay always grows along the slider's main axis. In horizontal
        // writing-mode that's inline-size; in writing-mode: vertical-lr the
        // inline axis is vertical, so inline-size is still the correct
        // property to drive vertical growth.
        const overlayStyle = `inline-size: calc(var(--_${position}-fraction, 0) * 100%);`
            + (position === 'start' ? ' align-self: end;' : '')

        return html`
            <div
                class="track"
                data-position="${position}"
                data-active="${active}"
                style="flex-grow: ${grow};"
            >
                ${isCentered
                    ? html`<div
                          class="active-overlay"
                          data-position="${position}"
                          style="${overlayStyle}"
                      ></div>`
                    : nothing}
                <div class="stop-indicator"></div>
            </div>
        `
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