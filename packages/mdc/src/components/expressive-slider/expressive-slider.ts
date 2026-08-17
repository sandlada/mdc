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
            range: this.type === Type.Range,
            centered: this.type === Type.Centered,
        }

        const labelStart = this.valueLabelStart || String(this.renderValueStart)
        const labelEnd =
            (this.type === Type.Range ? this.valueLabelEnd : this.valueLabel) ||
            String(this.renderValueEnd)

        // Centered: position handle absolutely so it tracks the value
        // (the centered handle is the single handle whose position is
        // determined by the value, not by flex siblings).
        const centeredHandleStyle =
            this.type === Type.Centered
                ? `position: absolute; inset-block-start: 50%; transform: translateY(-50%); inset-inline-start: calc(${normalized} * (100% - var(--_handle-width)));`
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
                    ariaMax: this.valueEnd ?? this.max,
                }))}
                ${this.renderInput({
                    start: false,
                    value: this.renderValueEnd,
                    ariaLabel: this.renderAriaLabelEnd,
                    ariaValueText: this.renderAriaValueTextEnd,
                    ariaMin: this.type === Type.Range ? this.valueStart ?? this.min : this.min,
                    ariaMax: this.max,
                })}
                ${this.renderTrackStart()}
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
                ${when(this.type === Type.Range, () => this.renderHandle({ start: false, hover: this.handleEndHover, label: labelEnd }))}
                ${when(this.type === Type.Range, () => this.renderHandle({ start: true, hover: this.handleStartHover, label: labelStart }))}
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

    protected renderTrackSegment(position: 'start' | 'end') {
        const isVertical = this.direction === Direction.Vertical
        const isCentered = this.type === Type.Centered
        const isRange = this.type === Type.Range

        let grow: number | string
        let active = false

        if (isRange) {
            grow = 1
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
        const overlayStyle = isVertical
            ? `block-size: calc(var(--_${position}-fraction, 0) * 100%);`
              + (position === 'start' ? ' align-self: end;' : '')
            : `inline-size: calc(var(--_${position}-fraction, 0) * 100%);`
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