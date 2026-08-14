/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import type { FocusRingDefinition } from '../../component-definitions/focus-ring.definition'
import type { RippleDefinition } from '../../component-definitions/ripple.definition'
import { CheckboxDefinition } from '../../component-definitions/checkbox.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import { overrideComponentTokens, stringTokens } from '../../utils/tokens'

const tokenRecord = defineTokenRefsRecord(CheckboxDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-checkbox',
})
const tokenString = unsafeCSS(defineVars(tokenRecord, true).join(''))

// MD3 checkbox motion: 350ms enter / 150ms exit with Emphasized easings.
const emphasizedAccelerate = unsafeCSS(Easing.EmphasizedAccelerate.ToCSSValue())
const emphasizedDecelerate = unsafeCSS(Easing.EmphasizedDecelerate.ToCSSValue())

const rippleStyles = (state: 'selected' | 'unselected') => stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', {
    'hovered-color': `var(--_hovered-${state}-state-layer-color)`,
    'hovered-opacity': `var(--_hovered-${state}-state-layer-opacity)`,
    'focused-color': `var(--_focused-${state}-state-layer-color)`,
    'focused-opacity': `var(--_focused-${state}-state-layer-opacity)`,
    'pressed-color': `var(--_pressed-${state}-state-layer-color)`,
    'pressed-opacity': `var(--_pressed-${state}-state-layer-opacity)`,
}))
const errorRippleStyles = () => stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', {
    'hovered-color': `var(--_hovered-error-state-layer-color)`,
    'hovered-opacity': `var(--_hovered-error-state-layer-opacity)`,
    'focused-color': `var(--_focused-error-state-layer-color)`,
    'focused-opacity': `var(--_focused-error-state-layer-opacity)`,
    'pressed-color': `var(--_pressed-error-state-layer-color)`,
    'pressed-opacity': `var(--_pressed-error-state-layer-opacity)`,
}))

// The focus indicator is a 44px rounded square around the 18px box. The ring
// sizes itself through its own `outward-offset` mechanism, so it stays correct
// even when `container-size` is overridden.
const focusRingTokens = stringTokens(overrideComponentTokens<keyof typeof FocusRingDefinition>('--mdc-focus-ring', {
    'color': `var(--_focused-indicator-color)`,
    'outward-offset': `calc((44px - var(--_container-size)) / 2)`,
    "shape-end-end": 'var(--_focus-ring-shape-end-end)',
    "shape-end-start": 'var(--_focus-ring-shape-end-start)',
    "shape-start-end": 'var(--_focus-ring-shape-start-end)',
    "shape-start-start": 'var(--_focus-ring-shape-start-start)',
}))

export const CheckboxStyles = css`
    @layer mdc.checkbox {
        @layer variable {
            :host {
                ${tokenString}
            }
        }

        @layer base {
            :host {
                display: inline-flex;
                vertical-align: top;
                cursor: pointer;
                box-sizing: border-box;
                -webkit-tap-highlight-color: transparent;
                outline: none;
                position: relative;
                height: var(--_container-size);
                width: var(--_container-size);
                border-start-start-radius: var(--_container-shape-start-start);
                border-start-end-radius: var(--_container-shape-start-end);
                border-end-end-radius: var(--_container-shape-end-end);
                border-end-start-radius: var(--_container-shape-end-start);
                /* Reserve space for the 48px touch target around the 18px box. */
                margin: max(0px, ((48px - var(--_container-size)) / 2));
            }
            :host([disabled]) {
                cursor: default;
            }
            :host([touch-target='none']) {
                margin: 0px;
            }

            .container {
                display: flex;
                height: 100%;
                place-content: center;
                place-items: center;
                position: relative;
                width: 100%;
                z-index: 0;
                /* The host carries the container-shape-* corner tokens; the
                   outline / background / focus ring all derive their radius
                   from this node. */
                border-radius: inherit;
            }

            .outline,
            .background,
            .icon {
                inset: 0;
                position: absolute;
            }

            .outline,
            .background {
                border-radius: inherit;
            }

            .outline {
                border-color: var(--_unselected-outline-color);
                border-style: solid;
                border-width: var(--_unselected-outline-width);
                box-sizing: border-box;
            }
            .selected .outline {
                border-color: transparent;
                border-width: var(--_selected-outline-width);
            }

            .background {
                background-color: var(--_selected-container-color);
            }

            /* 48px touch target. Covers the box plus its margin so hover,
               pointer and keyboard activation work over the whole target. */
            .touch {
                appearance: none;
                height: 48px;
                margin: 0;
                opacity: 0;
                outline: none;
                position: absolute;
                width: 48px;
                z-index: 1;
                cursor: inherit;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            :host([touch-target='none']) .touch {
                height: 100%;
                width: 100%;
            }

            /* Background and icon fade in/out with a vertical 45° flip. */
            .background,
            .icon {
                opacity: 0; /* Fade in */
                transition-duration: 150ms, 50ms; /* Exit duration for scale and opacity. */
                transition-property: transform, opacity;
                /* Exit easing for scale, linear for opacity. */
                transition-timing-function: ${emphasizedAccelerate}, linear;
                transform: scale(0.6); /* Scale from 60% to 100%. */
            }
            .selected :is(.background, .icon) {
                opacity: 1;
                transition-duration: 350ms, 50ms; /* Enter duration for scale and opacity. */
                transition-timing-function: ${emphasizedDecelerate}, linear;
                transform: scale(1);
            }

            .icon {
                fill: var(--_selected-icon-color);
                height: var(--_icon-size);
                width: var(--_icon-size);
            }

            /* The checkmark is two <rect> marks: a short 2×2 leading segment
               and a long 10×2 trailing segment (the indeterminate dash). */
            .mark.short {
                height: 2px;
                transition-property: transform, height;
                width: 2px;
            }
            .mark.long {
                height: 2px;
                transition-property: transform, width;
                width: 10px;
            }
            .mark {
                animation-duration: 150ms;
                animation-timing-function: ${emphasizedAccelerate};
                transition-duration: 150ms;
                transition-timing-function: ${emphasizedAccelerate};
            }
            .selected .mark {
                animation-duration: 350ms;
                animation-timing-function: ${emphasizedDecelerate};
                transition-duration: 350ms;
                transition-timing-function: ${emphasizedDecelerate};
            }

            /* Creates the checkmark icon. The rects' bottom-left corner becomes
               the bottom-most point of the checkmark (scaleY(-1) flips them
               around the top-left origin, a Safari-compatible workaround). */
            .checked .mark,
            .prev-checked.unselected .mark {
                transform: scaleY(-1) translate(7px, -14px) rotate(45deg);
            }
            .checked .mark.short,
            .prev-checked.unselected .mark.short {
                /* Right triangle with X,Y legs of 4dp: √(4² + 4²) */
                height: 5.656854249492381px;
            }
            .checked .mark.long,
            .prev-checked.unselected .mark.long {
                /* Right triangle with X,Y legs of 8dp: √(8² + 8²) */
                width: 11.313708498984761px;
            }

            /* Creates the indeterminate icon (a horizontal dash). */
            .indeterminate .mark,
            .prev-indeterminate.unselected .mark {
                transform: scaleY(-1) translate(4px, -10px) rotate(0deg);
            }

            /* When selecting an unselected box, fade the icon in from its final
               position rather than animating the mark shape. */
            .prev-unselected .mark {
                transition-property: none;
            }
            .prev-unselected.checked .mark.long {
                /* Grow the long end of the checkmark from zero width. */
                animation-name: prev-unselected-to-checked;
            }
            @keyframes prev-unselected-to-checked {
                from {
                    width: 0;
                }
            }

            /* Unselected outline colors across interaction states. */
            :host(:hover) .unselected .outline {
                border-color: var(--_hovered-unselected-outline-color);
                border-width: var(--_hovered-unselected-outline-width);
            }
            :host(:focus-within) .unselected .outline {
                border-color: var(--_focused-unselected-outline-color);
                border-width: var(--_focused-unselected-outline-width);
            }
            :host(:active) .unselected .outline {
                border-color: var(--_pressed-unselected-outline-color);
                border-width: var(--_pressed-unselected-outline-width);
            }

            /* Container and icon colors across interaction states. */
            :host(:hover) .background {
                background: var(--_hovered-selected-container-color);
            }
            :host(:focus-within) .background {
                background: var(--_focused-selected-container-color);
            }
            :host(:active) .background {
                background: var(--_pressed-selected-container-color);
            }
            :host(:hover) .icon {
                fill: var(--_hovered-selected-icon-color);
            }
            :host(:focus-within) .icon {
                fill: var(--_focused-selected-icon-color);
            }
            :host(:active) .icon {
                fill: var(--_pressed-selected-icon-color);
            }

            /* Error states — mixinDelegatesAria shifts the host's
               aria-invalid to data-aria-invalid, which is what these
               selectors match. */
            :host([data-aria-invalid='true']) .outline {
                border-color: var(--_unselected-error-outline-color);
            }
            :host([data-aria-invalid='true']:hover) .outline {
                border-color: var(--_hovered-unselected-error-outline-color);
            }
            :host([data-aria-invalid='true']:focus-within) .outline {
                border-color: var(--_focused-unselected-error-outline-color);
            }
            :host([data-aria-invalid='true']:active) .outline {
                border-color: var(--_pressed-unselected-error-outline-color);
            }
            :host([data-aria-invalid='true']) .background {
                background: var(--_selected-error-container-color);
            }
            :host([data-aria-invalid='true']:hover) .background {
                background: var(--_hovered-selected-error-container-color);
            }
            :host([data-aria-invalid='true']:active) .background {
                background: var(--_pressed-unselected-error-container-color);
            }
            :host([data-aria-invalid='true']) .icon {
                fill: var(--_selected-error-icon-color);
            }
            :host([data-aria-invalid='true']:hover) .icon {
                fill: var(--_hovered-selected-error-icon-color);
            }
            :host([data-aria-invalid='true']:focus-within) .icon {
                fill: var(--_focused-selected-error-icon-color);
            }
            :host([data-aria-invalid='true']:active) .icon {
                fill: var(--_pressed-selected-error-icon-color);
            }

            /* Disabled: don't animate to/from disabled states because the
               outline is hidden when selected — otherwise there'd be a flash
               when the state changes programmatically while disabled. */
            .disabled :is(.background, .icon, .mark),
            .prev-disabled :is(.background, .icon, .mark) {
                animation-duration: 0s;
                transition-duration: 0s;
            }
            .disabled .outline {
                border-color: var(--_disabled-unselected-outline-color);
                border-width: var(--_disabled-unselected-outline-width);
                opacity: var(--_disabled-unselected-container-opacity);
            }
            .selected.disabled .outline {
                border-color: transparent;
            }
            .selected.disabled .background {
                background: var(--_disabled-selected-container-color);
                opacity: var(--_disabled-selected-container-opacity);
            }
            .disabled .icon {
                fill: var(--_disabled-selected-icon-color);
            }
        }

        @layer composite.ripple {
            .container mdc-ripple {
                border-end-end-radius: var(--_state-layer-shape-end-end);
                border-end-start-radius: var(--_state-layer-shape-end-start);
                border-start-end-radius: var(--_state-layer-shape-start-end);
                border-start-start-radius: var(--_state-layer-shape-start-start);
                height: var(--_state-layer-size);
                inset: unset;
                width: var(--_state-layer-size);
            }
            .container.selected mdc-ripple {
                ${rippleStyles('selected')}
            }
            .container:not(.selected) mdc-ripple {
                ${rippleStyles('unselected')}
            }
            :host([data-aria-invalid='true']) .container mdc-ripple {
                ${errorRippleStyles()}
            }
        }

        @layer composite.focus-ring {
            .container mdc-focus-ring {
                ${focusRingTokens};
            }
        }

        @layer hcm {
            @media (forced-colors: active) {
                .background {
                    background-color: CanvasText;
                }
                .selected.disabled .background {
                    background-color: GrayText;
                    opacity: 1;
                }
                .outline {
                    border-color: CanvasText;
                }
                .disabled .outline {
                    border-color: GrayText;
                    opacity: 1;
                }
                .icon {
                    fill: Canvas;
                }
            }
        }
    }
`
