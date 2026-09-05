/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { SearchBarDefinition } from '../../component-definitions/search.definition'
import type { FocusRingDefinition } from '../../component-definitions/focus-ring.definition'
import type { IconDefinition } from '../../component-definitions/icon.definition'
import type { RippleDefinition } from '../../component-definitions/ripple.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import { overrideComponentTokens, stringTokens } from '../../utils/tokens'

const tokenRecord = defineTokenRefsRecord(SearchBarDefinition, {
    expandShapes: false,
    useBaseFallback: true,
    prefix: '--mdc-search-bar',
})
const tokenString = unsafeCSS(defineVars(tokenRecord, true).join(''))

const focusRingStyles = stringTokens(overrideComponentTokens<keyof typeof FocusRingDefinition>('--mdc-focus-ring', {
    'shape-start-start': `var(--_enabled-container-shape-start-start)`,
    'shape-start-end': `var(--_enabled-container-shape-start-end)`,
    'shape-end-start': `var(--_enabled-container-shape-end-start)`,
    'shape-end-end': `var(--_enabled-container-shape-end-end)`,
    'enabled-color': `var(--_focused-indicator-color)`,
    'width': `var(--_focused-indicator-thickness)`,
    'outward-offset': `var(--_focused-indicator-offset)`,
    'inward-offset': `var(--_focused-indicator-offset)`,
}))

const avatarFocusRingStyles = stringTokens(overrideComponentTokens<keyof typeof FocusRingDefinition>('--mdc-focus-ring', {
    'shape-start-start': `var(--_enabled-avatar-container-shape-start-start)`,
    'shape-start-end': `var(--_enabled-avatar-container-shape-start-end)`,
    'shape-end-start': `var(--_enabled-avatar-container-shape-end-start)`,
    'shape-end-end': `var(--_enabled-avatar-container-shape-end-end)`,
}))

const rippleStyles = stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', {
    'enabled-hovered-color': `var(--_hovered-state-layer-color)`,
    'enabled-pressed-color': `var(--_pressed-state-layer-color)`,
    'enabled-hovered-opacity': `var(--_hovered-state-layer-opacity)`,
    'enabled-pressed-opacity': `var(--_pressed-state-layer-opacity)`,
}))

const leadingIconTokens = stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', {
    'enabled-size': `var(--_enabled-leading-icon-size)`,
}))

const trailingIconTokens = stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', {
    'enabled-size': `var(--_enabled-trailing-icon-size)`,
}))

export const searchBarStyle = css`
    @layer mdc.search-bar.variable {
        :host {
            ${tokenString};
        }
    }

    @layer mdc.search-bar.composite.focus-ring {
        .search > mdc-focus-ring {
            border-radius: inherit;
            ${unsafeCSS(focusRingStyles)};
        }
        .avatar mdc-focus-ring {
            border-radius: inherit;
            ${unsafeCSS(avatarFocusRingStyles)};
        }
    }

    @layer mdc.search-bar.composite.ripple {
        mdc-ripple {
            border-radius: inherit;
            ${unsafeCSS(rippleStyles)};
        }
    }

    @layer mdc.search-bar.composite.icon {
        .leading-icon {
            ${unsafeCSS(leadingIconTokens)};
        }
        .trailing-icon {
            ${unsafeCSS(trailingIconTokens)};
        }
    }

    @layer mdc.search-bar.base {
        :host {
            display: inline-flex;
            vertical-align: top;
            width: 100%;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
            background: transparent;
        }

        .search {
            position: relative;
            z-index: 0;
            display: flex;
            align-items: center;
            width: 100%;
            box-sizing: border-box;
            height: var(--_enabled-container-height);
            padding-inline-start: var(--_enabled-container-padding-inline-start);
            padding-inline-end: var(--_enabled-container-padding-inline-end);
            padding-block-start: var(--_enabled-container-padding-block-start);
            padding-block-end: var(--_enabled-container-padding-block-end);
            margin-inline-start: var(--_enabled-container-margin-inline-start);
            margin-inline-end: var(--_enabled-container-margin-inline-end);
            margin-block-start: var(--_enabled-container-margin-block-start);
            margin-block-end: var(--_enabled-container-margin-block-end);
            gap: var(--_enabled-container-items-gap);
            border-start-start-radius: var(--_enabled-container-shape-start-start);
            border-start-end-radius: var(--_enabled-container-shape-start-end);
            border-end-start-radius: var(--_enabled-container-shape-end-start);
            border-end-end-radius: var(--_enabled-container-shape-end-end);
            background: transparent;
        }

        .background {
            position: absolute;
            border-radius: inherit;
            inset: 0;
            z-index: -1;
            background-color: var(--_enabled-container-color);
        }

        .icon {
            fill: currentColor;
        }

        .leading-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: var(--_enabled-leading-icon-color);
            fill: currentColor;
        }

        .trailing-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: var(--_enabled-trailing-icon-color);
            fill: currentColor;
            gap: var(--_enabled-container-items-gap);
        }

        .search:not(.has-leading-icon) .leading-icon {
            display: none;
        }

        .search:not(.has-trailing-icon) .trailing-icon {
            display: none;
        }

        .input {
            all: unset;
            flex: 1 1 auto;
            min-width: 0;
            height: 100%;
            width: 100%;
            box-sizing: border-box;
            color: var(--_enabled-input-text-color);
            font-family: var(--_enabled-input-text-font);
            line-height: var(--_enabled-input-text-line-height);
            font-size: var(--_enabled-input-text-size);
            font-weight: var(--_enabled-input-text-weight);
            letter-spacing: var(--_enabled-input-text-tracking);
            padding-inline-start: var(--_enabled-content-padding-inline-start);
            padding-inline-end: var(--_enabled-content-padding-inline-end);
            padding-block-start: var(--_enabled-content-padding-block-start);
            padding-block-end: var(--_enabled-content-padding-block-end);
        }

        .search.has-leading-icon .input {
            padding-inline-start:  calc(var(--_enabled-content-padding-inline-start) - 16px);
            padding-inline-end:  calc(var(--_enabled-content-padding-inline-end) - 16px);
        }

        .input::placeholder {
            color: var(--_enabled-supporting-text-color);
            font-family: var(--_enabled-supporting-text-font);
            line-height: var(--_enabled-supporting-text-line-height);
            font-size: var(--_enabled-supporting-text-size);
            font-weight: var(--_enabled-supporting-text-weight);
            letter-spacing: var(--_enabled-supporting-text-tracking);
            opacity: 1;
        }

        .input:placeholder-shown,
        .input:-webkit-autofill,
        .input:-webkit-autofill:focus {
            background: transparent;
        }

        .input:-webkit-autofill {
            -webkit-box-shadow: 0 0 0px var(--_enabled-container-height) var(--_enabled-container-color) inset !important;
            -webkit-text-fill-color: var(--_enabled-input-text-color);
        }

        .touch-target {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100%;
            height: 100%;
            min-height: 48px;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: -1;
        }

        .avatar {
            all: unset;
            cursor: pointer;
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            box-sizing: border-box;
            width: var(--_enabled-avatar-container-width);
            height: var(--_enabled-avatar-container-height);
            background-color: var(--_enabled-avatar-container-color);
            color: var(--_enabled-avatar-color);
            border-start-start-radius: var(--_enabled-avatar-container-shape-start-start);
            border-start-end-radius: var(--_enabled-avatar-container-shape-start-end);
            border-end-start-radius: var(--_enabled-avatar-container-shape-end-start);
            border-end-end-radius: var(--_enabled-avatar-container-shape-end-end);
            padding-inline-start: var(--_enabled-avatar-container-padding-inline-start);
            padding-inline-end: var(--_enabled-avatar-container-padding-inline-end);
            padding-block-start: var(--_enabled-avatar-container-padding-block-start);
            padding-block-end: var(--_enabled-avatar-container-padding-block-end);
            margin-inline-start: var(--_enabled-avatar-container-margin-inline-start);
            margin-inline-end: var(--_enabled-avatar-container-margin-inline-end);
            margin-block-start: var(--_enabled-avatar-container-margin-block-start);
            margin-block-end: var(--_enabled-avatar-container-margin-block-end);
            z-index: 0;
        }

        .avatar mdc-ripple {
            border-radius: inherit;
            inset: 0;
            z-index: -1;
        }

        .avatar mdc-focus-ring {
            border-radius: inherit;
            z-index: 1;
        }

        .avatar-icon {
            fill: currentColor;
            color: var(--_enabled-avatar-label-color);
            background: var(--_enabled-avatar-color);
            inline-size: var(--_enabled-avatar-size);
            block-size: var(--_enabled-avatar-size);
            border-start-start-radius: var(--_enabled-avatar-shape-start-start);
            border-start-end-radius: var(--_enabled-avatar-shape-start-end);
            border-end-start-radius: var(--_enabled-avatar-shape-end-start);
            border-end-end-radius: var(--_enabled-avatar-shape-end-end);
        }

        ::slotted([slot='avatar']) {
            border-start-start-radius: var(--_enabled-avatar-container-shape-start-start);
            border-start-end-radius: var(--_enabled-avatar-container-shape-start-end);
            border-end-start-radius: var(--_enabled-avatar-container-shape-end-start);
            border-end-end-radius: var(--_enabled-avatar-container-shape-end-end);
            width: var(--_enabled-avatar-container-width);
            height: var(--_enabled-avatar-container-height);
            object-fit: cover;
        }

        .search.hide-avatar .avatar,
        .search.hide-avatar slot[name='avatar'],
        .search.hide-avatar ::slotted([slot='avatar']) {
            display: none;
        }

        @media (forced-colors: active) {
            .background {
                border: 1px solid CanvasText;
            }
            .avatar {
                border: 1px solid CanvasText;
            }
        }
    }
`
