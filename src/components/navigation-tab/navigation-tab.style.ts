import { css, unsafeCSS } from 'lit'
import { IconDefinition, NavigationBarHorizontalTabDefinition, NavigationBarVerticalTabDefinition, NavigationBarXRVerticalTabDefinition, NavigationRailHorizontalTabDefinition, NavigationRailRoundTabDefinition, NavigationRailVerticalTabDefinition, NavigationRailXRRoundTabDefinition, NavigationRailXRVerticalTabDefinition, RippleDefinition } from '../../definitions'
import { Easing } from '@sandlada/mdk'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import { overrideComponentTokens, stringTokens } from '../../utils'

const barVRecord = defineTokenRefsRecord(NavigationBarVerticalTabDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-navigation-tab'
})
const barVS = unsafeCSS(defineVars(barVRecord, true).join(''))
const barHRecord = defineTokenRefsRecord(NavigationBarHorizontalTabDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-navigation-tab'
})
const barHS = unsafeCSS(defineVars(barHRecord, true).join(''))
const barXRVRecord = defineTokenRefsRecord(NavigationBarXRVerticalTabDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-navigation-tab'
})
const barXRVS = unsafeCSS(defineVars(barXRVRecord, true).join(''))
const railVRecord = defineTokenRefsRecord(NavigationRailVerticalTabDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-navigation-tab'
})
const railVS = unsafeCSS(defineVars(railVRecord, true).join(''))
const railHRecord = defineTokenRefsRecord(NavigationRailHorizontalTabDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-navigation-tab'
})
const railHS = unsafeCSS(defineVars(railHRecord, true).join(''))
const railRRecord = defineTokenRefsRecord(NavigationRailRoundTabDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-navigation-tab'
})
const railRS = unsafeCSS(defineVars(railRRecord, true).join(''))
const railXRVRecord = defineTokenRefsRecord(NavigationRailXRVerticalTabDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-navigation-tab'
})
const railXRVS = unsafeCSS(defineVars(railXRVRecord, true).join(''))
const railXRRRecord = defineTokenRefsRecord(NavigationRailXRRoundTabDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-navigation-tab'
})
const railXRRS = unsafeCSS(defineVars(railXRRRecord, true).join(''))

const tabIndicatorGrowEasing = Easing.ExpressiveDefaultSpatial.ToCSSVariable()

const overrideRipple = {
    unselected: stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>(
        '--mdc-ripple',
        {
            "hovered-color": "var(--_unselected-hovered-ripple-color)",
            "hovered-opacity": "var(--_unselected-hovered-ripple-opacity)",
            "focused-color": "var(--_unselected-focused-ripple-color)",
            "focused-opacity": "var(--_unselected-focused-ripple-opacity)",
            "pressed-color": "var(--_unselected-pressed-ripple-color)",
            "pressed-opacity": "var(--_unselected-pressed-ripple-opacity)",
        }
    )),
    selected: stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>(
        '--mdc-ripple',
        {
            "hovered-color": "var(--_selected-hovered-ripple-color)",
            "hovered-opacity": "var(--_selected-hovered-ripple-opacity)",
            "focused-color": "var(--_selected-focused-ripple-color)",
            "focused-opacity": "var(--_selected-focused-ripple-opacity)",
            "pressed-color": "var(--_selected-pressed-ripple-color)",
            "pressed-opacity": "var(--_selected-pressed-ripple-opacity)",
        }
    )),
}
const overrideIcon = stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', {
    "size": "var(--_icon-size)",
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
    `,
    // Shared Layout
    css`
    :host {
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

    input {
        all: unset;
        position: absolute;
        inset: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
        cursor: pointer;
    }

    .container {
        all: unset;
        position: relative;
        box-sizing: border-box;
        z-index: 0;
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
    :host(:not([checked])) .icon.inactive-icon {
        opacity: 1;
    }
    :host(:not([checked])) .icon.active-icon {
        opacity: 0;
    }
    :host([checked]) .icon.inactive-icon {
        opacity: 0;
    }
    :host([checked]) .icon.active-icon {
        opacity: 1;
    }
    `,
    // For Vertical Layout (RailVertical, RailXRVertical, BarVertical, BarXRVertical are compatible.)
    css`
    :host([variant="rail-vertical"]) .container,
    :host([variant="rail-xr-vertical"]) .container,
    :host([variant="bar-vertical"]) .container,
    :host([variant="bar-xr-vertical"]) .container {
        position: relative;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr auto;
        gap: var(--_spacing-between-icon-and-label);
        place-self: center;
        place-content: center;
    }
    :host([variant="rail-vertical"]) .indicator,
    :host([variant="rail-xr-vertical"]) .indicator,
    :host([variant="bar-vertical"]) .indicator,
    :host([variant="bar-xr-vertical"]) .indicator {
        position: relative;
        place-self: center;
        grid-column: 1/2;
        grid-row: 1/2;
        width: var(--_indicator-width);
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
    // For Horizontal
    css`
    :host([variant="rail-horizontal"]) .container,
    :host([variant="bar-horizontal"]) .container {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        box-sizing: border-box;
        align-items: center;
        justify-content: center;
        position: relative;
    }
    :host([variant="rail-horizontal"]) .container .icon-container,
    :host([variant="bar-horizontal"]) .container .icon-container {
        grid-column: 1/2;
        grid-row: 1/2;
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: 1fr;
        align-items: center;
        justify-content: center;
        gap: var(--_spacing-between-icon-and-label);
        box-sizing: border-box;
        position: relative;
    }
    :host([variant="rail-horizontal"]) .indicator,
    :host([variant="bar-horizontal"]) .indicator {
        grid-column: 1/2;
        grid-row: 1/2;
        position: absolute;
        inset: 0;
        margin: auto;
        display: flex;
        width: 100%;
        min-width: var(--_indicator-width);
        z-index: -1;
    }
    :host([variant="rail-horizontal"]) .label.in-icon-container,
    :host([variant="bar-horizontal"]) .label.in-icon-container {
        grid-column: 2/3;
        grid-row: 1/-1;
        box-sizing: border-box;
    }
    :host([variant="rail-horizontal"]) .label.out-icon-container,
    :host([variant="bar-horizontal"]) .label.out-icon-container {
        display: none;
    }
    :host([variant="rail-horizontal"]) .icon,
    :host([variant="bar-horizontal"]) .icon {
        place-content: center;
        grid-column: 1/2;
        grid-row: 1/-1;
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
        gap: var(--_spacing-between-icon-and-label);
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
        width: var(--_indicator-width);
    }

    :host([variant="rail-xr-round"]) .label,
    :host([variant="rail-round"]) .label {
        display: none;
    }
    `,
    // Container
    css`
    .container {
        padding-block-start: var(--_container-block-leading-space);
        padding-block-end: var(--_container-block-trailing-space);
        padding-inline-start: var(--_container-inline-leading-space);
        padding-inline-end: var(--_container-inline-trailing-space);
        height: var(--_container-height);
        min-width: var(--_container-width);
    }

    `,
    // Ripple
    css`
        :host(:not([checked])) {
            ${unsafeCSS(overrideRipple.unselected)};
        }
        :host([checked]) {
            ${unsafeCSS(overrideRipple.selected)};
        }
        .ripple-layer {
            position: absolute;
            inset: 0;
            /* background:red; */
            border-start-start-radius: var(--_indicator-shape-start-start);
            border-start-end-radius: var(--_indicator-shape-start-end);
            border-end-start-radius: var(--_indicator-shape-end-start);
            border-end-end-radius: var(--_indicator-shape-end-end);
            /* height: var(--_indicator-height); */
        }
    `,
    // FocusRing
    css``,
    // Icon & IconContainer
    css`
    :host(:not([checked])) .icon {
        ${unsafeCSS(overrideIcon)};
        size: var(--_icon-size);
    }
    :host(:not([checked])) .icon.inactive-icon {
        color: var(--_unselected-icon-color);
    }
    :host([checked]) .icon.active-icon {
        color: var(--_selected-icon-color);
    }

    .icon-container {
        border-start-start-radius: var(--_icon-container-shape-start-start);
        border-start-end-radius: var(--_icon-container-shape-start-end);
        border-end-start-radius: var(--_icon-container-shape-end-start);
        border-end-end-radius: var(--_icon-container-shape-end-end);
        padding-inline-start: var(--_icon-container-inline-leading-space);
        padding-inline-end: var(--_icon-container-inline-trailing-space);
        padding-block-start: var(--_icon-container-block-leading-space);
        padding-block-end: var(--_icon-container-block-trailing-space);
        height: var(--_icon-container-height);
        min-width: var(--_icon-container-width);
    }
    `,
    // Indicator
    css`
    .indicator {
        border-start-start-radius: var(--_indicator-shape-start-start);
        border-start-end-radius: var(--_indicator-shape-start-end);
        border-end-start-radius: var(--_indicator-shape-end-start);
        border-end-end-radius: var(--_indicator-shape-end-end);
        height: var(--_indicator-height);
    }
    :host(:not([checked])) .indicator {
        transform: scaleX(0) scaleY(0.8);
        opacity: 0;
        background: var(--_unselected-indicator-color);
    }
    :host([checked]) .indicator {
        transform: scaleX(1) scaleY(1);
        opacity: 1;
        background: var(--_selected-indicator-color);
    }
    `,
    // Badge - Singleton
    css``,
    // Label - Singleton
    css`
    .label {
        font-family: var(--_label-font);
        font-size: var(--_label-size);
        font-weight: var(--_label-weight);
        line-height: var(--_label-line-height);
        letter-spacing: var(--_label-letter-spacing);
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
    }
    :host(:not([checked])) .label {
        color: var(--_unselected-label-color);
    }
    :host([checked]) .label {
        color: var(--_selected-label-color);
    }


`]
