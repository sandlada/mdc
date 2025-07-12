/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import type { FocusRingDefinition } from '../../component-definitions/focus-ring.definition'
import type { IconDefinition } from '../../component-definitions/icon.definition'
import type { RippleDefinition } from '../../component-definitions/ripple.definition'
import { SwitchDefinition } from '../../component-definitions/switch.definition'
import { createWrappedTokens, overrideComponentTokens, stringTokens } from '../../utils/tokens'

const switchTokens = createWrappedTokens('--mdc-switch', SwitchDefinition)
const switchTokenString = stringTokens(switchTokens)

const focusRingShape = stringTokens(overrideComponentTokens<keyof typeof FocusRingDefinition>('--mdc-focus-ring', {
    "shape-end-end": `var(--_track-shape-end-end)`,
    "shape-end-start": `var(--_track-shape-end-start)`,
    "shape-start-end": `var(--_track-shape-start-end)`,
    "shape-start-start": `var(--_track-shape-start-start)`,
}))
const rippleStyles = (state: 'selected' | 'unselected') => stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', {
    "hovered-color": `var(--_hovered-state-layer-color-${state})`,
    "hovered-opacity": `var(--_hovered-state-layer-opacity-${state})`,
    "pressed-color": `var(--_pressed-state-layer-color-${state})`,
    "pressed-opacity": `var(--_pressed-state-layer-opacity-${state})`,
}))

const handleContainerEasing = unsafeCSS(Easing.ExpressiveFastSpatial)
const handleEasing = unsafeCSS(Easing.Standard)


export const SwitchStyles = css`
    @layer mdc.switch.variable {
        :host { ${switchTokenString}; }
    }

    @layer mdc.switch.composite.focus-ring {
        mdc-focus-ring { ${focusRingShape}; }
    }

    @layer mdc.switch.composite.ripple {
        mdc-ripple {
            inset: unset;
            height: var(--_state-layer-size);
            width: var(--_state-layer-size);
            border-end-end-radius: var(--_state-layer-shape-end-end);
            border-end-start-radius: var(--_state-layer-shape-end-start);
            border-start-end-radius: var(--_state-layer-shape-start-end);
            border-start-start-radius: var(--_state-layer-shape-start-start);
        }

        .selected mdc-ripple {
            ${rippleStyles('selected')};
        }
        .unselected mdc-ripple {
            ${rippleStyles('unselected')};
        }
    }

    @layer mdc.switch.base {
        :host {
            display: inline-flex;
            vertical-align: top;
            outline: none;
            border: none;
            cursor: pointer;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }
        :host([disabled]) {
            cursor: default;
        }


        .switch {
            all: unset;
            display: inline-flex;
            align-items: center;
            flex-shrink: 0;
            flex-grow: 0;
            position: relative;
            height: var(--_track-height);
            width: var(--_track-width);
            border-end-end-radius: var(--_track-shape-end-end);
            border-end-start-radius: var(--_track-shape-end-start);
            border-start-end-radius: var(--_track-shape-start-end);
            border-start-start-radius: var(--_track-shape-start-start);
        }

        .input {
            all: unset;
            appearance: none;
            outline: none;
            border: none;
            margin: 0;
            padding: 0;
            cursor: inherit;
            height: max(100%, var(--_state-layer-size));
            width: max(100%, var(--_state-layer-size));
            z-index: 1;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        ::slotted([slot="icon-selected"]),
        ::slotted([slot="icon-unselected"]) {
            display: inline-flex;
            position: relative;
            writing-mode: horizontal-tb;
            fill: currentColor;
            flex-shrink: 0;
        }

        .icon,
        ::slotted([slot="icon-selected"]),
        ::slotted([slot="icon-unselected"]) {
            fill: currentColor;
        }
    }

    @layer mdc.switch.composite.icon {
        .selected .icon.icon-unselected {
            display: none;
        }
        .unselected .icon.icon-selected {
            display: none;
        }

        .icon.icon-selected {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--_icon-size-selected);
            inline-size: var(--_icon-size-selected);
            block-size: var(--_icon-size-selected);
            ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: `var(--_icon-size-selected)` })))}
        }
        .icon.icon-unselected {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--_icon-size-unselected);
            inline-size: var(--_icon-size-unselected);
            block-size: var(--_icon-size-unselected);
            ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: `var(--_icon-size-unselected)` })))}
        }

        .disabled .icon.icon-selected {
            color: var(--_icon-color-selected);
            opacity: var(--_icon-opacity-selected);
        }
        .disabled .icon.icon-unselected {
            color: var(--_icon-color-unselected);
            opacity: var(--_icon-opacity-unselected);
        }

        .switch:not(.disabled) .icon.icon-selected {
            color: var(--_icon-color-selected);
        }
        .switch:not(.disabled):hover .icon.icon-selected {
            color: var(--_hovered-icon-color-selected);
        }
        .switch:not(.disabled):focus-within .icon.icon-selected {
            color: var(--_focused-icon-color-selected);
        }
        .switch:not(.disabled):active .icon.icon-selected {
            color: var(--_pressed-icon-color-selected);
        }
        .switch:not(.disabled) .icon.icon-unselected {
            color: var(--_icon-color-unselected);
        }
        .switch:not(.disabled):hover .icon.icon-unselected {
            color: var(--_hovered-icon-color-unselected);
        }
        .switch:not(.disabled):focus-within .icon.icon-unselected {
            color: var(--_focused-icon-color-unselected);
        }
        .switch:not(.disabled):active .icon.icon-unselected {
            color: var(--_pressed-icon-color-unselected);
        }
    }

    @layer mdc.switch.base.track {
        .track {
            position: absolute;
            inset: 0px;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            border-radius: inherit;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: -1;
        }

        .disabled .track {
            opacity: var(--_disabled-track-opacity)
        }

        .selected:not(.disabled) .track {
            background: var(--_track-color-selected);
        }
        .selected.disabled .track {
            background: var(--_disabled-track-color-selected);
        }
        .selected:not(.disabled):hover .track {
            background: var(--_hovered-track-color-selected);
        }
        .selected:not(.disabled):focus-within .track {
            background: var(--_focused-track-color-selected);
        }
        .selected:not(.disabled):active .track {
            background: var(--_pressed-track-color-selected);
        }
        .unselected:not(.disabled) .track {
            background: var(--_track-color-unselected);
        }
        .unselected.disabled .track {
            background: var(--_disabled-track-color-unselected);
        }
        .unselected:not(.disabled):hover .track {
            background: var(--_hovered-track-color-unselected);
        }
        .unselected:not(.disabled):focus-within .track {
            background: var(--_focused-track-color-unselected);
        }
        .unselected:not(.disabled):active .track {
            background: var(--_pressed-track-color-unselected);
        }

    }

    @layer mdc.switch.base.outline {
        .outline {
            position: absolute;
            inset: 0px;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            border-radius: inherit;
            display: flex;
            border-width: var(--_track-outline-width);
            border-style: solid;
            z-index: 0;
            pointer-events: none;
        }
        .unselected.disabled .outline {
            border-color: var(--_disabled-track-outline-color-unselected);
            opacity: var(--_disabled-track-opacity);
        }
        .selected .outline {
            border-color: transparent;
        }
        .unselected:not(.disabled) .outline {
            border-color: var(--_track-outline-color);
        }
        .unselected:not(.disabled):hover .outline {
            border-color: var(--_hovered-track-outline-color-unselected);
        }
        .unselected:not(.disabled):focus-within .outline {
            border-color: var(--_focused-track-outline-color-unselected);
        }
        .unselected:not(.disabled):active .outline {
            border-color: var(--_pressed-track-outline-color-unselected);
        }
    }

    @layer mdc.switch.base.handle {
        .handle-container {
            display: flex;
            place-content: center;
            place-items: center;
            position: relative;
            height: 100%;
            width: 100%;
            transition: margin 350ms ${handleContainerEasing};
        }
        .disabled .handle-container {
            transition: none;
        }

        .selected .handle-container {
            margin-inline-start: calc(var(--_track-width) - var(--_track-height));
        }
        .unselected .handle-container {
            margin-inline-end: calc(var(--_track-width) - var(--_track-height));
        }

        .handle {
            border-start-start-radius: var(--_handle-shape-start-start);
            border-start-end-radius: var(--_handle-shape-start-end);
            border-end-end-radius: var(--_handle-shape-end-end);
            border-end-start-radius: var(--_handle-shape-end-start);
            transform-origin: center;
            transition-property: height, width;
            transition-duration: 250ms, 250ms;
            transition-timing-function: ${handleEasing};
            z-index: 0;
            display: grid;
            place-content: center;
        }

        .unselected.show-unselected-icon .handle,
        .selected .handle {
            height: var(--_handle-height-selected);
            width: var(--_handle-width-selected);
        }
        .unselected:not(.show-unselected-icon) .handle {
            height: var(--_handle-height-unselected);
            width: var(--_handle-width-unselected);
        }
        :is(.selected, .unselected):not(.disabled):active .handle {
            height: var(--_pressed-handle-height);
            width: var(--_pressed-handle-width);
        }

        .selected:not(.disabled) .handle {
            background: var(--_handle-color-selected)
        }
        .selected.disabled .handle {
            background: var(--_disabled-handle-color-selected);
            opacity: var(--_disabled-handle-opacity-selected);
        }
        .selected:not(.disabled):hover .handle {
            background: var(--_hovered-handle-color-selected);
        }
        .selected:not(.disabled):focus-within .handle {
            background: var(--_focused-handle-color-selected);
        }
        .selected:not(.disabled):active .handle {
            background: var(--_pressed-handle-color-selected);
        }
        .unselected:not(.disabled) .handle {
            background: var(--_handle-color-unselected);
        }
        .unselected.disabled .handle {
            background: var(--_disabled-handle-color-unselected);
            opacity: var(--_disabled-handle-opacity-unselected);
        }
        .unselected:not(.disabled):hover .handle {
            background: var(--_hovered-handle-color-unselected);
        }
        .unselected:not(.disabled):focus-within .handle {
            background: var(--_focused-handle-color-unselected);
        }
        .unselected:not(.disabled):active .handle {
            background: var(--_pressed-handle-color-unselected);
        }
    }


`
