/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import type { FocusRingDefinition } from '../focus-ring/focus-ring.definition'
import type { IconDefinition } from '../icon/icon.definition'
import type { RippleDefinition } from '../ripple/ripple.definition'
import {
    AssistChipDefinition,
    FilterChipDefinition,
    InputChipDefinition,
    SuggestionChipDefinition,
} from './chip.definition'

const Stringify = stringifyTokens('--mdc-chip')
const AssistTokens = Stringify(AssistChipDefinition)
const FilterTokens = Stringify(FilterChipDefinition)
const InputTokens = Stringify(InputChipDefinition)
const SuggestionTokens = Stringify(SuggestionChipDefinition)

const EmphasizedEasing = unsafeCSS(Easing.Emphasized.ToCSSValue())
const CheckmarkLength = 29.7833385

const RippleStyles = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'hovered-color': `var(--_hovered-state-layer-color)`,
    'focused-color': `var(--_focused-state-layer-color)`,
    'pressed-color': `var(--_pressed-state-layer-color)`,
    'hovered-opacity': `var(--_hovered-state-layer-opacity)`,
    'focused-opacity': `var(--_focused-state-layer-opacity)`,
    'pressed-opacity': `var(--_pressed-state-layer-opacity)`,
})()

const SelectedRippleStyles = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'hovered-color': `var(--_hovered-state-layer-color-selected)`,
    'focused-color': `var(--_focused-state-layer-color-selected)`,
    'pressed-color': `var(--_pressed-state-layer-color-selected)`,
})()

const TrailingRippleStyles = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'hovered-color': `var(--_hovered-trailing-icon-color)`,
    'focused-color': `var(--_focused-trailing-icon-color)`,
    'pressed-color': `var(--_pressed-trailing-icon-color)`,
    'hovered-opacity': `var(--_hovered-state-layer-opacity)`,
    'focused-opacity': `var(--_focused-state-layer-opacity)`,
    'pressed-opacity': `var(--_pressed-state-layer-opacity)`,
})()

const SelectedTrailingRippleStyles = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'hovered-color': `var(--_hovered-trailing-icon-color-selected)`,
    'focused-color': `var(--_focused-trailing-icon-color-selected)`,
    'pressed-color': `var(--_pressed-trailing-icon-color-selected)`,
})()

const FocusRingShapeStyles = overrideTokens<typeof FocusRingDefinition>('--mdc-focus-ring')({
    'shape-start-start': `var(--_container-shape-start-start)`,
    'shape-start-end': `var(--_container-shape-start-end)`,
    'shape-end-start': `var(--_container-shape-end-start)`,
    'shape-end-end': `var(--_container-shape-end-end)`,
})()

const IconSizeStyles = overrideTokens<typeof IconDefinition>('--mdc-icon')({
    'size': `var(--_icon-size)`,
})()

const AvatarIconSizeStyles = overrideTokens<typeof IconDefinition>('--mdc-icon')({
    'size': `18px`,
})()

const ElevationBaseStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_enabled-container-elevation)`,
    'shadow-color': `var(--_enabled-container-shadow-color)`,
})()

const ElevationHoverStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_hovered-container-elevation)`,
})()

const ElevationFocusStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_focused-container-elevation)`,
})()

const ElevationPressStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_pressed-container-elevation)`,
})()

const ElevationDisabledStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_disabled-container-elevation)`,
})()

export const ChipStyles = css`
    @layer mdc.chip {
        @layer variable, composite, component, motion, contrast, transparency, hcm;
    }

    @layer mdc.chip.variable {
        :host([variant='assist']),
        :host(:not([variant])) {
            ${AssistTokens};
        }
        :host([variant='filter']) {
            ${FilterTokens};
        }
        :host([variant='input']) {
            ${InputTokens};
        }
        :host([variant='suggestion']) {
            ${SuggestionTokens};
        }
    }

    @layer mdc.chip.composite {
        .container mdc-ripple {
            border-radius: inherit;
            z-index: 0;
            ${RippleStyles};
        }

        .container.selected mdc-ripple {
            ${SelectedRippleStyles};
        }

        .container.has-trailing-action .trailing-action mdc-ripple {
            border-radius: 50%;
            ${TrailingRippleStyles};
        }

        .container.selected.has-trailing-action .trailing-action mdc-ripple {
            ${SelectedTrailingRippleStyles};
        }

        .container:is(.disabled, .soft-disabled) mdc-ripple {
            display: none;
        }

        .container > mdc-focus-ring {
            z-index: 1;
            ${FocusRingShapeStyles};
        }

        .trailing-action > mdc-focus-ring {
            z-index: 1;
        }

        .container mdc-elevation {
            border-radius: inherit;
            z-index: -1;
            transition-duration: 150ms;
            transition-timing-function: ${EmphasizedEasing};
            ${ElevationBaseStyles};
        }

        .container:not(.disabled):not(.soft-disabled):hover mdc-elevation {
            ${ElevationHoverStyles};
        }

        .container:not(.disabled):not(.soft-disabled):focus-within mdc-elevation {
            ${ElevationFocusStyles};
        }

        .container:not(.disabled):not(.soft-disabled):active mdc-elevation {
            ${ElevationPressStyles};
        }

        .container:is(.disabled, .soft-disabled) mdc-elevation {
            transition: none;
            ${ElevationDisabledStyles};
        }
    }

    @layer mdc.chip.component {
        :host {
            display: inline-flex;
            vertical-align: middle;
            outline: none;
            -webkit-tap-highlight-color: transparent;
        }

        :host([hidden]) {
            display: none;
        }

        :host([disabled]:not([always-focusable])) {
            pointer-events: none;
        }

        .container {
            all: unset;
            position: relative;
            box-sizing: border-box;
            display: inline-flex;
            align-items: center;
            height: var(--_container-height);
            min-width: 0;
            border-start-start-radius: var(--_container-shape-start-start);
            border-start-end-radius: var(--_container-shape-start-end);
            border-end-start-radius: var(--_container-shape-end-start);
            border-end-end-radius: var(--_container-shape-end-end);
            color: var(--_enabled-label-color);
            text-decoration: none;
            user-select: none;
            outline: none;
            z-index: 0;
            transition: color 200ms ${EmphasizedEasing},
                        padding-inline-start 150ms ${EmphasizedEasing},
                        padding-inline-end 150ms ${EmphasizedEasing};
        }

        /* Single-action container (button or anchor) */
        button.container,
        a.container {
            cursor: pointer;
            padding-inline-start: var(--_leading-space);
            padding-inline-end: var(--_trailing-space);
            gap: var(--_icon-label-space);
        }

        button.container.has-leading,
        a.container.has-leading {
            padding-inline-start: var(--_with-leading-icon-leading-space);
        }

        button.container.has-avatar,
        a.container.has-avatar {
            padding-inline-start: var(--_with-avatar-leading-space);
        }

        button.container.has-trailing,
        a.container.has-trailing {
            padding-inline-end: var(--_with-trailing-icon-trailing-space);
        }

        /* Split container for removable input chips (primary-action + trailing-action) */
        div.container.has-trailing-action {
            padding-inline-end: var(--_with-trailing-icon-trailing-space);
            gap: var(--_icon-label-space);
        }

        .primary-action,
        .primary-content {
            all: unset;
            position: relative;
            box-sizing: border-box;
            display: inline-flex;
            align-items: center;
            height: 100%;
            min-width: 0;
            gap: var(--_icon-label-space);
            padding-inline-start: var(--_leading-space);
            color: inherit;
            text-decoration: none;
            outline: none;
            transition: padding-inline-start 150ms ${EmphasizedEasing};
        }

        .primary-action {
            cursor: pointer;
        }

        .primary-content {
            cursor: default;
        }

        .container.has-leading .primary-action,
        .container.has-leading .primary-content {
            padding-inline-start: var(--_with-leading-icon-leading-space);
        }

        .container.has-avatar .primary-action,
        .container.has-avatar .primary-content {
            padding-inline-start: var(--_with-avatar-leading-space);
        }

        /* Surface layers */
        .background {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background-color: var(--_enabled-container-color);
            pointer-events: none;
            z-index: -1;
            transition: background-color 200ms ${EmphasizedEasing},
                        opacity 200ms ${EmphasizedEasing};
        }

        .outline {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            box-sizing: border-box;
            border: var(--_outline-width) solid var(--_enabled-outline-color);
            pointer-events: none;
            z-index: -1;
            transition: border-color 200ms ${EmphasizedEasing},
                        opacity 200ms ${EmphasizedEasing};
        }

        /* Hover / focus / press surface states */
        .container:not(.disabled):not(.soft-disabled):hover {
            color: var(--_hovered-label-color);
        }
        .container:not(.disabled):not(.soft-disabled):hover .background {
            background-color: var(--_hovered-container-color);
        }
        .container:not(.disabled):not(.soft-disabled):hover .outline {
            border-color: var(--_hovered-outline-color);
        }

        .container:not(.disabled):not(.soft-disabled):focus-within {
            color: var(--_focused-label-color);
        }
        .container:not(.disabled):not(.soft-disabled):focus-within .background {
            background-color: var(--_focused-container-color);
        }
        .container:not(.disabled):not(.soft-disabled):focus-within .outline {
            border-color: var(--_focused-outline-color);
        }

        .container:not(.disabled):not(.soft-disabled):active {
            color: var(--_pressed-label-color);
        }
        .container:not(.disabled):not(.soft-disabled):active .background {
            background-color: var(--_pressed-container-color);
        }
        .container:not(.disabled):not(.soft-disabled):active .outline {
            border-color: var(--_pressed-outline-color);
        }

        /* Elevated surface (Assist / Filter / Suggestion) */
        .container.elevated:not(.selected) .background {
            background-color: var(--_enabled-container-color-elevated);
        }
        .container.elevated:not(.selected) .outline {
            border-color: var(--_enabled-outline-color-elevated);
        }
        .container.elevated:not(.selected):not(.disabled):not(.soft-disabled):hover .background {
            background-color: var(--_hovered-container-color-elevated);
        }
        .container.elevated:not(.selected):not(.disabled):not(.soft-disabled):focus-within .background {
            background-color: var(--_focused-container-color-elevated);
        }
        .container.elevated:not(.selected):not(.disabled):not(.soft-disabled):active .background {
            background-color: var(--_pressed-container-color-elevated);
        }

        /* Selected state (Filter / Input) */
        .container.selected {
            color: var(--_enabled-label-color-selected);
        }
        .container.selected .background {
            background-color: var(--_enabled-container-color-selected);
        }
        .container.selected .outline {
            border-color: var(--_enabled-outline-color-selected);
        }

        .container.selected:not(.disabled):not(.soft-disabled):hover {
            color: var(--_hovered-label-color-selected);
        }
        .container.selected:not(.disabled):not(.soft-disabled):hover .background {
            background-color: var(--_hovered-container-color-selected);
        }
        .container.selected:not(.disabled):not(.soft-disabled):hover .outline {
            border-color: var(--_hovered-outline-color-selected);
        }

        .container.selected:not(.disabled):not(.soft-disabled):focus-within {
            color: var(--_focused-label-color-selected);
        }
        .container.selected:not(.disabled):not(.soft-disabled):focus-within .background {
            background-color: var(--_focused-container-color-selected);
        }
        .container.selected:not(.disabled):not(.soft-disabled):focus-within .outline {
            border-color: var(--_focused-outline-color-selected);
        }

        .container.selected:not(.disabled):not(.soft-disabled):active {
            color: var(--_pressed-label-color-selected);
        }
        .container.selected:not(.disabled):not(.soft-disabled):active .background {
            background-color: var(--_pressed-container-color-selected);
        }
        .container.selected:not(.disabled):not(.soft-disabled):active .outline {
            border-color: var(--_pressed-outline-color-selected);
        }

        /* Disabled & soft-disabled states */
        .container:is(.disabled, .soft-disabled),
        .container:is(.disabled, .soft-disabled) .primary-action,
        .container:is(.disabled, .soft-disabled) .trailing-action {
            cursor: default;
        }

        .container.disabled .primary-action,
        .container.disabled .trailing-action {
            pointer-events: none;
        }

        .container:is(.disabled, .soft-disabled) .background {
            background-color: var(--_disabled-container-color);
        }
        .container:is(.disabled, .soft-disabled) .outline {
            border-color: var(--_disabled-outline-color);
            opacity: var(--_disabled-outline-opacity);
        }

        .container.elevated:is(.disabled, .soft-disabled) .background {
            background-color: var(--_disabled-container-color-elevated);
            opacity: var(--_disabled-container-opacity);
        }
        .container.elevated:is(.disabled, .soft-disabled) .outline {
            border-color: transparent;
        }

        .container.selected:is(.disabled, .soft-disabled) .background {
            background-color: var(--_disabled-container-color-selected);
            opacity: var(--_disabled-container-opacity);
        }
        .container.selected:is(.disabled, .soft-disabled) .outline {
            border-color: var(--_disabled-outline-color-selected);
        }

        /* Label */
        .label {
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: var(--_enabled-label-font);
            font-size: var(--_enabled-label-size);
            font-weight: var(--_enabled-label-weight);
            letter-spacing: var(--_enabled-label-tracking);
            line-height: var(--_enabled-label-leading);
        }

        .container:not(.has-label) .label {
            display: none;
        }

        .container:is(.disabled, .soft-disabled) .label {
            color: var(--_disabled-label-color);
            opacity: var(--_disabled-label-opacity);
        }

        .container.selected:is(.disabled, .soft-disabled) .label {
            color: var(--_disabled-label-color-selected);
        }

        /* Leading region */
        .leading {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
        }

        .container:not(.has-leading):not(.has-avatar) .leading {
            display: none;
        }

        .container.filter.deselecting:not(.has-icon):not(.hide-checkmark):not(.has-avatar) .leading {
            display: inline-flex;
        }

        /* Leading icon */
        .icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: var(--_icon-size);
            height: var(--_icon-size);
            color: var(--_enabled-icon-color);
            overflow: hidden;
            ${IconSizeStyles};
        }

        .icon ::slotted(*) {
            width: var(--_icon-size);
            height: var(--_icon-size);
            font-size: var(--_icon-size);
            flex-shrink: 0;
            object-fit: cover;
        }

        .icon ::slotted(img) {
            border-radius: 50%;
        }

        /* Hide icon when avatar mode is active or filter checkmark replaces icon */
        .container:not(.has-icon) .icon,
        .container.has-avatar .icon,
        .container.filter.selected:not(.hide-checkmark) .icon {
            display: none;
        }

        .container:not(.disabled):not(.soft-disabled):hover .icon {
            color: var(--_hovered-icon-color);
        }
        .container:not(.disabled):not(.soft-disabled):focus-within .icon {
            color: var(--_focused-icon-color);
        }
        .container:not(.disabled):not(.soft-disabled):active .icon {
            color: var(--_pressed-icon-color);
        }
        .container.selected .icon {
            color: var(--_enabled-icon-color-selected);
        }
        .container.selected:not(.disabled):not(.soft-disabled):hover .icon {
            color: var(--_hovered-icon-color-selected);
        }
        .container.selected:not(.disabled):not(.soft-disabled):focus-within .icon {
            color: var(--_focused-icon-color-selected);
        }
        .container.selected:not(.disabled):not(.soft-disabled):active .icon {
            color: var(--_pressed-icon-color-selected);
        }
        .container:is(.disabled, .soft-disabled) .icon {
            color: var(--_disabled-icon-color);
            opacity: var(--_disabled-icon-opacity);
        }

        /* Avatar (24dp circular graphic for input chips) */
        .avatar {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: var(--_avatar-size);
            height: var(--_avatar-size);
            border-start-start-radius: var(--_avatar-shape-start-start);
            border-start-end-radius: var(--_avatar-shape-start-end);
            border-end-start-radius: var(--_avatar-shape-end-start);
            border-end-end-radius: var(--_avatar-shape-end-end);
            background-color: var(--_enabled-avatar-container-color);
            color: var(--_enabled-avatar-label-color);
            font-family: var(--_enabled-label-font);
            font-size: 12px;
            font-weight: 500;
            line-height: 1;
            overflow: hidden;
            ${AvatarIconSizeStyles};
        }

        .container:not(.has-avatar) .avatar {
            display: none;
        }

        .avatar ::slotted(img),
        .avatar ::slotted(svg) {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .avatar-checkmark {
            position: absolute;
            inset: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: inherit;
            background-color: var(--_enabled-avatar-container-color-selected);
            color: var(--_enabled-avatar-checkmark-color);
            opacity: 0;
            transform: scale(0.8);
            pointer-events: none;
            transition: opacity 150ms ${EmphasizedEasing},
                        transform 150ms ${EmphasizedEasing};
        }

        .container:not(.input.has-avatar) .avatar-checkmark {
            display: none;
        }

        .container.input.selected.has-avatar .avatar-checkmark {
            opacity: 1;
            transform: scale(1);
        }

        .avatar-checkmark-svg {
            width: 16px;
            height: 16px;
            stroke: currentColor;
            stroke-width: 2.2;
            fill: none;
        }

        .container:is(.disabled, .soft-disabled) .avatar {
            opacity: var(--_disabled-icon-opacity);
        }

        /* Filter checkmark */
        .checkmark {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: var(--_icon-size);
            height: var(--_icon-size);
            color: var(--_enabled-checkmark-color-selected);
            overflow: hidden;
            ${IconSizeStyles};
        }

        .checkmark ::slotted(*) {
            width: var(--_icon-size);
            height: var(--_icon-size);
            font-size: var(--_icon-size);
        }

        .container:not(.filter) .checkmark,
        .container.filter:not(.selected) .checkmark,
        .container.filter.hide-checkmark .checkmark {
            display: none;
        }

        .container.filter.deselecting:not(.has-icon):not(.hide-checkmark) .checkmark {
            display: inline-flex;
        }

        .checkmark-svg {
            width: var(--_icon-size);
            height: var(--_icon-size);
        }

        .checkmark-path {
            stroke: currentColor;
            stroke-dasharray: ${CheckmarkLength};
            stroke-dashoffset: 0;
            stroke-width: 2px;
            fill: none;
        }

        .container.selecting:not(.has-icon):not(.hide-checkmark) .leading {
            animation: chip-checkmark-expand 150ms ${EmphasizedEasing} forwards;
        }

        .container.deselecting:not(.has-icon):not(.hide-checkmark) .leading {
            animation: chip-checkmark-collapse 150ms ${EmphasizedEasing} forwards;
        }

        .container.selecting .checkmark-path {
            stroke-dashoffset: ${CheckmarkLength};
            animation: chip-checkmark-draw-in 150ms 75ms ${EmphasizedEasing} forwards;
        }

        .container:is(.disabled, .soft-disabled) .checkmark {
            color: var(--_disabled-checkmark-color);
            opacity: var(--_disabled-icon-opacity);
        }

        /* Static trailing icon (filter / assist / suggestion or input with no-remove) */
        .static-trailing-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: var(--_trailing-icon-size);
            height: var(--_trailing-icon-size);
            color: var(--_enabled-trailing-icon-color);
            ${IconSizeStyles};
        }

        .static-trailing-icon ::slotted(*) {
            width: var(--_trailing-icon-size);
            height: var(--_trailing-icon-size);
            font-size: var(--_trailing-icon-size);
        }

        .container:not(.has-trailing) .static-trailing-icon {
            display: none;
        }

        .container.selected .static-trailing-icon {
            color: var(--_enabled-trailing-icon-color-selected);
        }

        .container:is(.disabled, .soft-disabled) .static-trailing-icon {
            color: var(--_disabled-trailing-icon-color);
            opacity: var(--_disabled-icon-opacity);
        }

        /* Interactive trailing remove button (input variant) */
        .trailing-action {
            all: unset;
            position: relative;
            box-sizing: border-box;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: var(--_trailing-action-size);
            height: var(--_trailing-action-size);
            margin-inline: -3px;
            border-radius: 50%;
            color: var(--_enabled-trailing-icon-color);
            cursor: pointer;
            z-index: 1;
            outline: none;
        }

        .container.selected .trailing-action {
            color: var(--_enabled-trailing-icon-color-selected);
        }

        .container:not(.disabled):not(.soft-disabled) .trailing-action:hover {
            color: var(--_hovered-trailing-icon-color);
        }
        .container.selected:not(.disabled):not(.soft-disabled) .trailing-action:hover {
            color: var(--_hovered-trailing-icon-color-selected);
        }

        .container:not(.disabled):not(.soft-disabled) .trailing-action:focus-visible {
            color: var(--_focused-trailing-icon-color);
        }
        .container.selected:not(.disabled):not(.soft-disabled) .trailing-action:focus-visible {
            color: var(--_focused-trailing-icon-color-selected);
        }

        .container:not(.disabled):not(.soft-disabled) .trailing-action:active {
            color: var(--_pressed-trailing-icon-color);
        }
        .container.selected:not(.disabled):not(.soft-disabled) .trailing-action:active {
            color: var(--_pressed-trailing-icon-color-selected);
        }

        .container:is(.disabled, .soft-disabled) .trailing-action {
            color: var(--_disabled-trailing-icon-color);
            opacity: var(--_disabled-icon-opacity);
        }

        .trailing-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: var(--_trailing-icon-size);
            height: var(--_trailing-icon-size);
            ${IconSizeStyles};
        }

        .trailing-icon ::slotted(*) {
            width: var(--_trailing-icon-size);
            height: var(--_trailing-icon-size);
            font-size: var(--_trailing-icon-size);
        }

        /* 48dp minimum touch targets */
        .touch-target {
            position: absolute;
            top: 50%;
            left: 50%;
            height: var(--_min-touch-target-size);
            width: 100%;
            transform: translate(-50%, -50%);
            z-index: 0;
        }

        .trailing-touch-target {
            position: absolute;
            top: 50%;
            left: 50%;
            height: var(--_min-touch-target-size);
            width: max(36px, 100%);
            transform: translate(-50%, -50%);
            z-index: 0;
        }

        @keyframes chip-checkmark-expand {
            from {
                width: 0;
                margin-inline-end: calc(-1 * var(--_icon-label-space));
            }
            to {
                width: var(--_icon-size);
                margin-inline-end: 0;
            }
        }

        @keyframes chip-checkmark-collapse {
            from {
                width: var(--_icon-size);
                margin-inline-end: 0;
                opacity: 1;
            }
            to {
                width: 0;
                margin-inline-end: calc(-1 * var(--_icon-label-space));
                opacity: 0;
            }
        }

        @keyframes chip-checkmark-draw-in {
            from {
                stroke-dashoffset: ${CheckmarkLength};
            }
            to {
                stroke-dashoffset: 0;
            }
        }
    }

    @layer mdc.chip.motion {
        @media (prefers-reduced-motion: reduce) {
            .container,
            .primary-action,
            .primary-content,
            .background,
            .outline,
            .avatar-checkmark,
            .container mdc-elevation {
                transition: none;
            }
            .container.selecting .leading,
            .container.deselecting .leading,
            .container.selecting .checkmark-path {
                animation: none;
            }
        }
    }

    @layer mdc.chip.contrast {
        @media (prefers-contrast: more) {
            .container:not(.selected):not(.disabled):not(.soft-disabled) .outline {
                border-color: CanvasText;
            }
        }

        @media (prefers-contrast: less) {
            .container:not(.selected):not(.disabled):not(.soft-disabled) .outline {
                opacity: 0.7;
            }
        }
    }

    @layer mdc.chip.transparency {
        @media (prefers-reduced-transparency: reduce) {
            .container:is(.disabled, .soft-disabled) .label,
            .container:is(.disabled, .soft-disabled) .icon,
            .container:is(.disabled, .soft-disabled) .checkmark,
            .container:is(.disabled, .soft-disabled) .static-trailing-icon,
            .container:is(.disabled, .soft-disabled) .trailing-action,
            .container:is(.disabled, .soft-disabled) .avatar {
                opacity: 1;
                color: color-mix(in srgb, var(--_disabled-label-color) 65%, Canvas);
            }
        }
    }

    @layer mdc.chip.hcm {
        @media (forced-colors: active) {
            .container .outline {
                border-color: CanvasText;
                opacity: 1;
            }
            .container.selected .background {
                background-color: Highlight;
            }
            .container.selected {
                color: HighlightText;
            }
            .container.selected .outline {
                border-color: Highlight;
            }
            .container.selected .checkmark,
            .container.selected .icon,
            .container.selected .static-trailing-icon,
            .container.selected .trailing-action {
                color: HighlightText;
            }
            .container:is(.disabled, .soft-disabled) {
                color: GrayText;
            }
            .container:is(.disabled, .soft-disabled) .outline {
                border-color: GrayText;
                opacity: 1;
            }
            .container:is(.disabled, .soft-disabled) .label,
            .container:is(.disabled, .soft-disabled) .icon,
            .container:is(.disabled, .soft-disabled) .checkmark,
            .container:is(.disabled, .soft-disabled) .static-trailing-icon,
            .container:is(.disabled, .soft-disabled) .trailing-action {
                color: GrayText;
                opacity: 1;
            }
        }
    }
`
