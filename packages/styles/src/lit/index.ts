/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Lit-bound style factories for component `.style.ts` files.
 *
 * Same names and signatures as the framework-agnostic core in
 * `utils/styles`, but terminal values are real Lit `CSSResult`s: they
 * interpolate directly in `css` templates and sit directly in `static
 * styles` arrays with no `unsafeCSS` / `toLit` wrapping at call sites.
 * (`css` itself stays imported from `'lit'`.)
 */

export { toLit, toLitAll } from './to-lit'
export { stringifyTokens } from './stringify-tokens'
export {
    overrideTokens,
    overrideComponentTokens,
    stringTokens
} from './override-tokens'
export { defineVariantTokens } from './define-variant-tokens'
export {
    createStyleSheet,
    type LitStyleSheetCurriedWithDef,
    type LitStyleSheetCurriedWithOptions,
    type LitCreateStyleSheetFn
} from './create-style-sheet'
