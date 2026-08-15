/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Styles for `mdc-tab`.
 *
 * Three variants consume the same `--_*` internal tokens, redefined per
 * variant via `defineTokenRefsRecord`:
 * - `primary`   : MD3 primary tab — full-width cell, 3dp bottom indicator,
 *                 icon stacked above label.
 * - `secondary` : MD3 secondary tab — inline icon + label, 2dp indicator.
 * - `floating`  : MD3E floating tab — pill cell, filled pill indicator.
 *
 * The `.tab` container deliberately has NO `overflow: hidden` so the outward
 * focus ring is not clipped; each absolutely-positioned layer (ripple /
 * indicator) clips itself to the container shape instead.
 */
import { css, unsafeCSS } from 'lit'
import { FloatingTabDefinition, IconDefinition, PrimaryTabDefinition, RippleDefinition, SecondaryTabDefinition } from '../../definitions'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import { overrideComponentTokens, stringTokens } from '../../utils'

const primaryRecord = defineTokenRefsRecord(PrimaryTabDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-tab'
})
const primaryTokens = unsafeCSS(defineVars(primaryRecord, true).join(''))

const secondaryRecord = defineTokenRefsRecord(SecondaryTabDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-tab'
})
const secondaryTokens = unsafeCSS(defineVars(secondaryRecord, true).join(''))

const floatingRecord = defineTokenRefsRecord(FloatingTabDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-tab'
})
const floatingTokens = unsafeCSS(defineVars(floatingRecord, true).join(''))

// Wire the tab's state-layer tokens into the ripple, so the ripple draws the
// MD3 hover / focus / press state layer with the tab's colors & opacities.
const overrideRipple = {
    unselected: stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>(
        '--mdc-ripple',
        {
            'enabled-hovered-color'  : 'var(--_hovered-state-layer-color-unselected)',
            'enabled-hovered-opacity': 'var(--_hovered-state-layer-opacity-unselected)',
            'enabled-focused-color'  : 'var(--_focused-state-layer-color-unselected)',
            'enabled-focused-opacity': 'var(--_focused-state-layer-opacity-unselected)',
            'enabled-pressed-color'  : 'var(--_pressed-state-layer-color-unselected)',
            'enabled-pressed-opacity': 'var(--_pressed-state-layer-opacity-unselected)',
        }
    )),
    selected: stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>(
        '--mdc-ripple',
        {
            'enabled-hovered-color'  : 'var(--_hovered-state-layer-color-selected)',
            'enabled-hovered-opacity': 'var(--_hovered-state-layer-opacity-selected)',
            'enabled-focused-color'  : 'var(--_focused-state-layer-color-selected)',
            'enabled-focused-opacity': 'var(--_focused-state-layer-opacity-selected)',
            'enabled-pressed-color'  : 'var(--_pressed-state-layer-color-selected)',
            'enabled-pressed-opacity': 'var(--_pressed-state-layer-opacity-selected)',
        }
    )),
}

// Sized icons (e.g. `mdc-icon`) fill the tab's icon slot.
const overrideIcon = stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', {
    'enabled-size': 'var(--_icon-size)',
}))

export const TabStyles = [
    // ── Variant token blocks ────────────────────────────────────────────────
    css`
    :host([variant="primary"]) {
        ${primaryTokens};
    }
    :host([variant="secondary"]) {
        ${secondaryTokens};
    }
    :host([variant="floating"]) {
        ${floatingTokens};
    }
    `,
    // ── Shared host / container ─────────────────────────────────────────────
    css`
    :host {
        display: inline-flex;
        position: relative;
        box-sizing: border-box;
        vertical-align: top;
        flex: 0 1 auto;
        height: var(--_container-height);
        max-width: 360px;
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        outline: none;
        z-index: 0;
    }

    .tab {
        position: relative;
        z-index: 0;
        box-sizing: border-box;
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        border-start-start-radius: var(--_container-shape-start-start);
        border-start-end-radius: var(--_container-shape-start-end);
        border-end-start-radius: var(--_container-shape-end-start);
        border-end-end-radius: var(--_container-shape-end-end);
        background-color: var(--_enabled-container-color);
        box-shadow: var(--_enabled-container-elevation);
    }

    :host([variant="primary"]) {
        flex: 1 1 auto;
        min-width: 90px;
    }
    :host([has-icon]:not([icon-only])) {
        height: var(--_with-icon-and-label-text-container-height);
    }

    :host([icon-only]) .label {
        display: none;
    }
    `,
    // ── Content (icon + label) ──────────────────────────────────────────────
    css`
    .content {
        position: relative;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 0;
        max-width: 100%;
        padding-inline-start: var(--_container-inline-leading-space);
        padding-inline-end: var(--_container-inline-trailing-space);
    }

    /* MD3 primary: icon above label when both are present. */
    :host([variant="primary"]) .content {
        flex-direction: column;
        gap: var(--_spacing-between-icon-and-label);
    }

    /* MD3 secondary / MD3E floating: inline icon + label. */
    :host([variant="secondary"]) .content,
    :host([variant="floating"]) .content {
        flex-direction: row;
        gap: var(--_spacing-between-icon-and-label);
    }
    `,
    // ── Icon ────────────────────────────────────────────────────────────────
    css`
    .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        flex: none;
        width: var(--_icon-size);
        height: var(--_icon-size);
        color: var(--_enabled-icon-color-unselected);
        ${unsafeCSS(overrideIcon)};
        pointer-events: none;
    }
    :host(:hover:not([active])) .icon {
        color: var(--_hovered-icon-color);
    }
    :host(:focus-visible:not([active])) .icon {
        color: var(--_focused-icon-color);
    }
    :host(:active:not([active])) .icon {
        color: var(--_pressed-icon-color);
    }
    :host([active]) .icon {
        color: var(--_enabled-icon-color-selected);
    }
    `,
    // ── Label ───────────────────────────────────────────────────────────────
    css`
    .label {
        display: inline-block;
        box-sizing: border-box;
        min-width: 0;
        max-width: 100%;
        font-family: var(--_label-font);
        font-size: var(--_label-size);
        line-height: var(--_label-line-height);
        font-weight: var(--_label-weight);
        letter-spacing: var(--_label-tracking);
        color: var(--_enabled-label-color-unselected);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        pointer-events: none;
    }
    :host(:hover:not([active])) .label {
        color: var(--_hovered-label-color);
    }
    :host(:focus-visible:not([active])) .label {
        color: var(--_focused-label-color);
    }
    :host(:active:not([active])) .label {
        color: var(--_pressed-label-color);
    }
    :host([active]) .label {
        color: var(--_enabled-label-color-selected);
    }
    `,
    // ── Active indicator ────────────────────────────────────────────────────
    css`
    .indicator {
        position: absolute;
        box-sizing: border-box;
        background-color: var(--_enabled-active-indicator-color);
        border-start-start-radius: var(--_active-indicator-shape-start-start);
        border-start-end-radius: var(--_active-indicator-shape-start-end);
        border-end-start-radius: var(--_active-indicator-shape-end-start);
        border-end-end-radius: var(--_active-indicator-shape-end-end);
        transform-origin: center;
        z-index: -1;
        pointer-events: none;
    }
    :host(:not([active])) .indicator {
        opacity: 0;
    }

    /* Primary & secondary: a bar flush to the block-end edge. */
    :host([variant="primary"]) .indicator,
    :host([variant="secondary"]) .indicator {
        inset-inline-start: var(--_active-indicator-inline-leading-space);
        inset-inline-end: var(--_active-indicator-inline-trailing-space);
        inset-block-end: var(--_active-indicator-block-trailing-space);
        height: var(--_active-indicator-height);
    }

    /* MD3E floating: a filled pill inset by the container inline padding. */
    :host([variant="floating"]) .indicator {
        inset-block-start: var(--_active-indicator-block-leading-space);
        inset-block-end: var(--_active-indicator-block-trailing-space);
        inset-inline-start: var(--_active-indicator-inline-leading-space);
        inset-inline-end: var(--_active-indicator-inline-trailing-space);
    }
    `,
]
