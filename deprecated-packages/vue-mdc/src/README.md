# Modules

This folder uses modules as the smallest unit. When compiling, it will be
packaged with index.ts in the module.

| Module               | Does it include sub-modules? | Need to bundle? |
| :------------------- | ---------------------------: | --------------: |
| ./colors             |                           No |             Yes |
| ./component-register |                           No |             Yes |
| ./components         |                          Yes |             Yes |
| ./internals          |                           No |             Yes |
| ./themes             |                           No |              No |
| ./tokens             |                           No |              No |
| ./utils              |                           No |             Yes |

## Components

### SCSS Templates

#### \_COMPONENT.scss

`../styles/..`:

```scss
@mixin styles() {
    $tokens: tokens.md-comp-COMPONENTNAME-values();

    & {
        @each $token, $value in $tokens {
            --_#{$token}: #{$value};
        }
    }
}
```

`../theme/..`:

```scss
@mixin theme($tokens) {
    $supported-tokens: tokens.$md-comp-COMPONENTNAME-supported-tokens;

    @each $token, $value in $tokens {
        @if list.index($supported-tokens, $token) ==null {
            @error 'Token `#{$token}` is not a supported token.';
        }

        @if $value {
            --md-COMPONENTNAME-#{$token}: #{$value};
        }
    }
}
```

#### COMPONENT.module.scss

```scss
@use "./COMPONENT";

@layer mdc-COMPONENT {
    .COMPONENT {
        @include COMPONENT.styles();
    }
}
```
