import { Duration, Easing, Shape } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { SliderDefinitionVersion2 } from '../../../component-definitions/slider.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

const tokenRecord = defineTokenRefsRecord(SliderDefinitionVersion2, {
    expandShapes: false,
    useBaseFallback: true,
    prefix: '--mdc-slider'
})
const tokensStringified = unsafeCSS(defineVars(tokenRecord, true).join(''))

const medium1Duration = unsafeCSS(Duration.Medium1.ToCSSVariable())
const short2Duration = unsafeCSS(Duration.Short2.ToCSSVariable())
const emphasizedEasing = unsafeCSS(Easing.Emphasized.ToCSSVariable())

export const sliderStyles = [
    css`
        :host {
            ${tokensStringified};



            display: inline-flex;
            vertical-align: top;
            min-inline-size: 200px;
        }
        mdc-focus-ring {
            inset: unset;
            height: 48px;
            width: 48px;
        }

        mdc-elevation {
            transition-duration: ${medium1Duration};
            transition-timing-function: ${emphasizedEasing};
        }

        @media (prefers-reduced-motion) {
            .label {
                transition-duration: 0;
            }
        }

        .container {
            flex: 1;
            display: flex;
            align-items: center;
            position: relative;
            block-size: var(--_state-layer-size);
            /* note, only the native inputs are interactive. */
            pointer-events: none;
            /* ensure scrolling is prevented on mobile. */
            touch-action: none;
            user-select: none;

                        --_active-track-max-clip: calc(100% - var(--_with-tick-marks-container-size) * 2);
            /* When the start fraction is !0, add clipping by the tick container size */
            --_start-fraction-not-zero: min(var(--_start-fraction) * 1e9, 1);
            --_active-track-start-offset: calc(var(--_with-tick-marks-container-size) * var(--_start-fraction-not-zero));
            --_active-track-start-clip: calc(var(--_active-track-start-offset) + var(--_active-track-max-clip) * var(--_start-fraction));
            /* When the end fraction is !1, add clipping by the tick container size */
            --_end-fraction-not-one: min((1 - var(--_end-fraction)) * 1e9, 1);
            --_active-track-end-offset: calc(var(--_with-tick-marks-container-size) * var(--_end-fraction-not-one));
            --_active-track-end-clip: calc(var(--_active-track-end-offset) + var(--_active-track-max-clip) *(1 - var(--_end-fraction)));

            /* Clip the inputs to the space left/right of the center point between the */
            /* values so the right input gets pointer events. */
            --_clip-to-start: calc(
                var(--_state-layer-size) / 2 + (100% - var(--_state-layer-size)) *
                (var(--_start-fraction) + ((var(--_end-fraction) - var(--_start-fraction)) / 2))
            );
            --_clip-to-end: calc(100% - var(--_clip-to-start));
        }

        .track,
        .tickmarks {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
        }

        /* inactive-track */
        .track::before,
        .tickmarks::before,
        /* active-track */
        .track::after,
        .tickmarks::after {
            position: absolute;
            content: '';
            /* pad the track inward by half the ripple size offset by the tick container size. */
            --_track-padding: calc((var(--_state-layer-size) / 2) - var(--_with-tick-marks-container-size));
            inset-inline-start: var(--_track-padding);
            inset-inline-end: var(--_track-padding);

            /* ticks size: set here since it does not change. */
            background-size: calc((100% - var(--_with-tick-marks-container-size) * 2) / var(--_tick-count)) 100%;
        }

        /* inactive-track */
        .track::before,
        .tickmarks::before {
            block-size: var(--_inactive-track-height);
            border-radius: var(--_inactive-track-shape);
        }

        .track::before {
            background: var(--_inactive-track-color);
        }

        .tickmarks::before {
            background-image: radial-gradient(
                circle at var(--_with-tick-marks-container-size) center,
                var(--_with-tick-marks-inactive-container-color) 0,
                var(--_with-tick-marks-inactive-container-color) calc(var(--_with-tick-marks-container-size) / 2),
                transparent calc(var(--_with-tick-marks-container-size) / 2)
            );
        }

        :host([disabled]) .track::before {
            /* Note, the active track opacity is applied to the entire host, */
            /* so the inactive track is calc'd to compensate. */
            opacity: calc((1 / var(--_disabled-active-track-opacity)) * var(--_disabled-inactive-track-opacity));
            background: var(--_disabled-inactive-track-color);
        }

        /* active-track */
        .track::after,
        .tickmarks::after {
            block-size: var(--_active-track-height);
            border-radius: var(--_active-track-shape);
            clip-path: inset(0 var(--_active-track-end-clip) 0 var(--_active-track-start-clip));
        }

        .track::after {
            background: var(--_active-track-color);
        }

        .tickmarks::after {
            background-image: radial-gradient(
                circle at var(--_with-tick-marks-container-size) center,
                var(--_with-tick-marks-active-container-color) 0,
                var(--_with-tick-marks-active-container-color) calc(var(--_with-tick-marks-container-size) / 2),
                transparent calc(var(--_with-tick-marks-container-size) / 2)
            );
        }

        /* rtl for active track clipping */
        .track:dir(rtl)::after {
            clip-path: inset(0 var(--_active-track-start-clip) 0 var(--_active-track-end-clip));
        }

        .tickmarks:dir(rtl)::after {
            clip-path: inset(0 var(--_active-track-start-clip) 0 var(--_active-track-end-clip));
        }

        :host([disabled]) .track::after {
            background: var(--_disabled-active-track-color);
        }

        :host([disabled]) .tickmarks::before {
            background-image: radial-gradient(
                circle at var(--_with-tick-marks-container-size) center,
                var(--_with-tick-marks-disabled-container-color) 0,
                var(--_with-tick-marks-disabled-container-color) calc(var(--_with-tick-marks-container-size) / 2),
                transparent calc(var(--_with-tick-marks-container-size) / 2)
            );
        }

        /* container for the handle that is inset with padding to be */
        /* track-sized so that the handle container can be positioned with % only */
        /* and avoid a Safari issue with not being able to transition values that */
        /* are calced from different units. */
        /* TODO remove when https://bugs.webkit.org/show_bug.cgi?id=23775 is */
        /* addressed. */
        .handleContainerPadded {
            position: relative;
            block-size: 100%;
            inline-size: 100%;
            padding-inline: calc(var(--_state-layer-size) / 2);
        }

        .handleContainerBlock {
            position: relative;
            block-size: 100%;
            inline-size: 100%;
        }

        .handleContainer {
            position: absolute;
            inset-block-start: 0;
            inset-block-end: 0;
            inset-inline-start: calc(100% * var(--_start-fraction));
            inline-size: calc(100% * (var(--_end-fraction) - var(--_start-fraction)));
        }

        /* handle */
        .handle {
            position: absolute;
            block-size: var(--_state-layer-size);
            inline-size: var(--_state-layer-size);
            border-radius: var(--_handle-shape);
            display: flex;
            place-content: center;
            place-items: center;
        }

        .handleNub {
            position: absolute;
            height: var(--_handle-height);
            width: var(--_handle-width);
            border-radius: var(--_handle-shape);
            background: var(--_handle-color);
        }

        :host([disabled]) .handleNub {
            background: var(--_disabled-handle-color);
        }

        input.end:focus ~ .handleContainerPadded .handle.end > .handleNub,
        input.start:focus ~ .handleContainerPadded .handle.start > .handleNub {
            background: var(--_focus-handle-color);
        }

        /* prefix classes exist to overcome specificity of focus styling. */
        .container > .handleContainerPadded .handle.hover > .handleNub {
            background: var(--_hover-handle-color);
        }

        :host(:not([disabled])) {
            input.end:active ~ .handleContainerPadded .handle.end > .handleNub,
            input.start:active ~ .handleContainerPadded .handle.start > .handleNub {
                background: var(--_pressed-handle-color);
            }
        }

        .onTop.isOverlapping {
            .label,
            .label::before {
                outline: var(--_with-overlap-handle-outline-color) solid var(--_with-overlap-handle-outline-width);
            }

            .handleNub {
                border: var(--_with-overlap-handle-outline-color) solid var(--_with-overlap-handle-outline-width);
            }
        }

        .handle.start {
            inset-inline-start: calc(0px - var(--_state-layer-size) / 2);
        }
        .handle.end {
            inset-inline-end: calc(0px - var(--_state-layer-size) / 2);
        }

        /* label */
        .label {
            position: absolute;
            box-sizing: border-box;
            display: flex;
            padding: 4px;
            place-content: center;
            place-items: center;
            border-radius: ${unsafeCSS(Shape.Full.ToCSSVariable())};

            color: var(--_label-text-color);
            font-family: var(--_label-text-font);
            font-size: var(--_label-text-size);
            line-height: var(--_label-text-line-height);
            font-weight: var(--_label-text-weight);

            inset-block-end: 100%;
            min-inline-size: var(--_label-container-height);
            min-block-size: var(--_label-container-height);
            background: var(--_label-container-color);
            transform-origin: center bottom;
            transform: scale(0);
            transition-property: transform;
            transition-duration: ${short2Duration};
            transition-timing-function: ${emphasizedEasing};
        }

        /* note, :has needed only for Safari; it's wrapped in a "forgiving" */
        /* :where since the syntax isn't supported yet in Firefox. */
        :host(:focus-within) .label,
        .handleContainer.hover .label,
        :where(:has(input:active)) .label {
            transform: scale(1);
        }

        .label::before,
        .label::after {
            position: absolute;
            display: block;
            content: '';
            background: inherit;
        }

        /* triangle below label */
        .label::before {
            /* Note, sizing carefully estimated to create an ice cream cone shape. */
            --_triangle-size: calc(var(--_label-container-height) / 2);
            inline-size: var(--_triangle-size);
            block-size: var(--_triangle-size);
            bottom: calc(var(--_label-container-height) / -10);
            transform: rotate(45deg);
        }

        /* fits inside label and occludes top half of triangle. */
        .label::after {
            inset: 0px;
            border-radius: inherit;
        }

        /* must stack above the label's pseudo-elements. */
        .labelContent {
            z-index: 1;
        }

        /* native input styling */
        /* note, the input is what the user interacts with so it must render and */
        /* be clickable, but it is visually hidden via opacity: 0 and non-clickable */
        /* styled ui is shown instead and positioned accordingly. */
        input[type='range'] {
            opacity: 0;
            -webkit-tap-highlight-color: transparent;
            position: absolute;
            box-sizing: border-box;
            /* needed for firefox */
            height: 100%;
            width: 100%;
            margin: 0;
            background: transparent;
            cursor: pointer;
            pointer-events: auto;
            appearance: none;
        }

        input[type='range']:focus {
            outline: none;
        }

        ::-webkit-slider-runnable-track {
            -webkit-appearance: none;
        }

        ::-moz-range-track {
            appearance: none;
        }

        ::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            /* note, this is sized to align with thumb */
            block-size: var(--_handle-height);
            inline-size: var(--_handle-width);
            opacity: 0;
            z-index: 2;
        }

        ::-moz-range-thumb {
            appearance: none;
            block-size: var(--_state-layer-size);
            inline-size: var(--_state-layer-size);
            transform: scaleX(0);
            opacity: 0;
            z-index: 2;
        }

        /* clip left side of "start" input */
        .ranged input.start {
            clip-path: inset(0 var(--_clip-to-end) 0 0);
        }

        /* in 'rtl', clip right side of "lesser" input */
        .ranged input.start:dir(rtl) {
            clip-path: inset(0 0 0 var(--_clip-to-end));
        }

        /* clip right side of "end" input */
        .ranged input.end {
            clip-path: inset(0 0 0 var(--_clip-to-start));
        }

        /* in 'rtl', clip left side of "greater" input */
        .ranged input.end:dir(rtl) {
            clip-path: inset(0 var(--_clip-to-start) 0 0);
        }

        .onTop {
            z-index: 1;
        }


        input.start::-webkit-slider-thumb {
            --_track-and-knob-padding: calc(
            (var(--_state-layer-size) - var(--_handle-width)) / 2
            );
            --_x-translate: calc(
            var(--_track-and-knob-padding) - 2 * var(--_start-fraction) *
                var(--_track-and-knob-padding)
            );
            transform: translateX(var(--_x-translate));
        }

        input.start:dir(rtl)::-webkit-slider-thumb {
            transform: translateX(calc(-1 * var(--_x-translate)));
        }

        input.end::-webkit-slider-thumb {
            --_track-and-knob-padding: calc(
            (var(--_state-layer-size) - var(--_handle-width)) / 2
            );
            --_x-translate: calc(
            var(--_track-and-knob-padding) - 2 * var(--_end-fraction) *
                var(--_track-and-knob-padding)
            );
            transform: translateX(var(--_x-translate));
        }

        input.end:dir(rtl)::-webkit-slider-thumb {
            transform: translateX(calc(-1 * var(--_x-translate)));
        }


        mdc-ripple {
            border-radius: 50%;
            height: var(--_state-layer-size);
            width: var(--_state-layer-size);
        }
    `
]
