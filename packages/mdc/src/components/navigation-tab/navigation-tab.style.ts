import { stringifyTokens, overrideComponentTokens, stringTokens } from '../../utils/style'
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import type { IconDefinition } from '../icon/icon.definition'
import type { RippleDefinition } from '../ripple/ripple.definition'
import { NavigationBarHorizontalTabDefinition, NavigationBarVerticalTabDefinition, NavigationBarXRVerticalTabDefinition, NavigationDrawerTabDefinition, NavigationRailHorizontalTabDefinition, NavigationRailRoundTabDefinition, NavigationRailVerticalTabDefinition, NavigationRailXRRoundTabDefinition, NavigationRailXRVerticalTabDefinition } from './navigation-tab.definition'

const barVS = stringifyTokens('--mdc-navigation-tab')(NavigationBarVerticalTabDefinition)
const barHS = stringifyTokens('--mdc-navigation-tab')(NavigationBarHorizontalTabDefinition)
const barXRVS = stringifyTokens('--mdc-navigation-tab')(NavigationBarXRVerticalTabDefinition)
const railVS = stringifyTokens('--mdc-navigation-tab')(NavigationRailVerticalTabDefinition)
const railHS = stringifyTokens('--mdc-navigation-tab')(NavigationRailHorizontalTabDefinition)
const railRS = stringifyTokens('--mdc-navigation-tab')(NavigationRailRoundTabDefinition)
const railXRVS = stringifyTokens('--mdc-navigation-tab')(NavigationRailXRVerticalTabDefinition)
const railXRRS = stringifyTokens('--mdc-navigation-tab')(NavigationRailXRRoundTabDefinition)
const drawerS = stringifyTokens('--mdc-navigation-tab')(NavigationDrawerTabDefinition)

const tabIndicatorGrowEasing = Easing.ExpressiveDefaultSpatial.ToCSSVariable()

const overrideRipple = {
    unselected: stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>(
        '--mdc-ripple',
        {
            "enabled-hovered-color": "var(--_hovered-unselected-state-layer-color)",
            "enabled-hovered-opacity": "var(--_hovered-unselected-state-layer-opacity)",
            "enabled-focused-color": "var(--_focused-unselected-state-layer-color)",
            "enabled-focused-opacity": "var(--_focused-unselected-state-layer-opacity)",
            "enabled-pressed-color": "var(--_pressed-unselected-state-layer-color)",
            "enabled-pressed-opacity": "var(--_pressed-unselected-state-layer-opacity)",
        }
    )),
    selected: stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>(
        '--mdc-ripple',
        {
            "enabled-hovered-color": "var(--_hovered-selected-state-layer-color)",
            "enabled-hovered-opacity": "var(--_hovered-selected-state-layer-opacity)",
            "enabled-focused-color": "var(--_focused-selected-state-layer-color)",
            "enabled-focused-opacity": "var(--_focused-selected-state-layer-opacity)",
            "enabled-pressed-color": "var(--_pressed-selected-state-layer-color)",
            "enabled-pressed-opacity": "var(--_pressed-selected-state-layer-opacity)",
        }
    )),
}
const overrideIcon = (value: string = 'var(--_enabled-icon-size)') => stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', {
    "enabled-size": value,
}))


export const NavigationTabStyles = [
    css`
    :host([variant="bar-vertical"]) {
        ${barVS};
    }
    :host([variant="bar-horizontal"]) {
        ${barHS};
    }
    :host([variant="bar-xr-vertical"]) {
        ${barXRVS};
    }
    :host([variant="rail-vertical"]) {
        ${railVS};
    }
    :host([variant="rail-horizontal"]) {
        ${railHS};
    }
    :host([variant="rail-round"]) {
        ${railRS};
    }
    :host([variant="rail-xr-vertical"]) {
        ${railXRVS};
    }
    :host([variant="rail-xr-round"]) {
        ${railXRRS};
    }
    :host([variant="drawer"]),
    :host([variant="drawer-horizontal"]) {
        ${drawerS};
    }
    `,
    // Disabled
    css`
        :host([checked]):has(.container.disabled) .icon {
            color: var(--_disabled-selected-icon-color);
        }
        :host(:not([checked])):has(.container.disabled) .icon {
            color: var(--_disabled-unselected-icon-color);
        }
        :host([checked]):has(.container.disabled) .indicator {
            background: var(--_disabled-selected-indicator-color);
        }
        :host(:not([checked])):has(.container.disabled) .indicator {
            background: var(--_disabled-unselected-indicator-color);
        }
            :host([checked]):has(.container.disabled) .label {
            color: var(--_disabled-selected-label-color);
        }
        :host(:not([checked])):has(.container.disabled) .label {
            color: var(--_disabled-unselected-label-color);
        }
    `,
    // Shared Layout
    css`
    :host {
        flex-grow: 0;
        flex-shrink: 0;
        vertical-align: top;
        position: relative;
        box-sizing: border-box;
        display: inline-flex;
        width: fit-content;
        height: fit-content;
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        z-index: 0;
    }

    .container {
        all: unset;
        color-scheme: inherit;
        position: relative;
        box-sizing: border-box;
        z-index: 0;
        text-decoration: none;
        color: inherit;
    }

    .indicator {
        display: flex;
        z-index: -1;
        overflow: clip;
        transform-origin: center;
        transition-property: opacity, background, transform;
        transition-duration: 400ms;
        transition-timing-function: ${unsafeCSS(tabIndicatorGrowEasing)};
    }

    .label {
        justify-self: center;
        z-index: 0;
        pointer-events: none;
        user-select: none;
    }

    .icon {
        fill: currentColor;
        display: grid;
        align-items: center;
        z-index: 0;
        transition-property: opacity, color;
        transition-duration: 200ms;
        pointer-events: none;
        user-select: none;
    }

    .icon:is(.default-icon, .active-icon, .inactive-icon) {
        opacity: 0;
    }

    :host(:not([checked])) .container.has-inactive-icon .icon.inactive-icon {
        opacity: 1;
    }
    :host(:not([checked])) .container:not(.has-inactive-icon) .icon.default-icon {
        opacity: 1;
    }

    :host([checked]) .container.has-active-icon .icon.active-icon {
        opacity: 1;
    }
    :host([checked]) .container:not(.has-active-icon) .icon.default-icon {
        opacity: 1;
    }
    `,
    // For Vertical Layout (RailVertical, RailXRVertical, BarVertical, BarXRVertical are compatible.)
    css`
    :host([variant="rail-vertical"]) {
        width: var(--_enabled-container-width);
        min-height: var(--_enabled-container-height);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        box-sizing: border-box;
    }

    :host([variant="rail-vertical"]) .container,
    :host([variant="rail-xr-vertical"]) .container,
    :host([variant="bar-vertical"]) .container,
    :host([variant="bar-xr-vertical"]) .container {
        position: relative;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: var(--_enabled-indicator-height) min(var(--_enabled-unselected-label-line-height), var(--_enabled-unselected-label-size));
        gap: var(--_enabled-spacing-between-icon-and-label);
        place-self: center;
        place-content: center;
        justify-items: center;
        align-items: center;
    }
    :host([variant="rail-vertical"]) .indicator,
    :host([variant="rail-xr-vertical"]) .indicator,
    :host([variant="bar-vertical"]) .indicator,
    :host([variant="bar-xr-vertical"]) .indicator {
        position: relative;
        place-self: center;
        grid-column: 1/2;
        grid-row: 1/2;
        width: var(--_enabled-indicator-width);
        height: var(--_enabled-indicator-height);
    }
    :host([variant="rail-vertical"]) .container .icon-container,
    :host([variant="rail-xr-vertical"]) .container .icon-container,
    :host([variant="bar-vertical"]) .container .icon-container,
    :host([variant="bar-xr-vertical"]) .container .icon-container {
        position: relative;
        grid-column: 1/2;
        grid-row: 1/2;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        place-content: center;
        place-self: center;
        width: var(--_enabled-indicator-width);
        height: var(--_enabled-indicator-height);
        z-index: 1;
    }

    :host([variant="rail-vertical"]) .container .icon-container .icon,
    :host([variant="rail-xr-vertical"]) .container .icon-container .icon,
    :host([variant="bar-vertical"]) .container .icon-container .icon,
    :host([variant="bar-xr-vertical"]) .container .icon-container .icon {
        align-self: center;
        justify-self: center;
        grid-column: 1/2;
        grid-row: 1/2;
    }

    :host([variant="rail-vertical"]) .container .label.out-icon-container,
    :host([variant="rail-xr-vertical"]) .container .label.out-icon-container,
    :host([variant="bar-vertical"]) .container .label.out-icon-container,
    :host([variant="bar-xr-vertical"]) .container .label.out-icon-container {
        grid-column: 1/2;
        grid-row: 2/3;
    }

    :host([variant="rail-vertical"]) .container .label.in-icon-container,
    :host([variant="rail-xr-vertical"]) .container .label.in-icon-container,
    :host([variant="bar-vertical"]) .container .label.in-icon-container,
    :host([variant="bar-xr-vertical"]) .container .label.in-icon-container {
        display: none;
    }
    `,
    // For Horizontal Rail
    css`
    :host([variant="rail-horizontal"]) {
        width: 100%;
        max-width: var(--_enabled-container-width);
        height: var(--_enabled-container-height);
        display: flex;
        position: relative;
        box-sizing: border-box;
    }

    :host([variant="rail-horizontal"]) .container {
        all: unset;
        color-scheme: inherit;
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        position: relative;
        border-radius: var(--_enabled-indicator-shape-start-start);
        padding-inline-start: var(--_enabled-icon-container-padding-inline-start);
        padding-inline-end: var(--_enabled-icon-container-padding-inline-end);
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        z-index: 0;
    }

    :host([variant="rail-horizontal"]) .indicator {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        z-index: -1;
        pointer-events: none;
        transform-origin: center;
        transition-property: opacity, background-color, transform;
        transition-duration: 200ms;
        transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
    }
    :host([variant="rail-horizontal"]:not([checked])) .indicator {
        opacity: 0;
        transform: scaleX(0.92);
        background-color: var(--_enabled-unselected-indicator-color);
    }
    :host([variant="rail-horizontal"][checked]) .indicator {
        opacity: 1;
        transform: scaleX(1);
        background-color: var(--_enabled-selected-indicator-color);
    }

    :host([variant="rail-horizontal"]) .ripple-layer {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        overflow: hidden;
    }

    :host([variant="rail-horizontal"]) .icon-container {
        display: inline-grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        width: var(--_enabled-icon-size);
        height: var(--_enabled-icon-size);
        flex-shrink: 0;
        align-items: center;
        justify-items: center;
        margin-inline-end: var(--_enabled-spacing-between-icon-and-label);
        z-index: 1;
        padding: 0;
        box-sizing: border-box;
    }

    :host([variant="rail-horizontal"]) .icon {
        grid-column: 1/2;
        grid-row: 1/2;
        width: var(--_enabled-icon-size);
        height: var(--_enabled-icon-size);
        display: flex;
        align-items: center;
        justify-content: center;
        place-content: center;
    }

    :host([variant="rail-horizontal"]) .label.in-icon-container {
        display: none;
    }

    :host([variant="rail-horizontal"]) .label.out-icon-container {
        display: block;
        flex: 1;
        text-align: start;
        justify-self: start;
        z-index: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: var(--_enabled-unselected-label-font);
        font-size: var(--_enabled-unselected-label-size);
        font-weight: var(--_enabled-unselected-label-weight);
        line-height: var(--_enabled-unselected-label-line-height);
        letter-spacing: var(--_enabled-unselected-label-tracking);
    }

    :host([variant="rail-horizontal"]) .badge-container {
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
        margin-inline-start: auto;
        padding-inline-end: 4px;
        flex-shrink: 0;
    }

    // For Horizontal Bar
    :host([variant="bar-horizontal"]) .container {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        box-sizing: border-box;
        align-items: center;
        justify-content: center;
        position: relative;
    }
    :host([variant="bar-horizontal"]) .container .icon-container {
        grid-column: 1/2;
        grid-row: 1/2;
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: 1fr;
        align-items: center;
        justify-content: center;
        gap: var(--_enabled-spacing-between-icon-and-label);
        box-sizing: border-box;
        position: relative;
    }
    :host([variant="bar-horizontal"]) .indicator {
        grid-column: 1/2;
        grid-row: 1/2;
        position: absolute;
        inset: 0;
        margin: auto;
        display: flex;
        width: 100%;
        min-width: var(--_enabled-indicator-width);
        z-index: -1;
    }
    :host([variant="bar-horizontal"]) .label.in-icon-container {
        grid-column: 2/3;
        grid-row: 1/-1;
        box-sizing: border-box;
    }
    :host([variant="bar-horizontal"]) .label.out-icon-container {
        display: none;
    }
    :host([variant="bar-horizontal"]) .icon {
        place-content: center;
        grid-column: 1/2;
        grid-row: 1/-1;
    }
    `,
    // For Drawer & Drawer Horizontal (MD3 Navigation Drawer destination items)
    css`
    :host([variant="drawer"]),
    :host([variant="drawer-horizontal"]) {
        width: 100%;
        max-width: var(--_enabled-container-width);
        height: var(--_enabled-container-height);
        display: flex;
        position: relative;
        box-sizing: border-box;
    }

    :host([variant="drawer"]) .container,
    :host([variant="drawer-horizontal"]) .container {
        all: unset;
        color-scheme: inherit;
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        position: relative;
        border-radius: var(--_enabled-indicator-shape-start-start);
        padding-inline-start: var(--_enabled-icon-container-padding-inline-start);
        padding-inline-end: var(--_enabled-icon-container-padding-inline-end);
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
    }

    :host([variant="drawer"]) .indicator,
    :host([variant="drawer-horizontal"]) .indicator {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        z-index: -1;
        pointer-events: none;
        transform-origin: center;
        transition-property: opacity, background-color, transform;
        transition-duration: 200ms;
        transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
    }
    :host([variant="drawer"]:not([checked])) .indicator,
    :host([variant="drawer-horizontal"]:not([checked])) .indicator {
        opacity: 0;
        transform: scaleX(0.92);
        background-color: var(--_enabled-unselected-indicator-color);
    }
    :host([variant="drawer"][checked]) .indicator,
    :host([variant="drawer-horizontal"][checked]) .indicator {
        opacity: 1;
        transform: scaleX(1);
        background-color: var(--_enabled-selected-indicator-color);
    }

    :host([variant="drawer"]) .ripple-layer,
    :host([variant="drawer-horizontal"]) .ripple-layer {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        overflow: hidden;
    }

    :host([variant="drawer"]) .icon-container,
    :host([variant="drawer-horizontal"]) .icon-container {
        display: inline-grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        width: var(--_enabled-icon-size);
        height: var(--_enabled-icon-size);
        flex-shrink: 0;
        align-items: center;
        justify-items: center;
        margin-inline-end: var(--_enabled-spacing-between-icon-and-label);
        z-index: 1;
        padding: 0;
        box-sizing: border-box;
    }

    :host([variant="drawer"]) .icon,
    :host([variant="drawer-horizontal"]) .icon {
        grid-column: 1/2;
        grid-row: 1/2;
        width: var(--_enabled-icon-size);
        height: var(--_enabled-icon-size);
        display: flex;
        align-items: center;
        justify-content: center;
        place-content: center;
    }

    :host([variant="drawer"]) .label.in-icon-container,
    :host([variant="drawer-horizontal"]) .label.in-icon-container {
        display: none;
    }

    :host([variant="drawer"]) .label.out-icon-container,
    :host([variant="drawer-horizontal"]) .label.out-icon-container {
        display: block;
        flex: 1;
        text-align: start;
        justify-self: start;
        z-index: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: var(--_enabled-unselected-label-font);
        font-size: var(--_enabled-unselected-label-size);
        font-weight: var(--_enabled-unselected-label-weight);
        line-height: var(--_enabled-unselected-label-line-height);
        letter-spacing: var(--_enabled-unselected-label-tracking);
    }

    :host([variant="drawer"]) .badge-container,
    :host([variant="drawer-horizontal"]) .badge-container {
        margin-inline-start: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
        flex-shrink: 0;
    }

    :host([variant="drawer"]) .badge-label,
    :host([variant="drawer-horizontal"]) .badge-label {
        font-family: var(--_enabled-large-badge-label-font);
        font-size: var(--_enabled-large-badge-label-size);
        font-weight: var(--_enabled-large-badge-label-weight);
        line-height: var(--_enabled-large-badge-label-line-height);
        letter-spacing: var(--_enabled-large-badge-label-tracking);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    :host([variant="drawer"]:not([checked])) .badge-label,
    :host([variant="drawer-horizontal"]:not([checked])) .badge-label {
        color: var(--_enabled-unselected-label-color);
    }
    :host([variant="drawer"][checked]) .badge-label,
    :host([variant="drawer-horizontal"][checked]) .badge-label {
        color: var(--_enabled-selected-label-color);
    }

    :host([variant="drawer"]) mdc-focus-ring,
    :host([variant="drawer-horizontal"]) mdc-focus-ring {
        --mdc-focus-ring-shape-start-start: var(--_enabled-indicator-shape-start-start);
        --mdc-focus-ring-shape-start-end: var(--_enabled-indicator-shape-start-end);
        --mdc-focus-ring-shape-end-end: var(--_enabled-indicator-shape-end-end);
        --mdc-focus-ring-shape-end-start: var(--_enabled-indicator-shape-end-start);
        border-radius: var(--_enabled-indicator-shape-start-start);
    }
    `,
    // For Round
    css`
    :host([variant="rail-xr-round"]) .container,
    :host([variant="rail-round"]) .container {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        place-content: center;
        position: relative;
        box-sizing: border-box;
    }
    :host([variant="rail-xr-round"]) .container .icon-container,
    :host([variant="rail-round"]) .container .icon-container {
        gap: var(--_enabled-spacing-between-icon-and-label);
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        align-items: center;
        justify-content: center;
        place-content: center;
        box-sizing: border-box;
        position: relative;
        grid-column: 1/2;
        grid-row: 1/2;
    }
    :host([variant="rail-xr-round"]) .icon,
    :host([variant="rail-round"]) .icon {
        place-content: center;
        grid-column: 1/2;
        grid-row: 1/-1;
    }
    :host([variant="rail-xr-round"]) .indicator,
    :host([variant="rail-round"]) .indicator {
        grid-column: 1/2;
        grid-row: 1/2;
        place-self: center;
        width: var(--_enabled-indicator-width);
    }

    :host([variant="rail-xr-round"]) .label,
    :host([variant="rail-round"]) .label {
        display: none;
    }
    `,
    // Container
    css`
    .container {
        padding-block-start: var(--_enabled-container-padding-block-start);
        padding-block-end: var(--_enabled-container-padding-block-end);
        padding-inline-start: var(--_enabled-container-padding-inline-start);
        padding-inline-end: var(--_enabled-container-padding-inline-end);
        height: var(--_enabled-container-height);
        min-width: var(--_enabled-container-width);
    }

    `,
    // Ripple
    css`
        :host(:not([checked])) {
            ${overrideRipple.unselected};
        }
        :host([checked]) {
            ${overrideRipple.selected};
        }
        .ripple-layer {
            position: absolute;
            inset: 0;
            border-start-start-radius: var(--_enabled-indicator-shape-start-start);
            border-start-end-radius: var(--_enabled-indicator-shape-start-end);
            border-end-start-radius: var(--_enabled-indicator-shape-end-start);
            border-end-end-radius: var(--_enabled-indicator-shape-end-end);
        }
    `,
    // FocusRing
    css`
    mdc-focus-ring {
        --mdc-focus-ring-shape-start-start: var(--_enabled-indicator-shape-start-start);
        --mdc-focus-ring-shape-start-end: var(--_enabled-indicator-shape-start-end);
        --mdc-focus-ring-shape-end-end: var(--_enabled-indicator-shape-end-end);
        --mdc-focus-ring-shape-end-start: var(--_enabled-indicator-shape-end-start);
    }
    `,
    // Icon & IconContainer
    css`
    :host(:not([checked])) .icon {
        ${overrideIcon()};
        size: var(--_enabled-icon-size);
        color: var(--_enabled-unselected-icon-color);
    }
    :host([checked]) .icon {
        ${overrideIcon()};
        size: var(--_enabled-icon-size);
        color: var(--_enabled-selected-icon-color);
    }

    .icon-container {
        border-start-start-radius: var(--_enabled-icon-container-shape-start-start);
        border-start-end-radius: var(--_enabled-icon-container-shape-start-end);
        border-end-start-radius: var(--_enabled-icon-container-shape-end-start);
        border-end-end-radius: var(--_enabled-icon-container-shape-end-end);
        padding-inline-start: var(--_enabled-icon-container-padding-inline-start);
        padding-inline-end: var(--_enabled-icon-container-padding-inline-end);
        padding-block-start: var(--_enabled-icon-container-padding-block-start);
        padding-block-end: var(--_enabled-icon-container-padding-block-end);
        height: var(--_enabled-icon-container-height);
        min-width: var(--_enabled-icon-container-width);
    }
    `,
    // Indicator (for vertical and round tabs)
    css`
    :host(:not([variant*="drawer"])) .indicator {
        border-start-start-radius: var(--_enabled-indicator-shape-start-start);
        border-start-end-radius: var(--_enabled-indicator-shape-start-end);
        border-end-start-radius: var(--_enabled-indicator-shape-end-start);
        border-end-end-radius: var(--_enabled-indicator-shape-end-end);
        height: var(--_enabled-indicator-height);
    }
    :host(:not([variant*="drawer"]):not([checked])) .indicator {
        transform: scaleX(0) scaleY(0.8);
        opacity: 0;
        background: var(--_enabled-unselected-indicator-color);
    }
    :host(:not([variant*="drawer"])[checked]) .indicator {
        transform: scaleX(1) scaleY(1);
        opacity: 1;
        background: var(--_enabled-selected-indicator-color);
    }
    `,
    // Badge - Singleton
    css`
    .badge-container {
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
        pointer-events: none;
    }

    .badge-label {
        background: var(--_enabled-badge-color);
        color: var(--_enabled-large-badge-label-color);
        font-family: var(--_enabled-large-badge-label-font);
        font-size: var(--_enabled-large-badge-label-size);
        font-weight: var(--_enabled-large-badge-label-weight);
        line-height: var(--_enabled-large-badge-label-line-height);
        letter-spacing: var(--_enabled-large-badge-label-tracking);
        border-radius: 8px;
        height: 16px;
        min-width: 16px;
        padding-inline: 4px;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
    }

    :host([badge=""]) .badge-label,
    .badge-label:empty {
        width: 6px;
        min-width: 6px;
        height: 6px;
        padding-inline: 0;
        border-radius: 50%;
    }

    :host([variant="rail-vertical"]) .badge-container,
    :host([variant="rail-xr-vertical"]) .badge-container,
    :host([variant="rail-round"]) .badge-container,
    :host([variant="rail-xr-round"]) .badge-container,
    :host([variant="bar-vertical"]) .badge-container,
    :host([variant="bar-xr-vertical"]) .badge-container {
        position: absolute;
        top: 6px;
        inset-inline-start: calc(50% + 6px);
    }

    :host([variant="rail-horizontal"]) .badge-container,
    :host([variant="bar-horizontal"]) .badge-container,
    :host([variant="drawer"]) .badge-container,
    :host([variant="drawer-horizontal"]) .badge-container {
        margin-inline-start: auto;
        padding-inline-end: 12px;
        flex-shrink: 0;
    }
    `,
    // Label - Singleton
    css`
    .label {
        font-family: var(--_enabled-unselected-label-font);
        font-size: var(--_enabled-unselected-label-size);
        font-weight: var(--_enabled-unselected-label-weight);
        line-height: var(--_enabled-unselected-label-line-height);
        letter-spacing: var(--_enabled-unselected-label-tracking);
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
    }
    :host(:not([checked])) .label {
        color: var(--_enabled-unselected-label-color);
    }
    :host([checked]) .label {
        color: var(--_enabled-selected-label-color);
    }
`]
