/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Duration, Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { NavigationBarTabDefinition, NavigationBarXRTabDefinition, NavigationRailTabDefinition, NavigationRailXRTabDefinition } from '../../component-definitions/navigation-tab.definition'
import type { IconDefinition } from '../../definitions'
import { createWrappedTokens, overrideComponentTokens, stringTokens } from '../../utils'

const barTokens = createWrappedTokens('--mdc-navigation-bar-tab', NavigationBarTabDefinition)
const barTokenString = stringTokens(barTokens)
const barXRTokens = createWrappedTokens('--mdc-navigation-bar-xr-tab', NavigationBarXRTabDefinition)
const barXRTokenString = stringTokens(barXRTokens)

const railTokens = createWrappedTokens('--mdc-navigation-rail-tab', NavigationRailTabDefinition)
const railTokenString = stringTokens(railTokens)

const railXRTokens = createWrappedTokens('--mdc-navigation-rail-xr-tab', NavigationRailXRTabDefinition)
const railXRTokenString = stringTokens(railXRTokens)

const indicatorMotion = {
    easing: unsafeCSS(Easing.ExpressiveFastSpatial),
    duration: unsafeCSS(Duration.ExpressiveFastSpatial),
}

const labelIconShared = css`
    .label,
    .icon {
        z-index: 1;
    }

    .badge {
        z-index: 1;
    }
    .icon {
        display: none;
        fill: currentColor;
        block-size: var(--_icon-size);
        inline-size: var(--_icon-size);
        ${stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: `var(--_icon-size)` }))};
    }

    button.vertical.inactive .label {
        font-size: var(--_inactive-vertical-label-size);
        line-height: var(--_inactive-vertical-label-line-height);
        font-family: var(--_inactive-vertical-label-font);
        letter-spacing: var(--_inactive-vertical-label-trackig);
        font-weight: var(--_inactive-vertical-label-font-weight);
    }
    button.vertical.active .label {
        font-size: var(--_active-vertical-label-size);
        line-height: var(--_active-vertical-label-line-height);
        font-family: var(--_active-vertical-label-font);
        letter-spacing: var(--_active-vertical-label-trackig);
        font-weight: var(--_active-vertical-label-font-weight);
    }
    button.horizonal.inactive .label {
        font-size: var(--_inactive-horizonal-label-size);
        line-height: var(--_inactive-horizonal-label-line-height);
        font-family: var(--_inactive-horizonal-label-font);
        letter-spacing: var(--_inactive-horizonal-label-trackig);
        font-weight: var(--_inactive-horizonal-label-font-weight);
    }
    button.horizonal.active .label {
        font-size: var(--_active-horizonal-label-size);
        line-height: var(--_active-horizonal-label-line-height);
        font-family: var(--_active-horizonal-label-font);
        letter-spacing: var(--_active-horizonal-label-trackig);
        font-weight: var(--_active-horizonal-label-font-weight);
    }

    button.inactive .icon.inactive-icon {
        display: block;
    }
    button.active .icon.active-icon {
        display: block;
    }

    .icon.inactive-icon {
        color: var(--_inactive-icon-color);
    }
    button:hover .icon.inactive-icon {
        color: var(--_hovered-inactive-icon-color);
    }
    button:focus-within .icon.inactive-icon {
        color: var(--_focused-inactive-icon-color);
    }
    button:active .icon.inactive-icon {
        color: var(--_pressed-inactive-icon-color);
    }
    .icon.active-icon {
        color: var(--_active-icon-color);
    }
    button:hover .icon.active-icon {
        color: var(--_hovered-active-icon-color);
    }
    button:focus-within .icon.active-icon {
        color: var(--_focused-active-icon-color);
    }
    button:active .icon.active-icon {
        color: var(--_pressed-active-icon-color);
    }

    .inactive .label {
        color: var(--_inactive-label-color);
    }
    button.inactive:hover .label {
        color: var(--_hovered-inactive-label-color);
    }
    button.inactive:focus-within .label {
        color: var(--_focused-inactive-label-color);
    }
    button.inactive:active .label {
        color: var(--_pressed-inactive-label-color);
    }
    .active .label {
        color: var(--_active-label-color);
    }
    button.active:hover .label {
        color: var(--_hovered-active-label-color);
    }
    button.active:focus-within .label {
        color: var(--_focused-active-label-color);
    }
    button.active:active .label {
        color: var(--_pressed-active-label-color);
    }
`

const indicatorShared = css`
    mdc-ripple {
        z-index: -1;
        transition-property: opacity;
        transition-duration: 250ms;
    }
    button.active mdc-ripple {
        opacity: 0;
    }
    button .indicator {
        position: absolute;
        display: flex;
        inset: 0;
        z-index: -1;
    }
    button .indicator .background {
        position: absolute;
        display: flex;
        inset: 0;
        z-index: -1;
        transition-property: transform, background;
        transition-duration: ${indicatorMotion.duration};
        transition-timing-function: ${indicatorMotion.easing};
    }

    button.vertical :is(.indicator, .indicator .background) {
        border-start-start-radius: var(--_vertical-indicator-shape-start-start);
        border-start-end-radius: var(--_vertical-indicator-shape-start-end);
        border-end-start-radius: var(--_vertical-indicator-shape-end-start);
        border-end-end-radius: var(--_vertical-indicator-shape-end-end);
    }
    button.horizonal :is(.indicator, .indicator .background) {
        border-start-start-radius: var(--_horizonal-indicator-shape-start-start);
        border-start-end-radius: var(--_horizonal-indicator-shape-start-end);
        border-end-start-radius: var(--_horizonal-indicator-shape-end-start);
        border-end-end-radius: var(--_horizonal-indicator-shape-end-end);
    }

    button.vertical .indicator .background,
    button.vertical .indicator {
        height: var(--_vertical-indicator-height);
        width: var(--_vertical-indicator-width);
    }
    button.horizonal .indicator .background,
    button.horizonal .indicator {
        height: var(--_horizonal-indicator-height);
        width: var(--_horizonal-indicator-width);
    }

    button.round .indicator .background,
    button.round .indicator {
        height: var(--_vertical-round-indicator-height);
        width: var(--_vertical-round-indicator-width);
    }

    button.inactive .indicator .background {
        background: var(--_inactive-indicator-color);
        transform: scaleX(0);
    }
    button.active .indicator .background {
        background: var(--_active-indicator-color);
        transform: scaleX(1);
    }
`

const containerShared = css`
    :host {
        display: inline-flex;
        vertical-align: top;
        outline: none;
        border: none;
        cursor: pointer;
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
        width: fit-content;
        height: fit-content;
        background: transparent;
    }

    button {
        all: unset;
        position: relative;
        background: transparent;
        box-sizing: border-box;
    }

    button.vertical {
        border-start-start-radius: var(--_vertical-container-shape-start-start);
        border-start-end-radius: var(--_vertical-container-shape-start-end);
        border-end-start-radius: var(--_vertical-container-shape-end-start);
        border-end-end-radius: var(--_vertical-container-shape-end-end);
    }
    button.horizonal {
        border-start-start-radius: var(--_horizonal-container-shape-start-start);
        border-start-end-radius: var(--_horizonal-container-shape-start-end);
        border-end-start-radius: var(--_horizonal-container-shape-end-start);
        border-end-end-radius: var(--_horizonal-container-shape-end-end);
    }

    button.vertical {
        height: var(--_vertical-container-height);
        width: var(--_vertical-container-width);
        padding-inline-start: var(--_vertical-container-inline-leading-space);
        padding-inline-end: var(--_vertical-container-inline-trailing-space);
        padding-block-start: var(--_vertical-container-block-leading-space);
        padding-block-end: var(--_vertical-container-block-trailing-space);
        gap: var(--_vertical-icon-label-between-space);
    }
    button.horizonal {
        height: var(--_horizonal-container-height);
        width: var(--_horizonal-container-width);
        padding-inline-start: var(--_horizonal-container-inline-leading-space);
        padding-inline-end: var(--_horizonal-container-inline-trailing-space);
        padding-block-start: var(--_horizonal-container-block-leading-space);
        padding-block-end: var(--_horizonal-container-block-trailing-space);
        gap: var(--_horizonal-icon-label-between-space);
    }
`

export const navigationBarTabStyle = [
    labelIconShared,
    indicatorShared,
    containerShared,
    css`
        :host(:not(xr)) { ${barTokenString}; }
        :host([xr]) { ${barXRTokenString}; }

    /* SPEC */
    button.vertical {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: var(--_vertical-indicator-height) 1fr;
        
        .indicator {
            grid-column: 1/3;
            grid-row: 1/2;
            justify-self: center;
        }
        .label {
            grid-column: 1/2;
            grid-row: 2/3;
            justify-self: center;
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
        }
        .icon {
            grid-column: 1/2;
            grid-row: 1/2;
            place-self: center;
            align-self: center;
        }
    }
    button.horizonal {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: 1fr;
        justify-content: center;

        box-sizing: border-box;
        
        .indicator {
            grid-column: 1/-1;
            grid-row: 1/2;
        }
        .label {
            grid-column: 2/3;
            grid-row: 1/2;
            justify-self: center;
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            place-self: center;
            padding-inline-end: var(--_horizonal-indicator-inline-trailing-space);
        }
        .icon {
            grid-column: 1/2;
            grid-row: 1/2;
            place-self: center;
            padding-inline-start: var(--_horizonal-indicator-inline-leading-space);
        }
    }
`]

export const navigationRailTabStyle = [
    labelIconShared,
    indicatorShared,
    containerShared,
    css`
        :host(:not(xr)) { ${railTokenString}; }
        :host([xr]) { ${railXRTokenString}; }
        button.round {
            height: var(--_vertical-round-container-size);
            width: var(--_vertical-round-container-size);
            display: grid;
            place-content: center;
        }
        button.round .label {
            display: none;
        }

        button.vertical:not(.round) {
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: var(--_vertical-indicator-height) 1fr;
            
            .indicator {
                grid-column: 1/3;
                grid-row: 1/2;
                justify-self: center;
            }
            .label {
                grid-column: 1/2;
                grid-row: 2/3;
                justify-self: center;
                overflow: hidden;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 1;
            }
            .icon {
                grid-column: 1/2;
                grid-row: 1/2;
                place-self: center;
                align-self: center;
            }
        }
        button.horizonal:not(.round) {
            display: grid;
            grid-template-columns: auto 1fr;
            grid-template-rows: 1fr;
            justify-content: center;

            box-sizing: border-box;
            
            .indicator {
                grid-column: 1/-1;
                grid-row: 1/2;
            }
            .label {
                grid-column: 2/3;
                grid-row: 1/2;
                justify-self: center;
                overflow: hidden;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 1;
                place-self: center;
                padding-inline-end: var(--_horizonal-indicator-inline-trailing-space);
            }
            .icon {
                grid-column: 1/2;
                grid-row: 1/2;
                place-self: center;
                padding-inline-start: var(--_horizonal-indicator-inline-leading-space);
            }
        }
    `
]
