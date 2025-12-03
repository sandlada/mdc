# Prototype

Please **DO NOT MODITY THE VALUES GIVEN TO THE VARIABLES** in the `tokens` folder.

The source code of prototype comes from the
[@material/web](https://github.com/material-components/material-web) project:

```javascript
/*
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * @link https://github.com/material-components/material-web/blob/main/tokens
 * @link https://github.com/material-components/material-web/tree/main/internal/motion
 */
```

_We have modified the source code in this folder, such as moving variables to
separate files, changing variable and parameter names, etc._

## Templates

_Don't forget to export in `_index.scss`._

```scss

@use 'sass:map';
@use 'sass:string';
@use './internal/shape';
@use './internal/validate';
@use './md-sys-color';
@use './md-sys-elevation';
@use './md-sys-shape';
@use './md-sys-state';
@use './md-sys-typescale';
@use './v0_192/COMPONENT';

$supported-tokens: (

);

$unsupported-tokens: (

);

$_default: (
    'md-sys-color': md-sys-color.values-light(),
    'md-sys-elevation': md-sys-elevation.values(),
    'md-sys-shape': md-sys-shape.values(),
    'md-sys-state': md-sys-state.values(),
    'md-sys-typescale': md-sys-typescale.values(),
);

@function values($deps: $_default, $exclude-hardcoded-values: false, $exclude-custom-properties: false) {
    $tokens: md-comp-COMPONENT.values($deps, $exclude-hardcoded-values);
    $new-tokens: shape.get-new-logical-shape-tokens($tokens, 'COMPONENT-container-shape');

    $tokens: validate.values($tokens, $supported-tokens: $supported-tokens, $unsupported-tokens: $unsupported-tokens, $new-tokens: $new-tokens);

    $tokens: map.merge(
        $tokens,
        ()
    );

    @if not $exclude-custom-properties {
        @each $token, $value in $tokens {
            @if string.index($token, 'COMPONENT-container-shape-') == 1 {
                // Add fallback to shorthand for logical shape properties.
                $value: var(--md-COMPONENT-COMPONENT-container-shape, #{$value});
            }

            $tokens: map.set($tokens, $token, var(--md-COMPONENT-#{$token}, #{$value}));
        }
    }

    @return $tokens;
}
```
