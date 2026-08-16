/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * `mdc-expressive-slider` — Material Design 3 Expressive slider.
 *
 * Follows the MD3E spec as implemented by Jetpack Compose Material3:
 * - Track is split around the thumb with `thumbTrackGapSize` separation.
 * - Active track: from startFraction to (endFraction - gap).
 * - Inactive track: from (endFraction + gap) to 100%.
 * - Track uses configurable `trackCornerSize` (pill shape).
 * - Thumb is a thin pill (handleWidth) that expands on hover/press.
 * - Round stop indicators at track edges.
 * - 5 size presets: extra-small, small, medium, large, extra-large.
 * - Springy handle movement with `cubic-bezier(0.34, 1.56, 0.64, 1)`.
 * - Value indicator label on hover/press.
 * - Track icons at start/end of active and inactive segments.
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
import type { ExpressiveSliderSize, IExpressiveSlider } from './expressive-slider.interface'

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

    protected override render() {
        const step = this.step === 0 ? 1 : this.step
        const range = Math.max(this.max - this.min, step)
        const startFraction = this.range
            ? ((this.renderValueStart ?? this.min) - this.min) / range
            : 0
        const endFraction = ((this.renderValueEnd ?? this.min) - this.min) / range

        const containerStyles = {
            '--_start-fraction': String(startFraction),
            '--_end-fraction': String(endFraction),
            '--_tick-count': String(range / step),
        }
        const containerClasses = {
            ranged: this.range,
            [this.size]: true,
        }

        const labelStart = this.valueLabelStart || String(this.renderValueStart)
        const labelEnd =
            (this.range ? this.valueLabelEnd : this.valueLabel) ||
            String(this.renderValueEnd)

        const inputStartProps = {
            start: true,
            value: this.renderValueStart,
            ariaLabel: this.renderAriaLabelStart,
            ariaValueText: this.renderAriaValueTextStart,
            ariaMin: this.min,
            ariaMax: this.valueEnd ?? this.max,
        }

        const inputEndProps = {
            start: false,
            value: this.renderValueEnd,
            ariaLabel: this.renderAriaLabelEnd,
            ariaValueText: this.renderAriaValueTextEnd,
            ariaMin: this.range ? this.valueStart ?? this.min : this.min,
            ariaMax: this.max,
        }

        const handleStartProps = {
            start: true,
            hover: this.handleStartHover,
            label: labelStart,
        }

        const handleEndProps = {
            start: false,
            hover: this.handleEndHover,
            label: labelEnd,
        }

        const handleContainerClasses = {
            hover: this.handleStartHover || this.handleEndHover,
        }

        return html`
            <div
                class="container ${classMap(containerClasses)}"
                style="${styleMap(containerStyles)}"
            >
                ${this.range ? this.renderInput(inputStartProps) : nothing}
                ${this.renderInput(inputEndProps)}

                <div class="track-container">
                    <slot name="icon-start" aria-hidden="true"></slot>

                    <div class="track-inactive" aria-hidden="true"></div>
                    <div class="track-active" aria-hidden="true"></div>

                    <div class="stop-indicator start" aria-hidden="true"></div>
                    <div class="stop-indicator end" aria-hidden="true"></div>

                    <slot name="icon-end" aria-hidden="true"></slot>

                    ${this.ticks ? html`<div class="tickmarks" aria-hidden="true"></div>` : nothing}
                </div>

                <div class="handleContainerPadded">
                    <div class="handleContainerBlock">
                        <div class="handleContainer ${classMap(handleContainerClasses)}">
                            ${this.range ? this.renderHandle(handleStartProps) : nothing}
                            ${this.renderHandle(handleEndProps)}
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    protected override renderHandle({
        start,
        hover,
        label,
    }: {
        start: boolean
        hover: boolean
        label: string
    }) {
        const name = start ? 'start' : 'end'
        const classes = {
            [name]: true,
            hover,
        }
        return html`
            <div class="handle ${classMap(classes)}">
                <mdc-focus-ring part="focus-ring" for=${name}></mdc-focus-ring>
                <mdc-ripple
                    for=${name}
                    class=${name}
                    ?disabled=${this.disabled}
                ></mdc-ripple>
                <div class="handleNub">
                    <mdc-elevation part="elevation"></mdc-elevation>
                </div>
                ${when(this.labeled, () => this.renderLabel(label))}
            </div>
        `
    }
}
