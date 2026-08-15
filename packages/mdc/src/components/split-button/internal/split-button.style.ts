/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import type { ElevationDefinition } from '../../../component-definitions/elevation.definition'
import type { IconDefinition } from '../../../component-definitions/icon.definition'
import type { RippleDefinition } from '../../../component-definitions/ripple.definition'
import {
    ElevatedSplitButtonDefinition,
    FilledSplitButtonDefinition,
    FilledTonalSplitButtonDefinition,
    OutlinedSplitButtonDefinition,
} from '../../../component-definitions/split-button.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import { overrideComponentTokens, stringTokens } from '../../../utils/tokens'

const filledTokenRecord = defineTokenRefsRecord(FilledSplitButtonDefinition, {
    expandShapes: false,
    useBaseFallback: true,
    prefix: '--mdc-split-button',
})
const filledTokenString = unsafeCSS(defineVars(filledTokenRecord, true).join(''))

const filledTonalTokenRecord = defineTokenRefsRecord(FilledTonalSplitButtonDefinition, {
    expandShapes: false,
    useBaseFallback: true,
    prefix: '--mdc-split-button',
})
const filledTonalTokenString = unsafeCSS(defineVars(filledTonalTokenRecord, true).join(''))

const elevatedTokenRecord = defineTokenRefsRecord(ElevatedSplitButtonDefinition, {
    expandShapes: false,
    useBaseFallback: true,
    prefix: '--mdc-split-button',
})
const elevatedTokenString = unsafeCSS(defineVars(elevatedTokenRecord, true).join(''))

const outlinedTokenRecord = defineTokenRefsRecord(OutlinedSplitButtonDefinition, {
    expandShapes: false,
    useBaseFallback: true,
    prefix: '--mdc-split-button',
})
const outlinedTokenString = unsafeCSS(defineVars(outlinedTokenRecord, true).join(''))

type TSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'
type TPart = 'leading-button' | 'trailing-button'

/**
 * One button's four corner radii, clamped to at most a circle so the `Full`
 * (∞) outer corners resolve to a pill and the small inner corners stay small.
 */
const getShape = (s: TSize, part: TPart, suffix: string) => unsafeCSS(`
    border-start-start-radius: min(var(--_${s}-${part}-${suffix}-start-start), calc(var(--_${s}-container-height) / 2));
    border-start-end-radius: min(var(--_${s}-${part}-${suffix}-start-end), calc(var(--_${s}-container-height) / 2));
    border-end-start-radius: min(var(--_${s}-${part}-${suffix}-end-start), calc(var(--_${s}-container-height) / 2));
    border-end-end-radius: min(var(--_${s}-${part}-${suffix}-end-end), calc(var(--_${s}-container-height) / 2));
`)
/**
 * The size class lives on the `.container` (`getRenderClasses`), so each
 * per-size rule is scoped as a descendant selector of a container size.
 * `buttonSuffix` adds `:active` / `.expanded` state to the button.
 */
const getSizedShapes = (part: TPart, suffix: string, buttonSuffix: string = '') => unsafeCSS(`
    &.extra-small .${part}${buttonSuffix} {${getShape('extra-small', part, suffix)};}
    &.small .${part}${buttonSuffix} {${getShape('small', part, suffix)};}
    &.medium .${part}${buttonSuffix} {${getShape('medium', part, suffix)};}
    &.large .${part}${buttonSuffix} {${getShape('large', part, suffix)};}
    &.extra-large .${part}${buttonSuffix} {${getShape('extra-large', part, suffix)};}
`)

/**
 * The two buttons form one pill-shaped control: outer corners are full rounds,
 * the facing inner corners share a small radius. On press the inner corners
 * grow (`pressed` morph); an `expanded` trailing button rounds fully.
 */
const getShapeStyles = () => css`
    .container {${getSizedShapes('leading-button', 'container-shape')};}
    .container {${getSizedShapes('trailing-button', 'container-shape')};}
    .container:not(.disable-morph) {${getSizedShapes('leading-button', 'container-shape-pressed', ':active')};}
    .container:not(.disable-morph) {${getSizedShapes('trailing-button', 'container-shape-pressed', ':active')};}
    .container {${getSizedShapes('trailing-button', 'container-shape-expanded', '.expanded')};}
`

const getContainerSizeStyles = () => css`
    .container.extra-small { height: var(--_extra-small-container-height); gap: var(--_extra-small-between-space); }
    .container.small { height: var(--_small-container-height); gap: var(--_small-between-space); }
    .container.medium { height: var(--_medium-container-height); gap: var(--_medium-between-space); }
    .container.large { height: var(--_large-container-height); gap: var(--_large-between-space); }
    .container.extra-large { height: var(--_extra-large-container-height); gap: var(--_extra-large-between-space); }
`

const getButtonSpacingStyles = () => {
    const perSize = (s: TSize) => unsafeCSS(`
        .container.${s} .leading-button {
            gap: var(--_${s}-between-icon-label-space);
            min-inline-size: var(--_${s}-leading-button-min-width);
            padding-inline-end: var(--_${s}-leading-button-inline-trailing-padding-space);
            padding-inline-start: var(--_${s}-leading-button-inline-leading-padding-space);
        }
        .container.${s} .trailing-button {
            gap: var(--_${s}-between-icon-label-space);
            min-inline-size: var(--_${s}-trailing-button-min-width);
            padding-inline-end: var(--_${s}-trailing-button-inline-trailing-padding-space);
            padding-inline-start: var(--_${s}-trailing-button-inline-leading-padding-space);
        }
    `)
    return css`
        ${perSize('extra-small')}
        ${perSize('small')}
        ${perSize('medium')}
        ${perSize('large')}
        ${perSize('extra-large')}
    `
}

const getLabelStyles = () => {
    const perSize = (s: TSize) => unsafeCSS(`
        .container.${s} :is(.leading-button, .trailing-button) .label {
            font-family: var(--_${s}-label-font);
            font-size: var(--_${s}-label-size);
            font-weight: var(--_${s}-label-weight);
            letter-spacing: var(--_${s}-label-tracking);
            line-height: var(--_${s}-label-line-height);
        }
    `)
    return css`
        ${perSize('extra-small')}
        ${perSize('small')}
        ${perSize('medium')}
        ${perSize('large')}
        ${perSize('extra-large')}
    `
}

/** Leading button icon size, per size. */
const getLeadingIconSizeStyles = () => {
    const perSize = (s: TSize) => unsafeCSS(`
        .container.${s} .leading-button :is(::slotted([slot="icon"]), .icon) {
            block-size: var(--_${s}-leading-icon-size);
            font-size: var(--_${s}-leading-icon-size);
            inline-size: var(--_${s}-leading-icon-size);
            ${stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { 'enabled-size': `var(--_${s}-leading-icon-size)` }))}
        }
    `)
    return css`
        ${perSize('extra-small')}
        ${perSize('small')}
        ${perSize('medium')}
        ${perSize('large')}
        ${perSize('extra-large')}
    `
}

/**
 * Trailing button icon size, plus the optical centering offset for the
 * unselected chevron sitting in the rounded inner corner. The offset is only
 * applied to an icon-only trailing button, and cleared when expanded.
 */
const getTrailingIconSizeStyles = () => {
    const perSize = (s: TSize) => unsafeCSS(`
        .container.${s} .trailing-button :is(::slotted([slot="trailing-icon"]), .icon) {
            block-size: var(--_${s}-trailing-icon-size);
            font-size: var(--_${s}-trailing-icon-size);
            inline-size: var(--_${s}-trailing-icon-size);
            ${stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { 'enabled-size': `var(--_${s}-trailing-icon-size)` }))}
        }
        .container.${s} .trailing-button:not(.has-label):not(.expanded) .icon {
            translate: var(--_${s}-trailing-icon-optical-offset) 0;
        }
    `)
    return css`
        ${perSize('extra-small')}
        ${perSize('small')}
        ${perSize('medium')}
        ${perSize('large')}
        ${perSize('extra-large')}
    `
}

const getOutlineStyles = () => {
    const perSize = (s: TSize) => unsafeCSS(`
        .container.${s} :is(.leading-button, .trailing-button) .outline {
            border-width: var(--_${s}-outline-width);
        }
    `)
    return css`
        ${perSize('extra-small')}
        ${perSize('small')}
        ${perSize('medium')}
        ${perSize('large')}
        ${perSize('extra-large')}
    `
}

/** Touch target — extends the hit area up to the 48px minimum height. */
const getTouchTargetStyles = () => {
    const perSize = (s: TSize) => unsafeCSS(`
        .container.${s} .touch-target {
            margin: max(0px, (48px - var(--_${s}-container-height)) / 2) 0;
        }
    `)
    return css`
        ${perSize('extra-small')}
        ${perSize('small')}
        ${perSize('medium')}
        ${perSize('large')}
        ${perSize('extra-large')}
    `
}

/**
 * Expanded trailing button — every corner rounds fully. For medium and up an
 * icon-only trailing button also collapses to a circle of the container's
 * height; extra-small / small keep their width and read as a fully-rounded
 * pill segment.
 */
const getExpandedStyles = () => css`
    .container.medium .trailing-button.expanded:not(.has-label) {
        inline-size: var(--_medium-container-height);
        padding-inline: 0;
    }
    .container.large .trailing-button.expanded:not(.has-label) {
        inline-size: var(--_large-container-height);
        padding-inline: 0;
    }
    .container.extra-large .trailing-button.expanded:not(.has-label) {
        inline-size: var(--_extra-large-container-height);
        padding-inline: 0;
    }
    .trailing-button.expanded .icon {
        translate: 0;
    }
`

const ripple = css`
    .leading-button mdc-ripple,
    .trailing-button mdc-ripple {
        border-radius: inherit;
        z-index: 0;
        ${stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', {
            'enabled-hovered-color': `var(--_hovered-state-layer-color)`,
            'enabled-focused-color': `var(--_focused-state-layer-color)`,
            'enabled-pressed-color': `var(--_pressed-state-layer-color)`,
            'enabled-hovered-opacity': `var(--_hovered-state-layer-opacity)`,
            'enabled-focused-opacity': `var(--_focused-state-layer-opacity)`,
            'enabled-pressed-opacity': `var(--_pressed-state-layer-opacity)`,
        }))};
    }
`

const elevation = css`
    .leading-button mdc-elevation,
    .trailing-button mdc-elevation {
        transition-duration: 0ms;
        ${stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', {
            'enabled-level': `var(--_enabled-container-elevation)`,
            'enabled-shadow-color': `var(--_enabled-container-shadow-color)`,
        }))};
    }
    .leading-button.disabled mdc-elevation,
    .trailing-button.disabled mdc-elevation {
        ${stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', {
            'enabled-level': `var(--_disabled-container-elevation)`,
            'enabled-shadow-color': `var(--_disabled-container-shadow-color)`,
        }))};
    }
`

const focusRing = css`
    .leading-button mdc-focus-ring,
    .trailing-button mdc-focus-ring {
        z-index: 1;
    }
`

const shared = css`
    :host {
        display: inline-flex;
        outline: none;
        vertical-align: top;
        -webkit-tap-highlight-color: transparent;
    }

    .container {
        box-sizing: border-box;
        display: flex;
        position: relative;
        z-index: 0;
        -webkit-tap-highlight-color: transparent;
    }

    .leading-button,
    .trailing-button {
        all: unset;
        align-items: center;
        box-sizing: border-box;
        cursor: pointer;
        display: flex;
        flex: 0 1 auto;
        font: inherit;
        justify-content: center;
        outline: none;
        position: relative;
        text-overflow: ellipsis;
        text-transform: inherit;
        text-wrap: nowrap;
        user-select: none;
        white-space: nowrap;
        z-index: 0;
        -webkit-tap-highlight-color: transparent;
        transition-property: border-radius, inline-size, translate;
        transition-duration: 350ms;
        transition-timing-function: cubic-bezier(0.42, 1.67, 0.21, 0.9);
    }

    .container.disabled,
    .leading-button.disabled,
    .trailing-button.disabled {
        cursor: default;
    }
    .leading-button.disabled,
    .trailing-button.disabled {
        pointer-events: none;
    }

    /* Background — the shared container color of the two buttons. */
    .background {
        background-color: var(--_enabled-container-color);
        border-radius: inherit;
        inset: 0;
        position: absolute;
        z-index: -1;
    }
    .disabled .background {
        background-color: var(--_disabled-container-color);
        opacity: var(--_disabled-container-opacity);
    }

    /* Outline — painted by the outlined variant only. */
    .outline {
        border-color: var(--_enabled-outline-color);
        border-radius: inherit;
        border-style: solid;
        box-sizing: border-box;
        inset: 0;
        pointer-events: none;
        position: absolute;
        z-index: -1;
    }
    .disabled .outline {
        border-color: var(--_disabled-outline-color);
        opacity: var(--_disabled-outline-opacity);
    }

    /* Label */
    .label {
        color: var(--_enabled-label-color);
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .disabled .label {
        color: var(--_disabled-label-color);
        opacity: var(--_disabled-label-opacity);
    }
    :is(.leading-button, .trailing-button):not(.has-label) .label {
        display: none;
    }

    /* Icon */
    .icon {
        align-items: center;
        display: inline-flex;
        justify-content: center;
        flex-shrink: 0;
        position: relative;
        writing-mode: horizontal-tb;
        fill: currentColor;
    }
    :is(.leading-button, .trailing-button):not(.has-icon) .icon {
        display: none;
    }
    .icon {
        color: var(--_enabled-icon-color);
    }
    .disabled .icon {
        color: var(--_disabled-icon-color);
        opacity: var(--_disabled-icon-opacity);
    }

    /* Touch target */
    .touch-target {
        height: 100%;
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
    }

    @media (prefers-reduced-motion: reduce) {
        .leading-button,
        .trailing-button {
            transition: none;
        }
    }

    @media (forced-colors: active) {
        .background {
            border: 1px solid CanvasText;
        }
        .leading-button.disabled,
        .trailing-button.disabled {
            --_disabled-container-opacity: 1;
            --_disabled-label-opacity: 1;
            --_disabled-icon-opacity: 1;
            --_disabled-outline-opacity: 1;
        }
    }
`

const colorVariants = css`
    :host:has(.container.filled) {${filledTokenString};}
    :host:has(.container.filled-tonal) {${filledTonalTokenString};}
    :host:has(.container.elevated) {${elevatedTokenString};}
    :host:has(.container.outlined) {${outlinedTokenString};}
`

export const SplitButtonStyles = [
    getShapeStyles(),
    getContainerSizeStyles(),
    getButtonSpacingStyles(),
    getLabelStyles(),
    getLeadingIconSizeStyles(),
    getTrailingIconSizeStyles(),
    getOutlineStyles(),
    getTouchTargetStyles(),
    getExpandedStyles(),
    ripple,
    elevation,
    focusRing,
    shared,
    colorVariants,
]
