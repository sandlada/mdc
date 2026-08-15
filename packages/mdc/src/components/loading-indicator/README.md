# Loading Indicator

## Components

- mdc-loading-indicator

## Status

| Component                | Ready to use |
| :----------------------- | -----------: |
| mdc-loading-indicator    |          Yes |

## Variants

`variant` selects the MD3 color-role scheme: `primary` (default), `secondary`,
`tertiary`, `error` or `surface`. `contained` toggles the 48dp container
(before the container there is no background).

| variant   | uncontained indicator | contained container   | contained indicator    |
| :-------- | :-------------------- | :-------------------- | :--------------------- |
| primary   | `primary`             | `primary-container`   | `on-primary-container` |
| secondary | `secondary`           | `secondary-container` | `on-secondary-container` |
| tertiary  | `tertiary`            | `tertiary-container`  | `on-tertiary-container` |
| error     | `error`               | `error-container`     | `on-error-container`   |
| surface   | `surface`             | `surface-container`   | `on-surface`           |

The variant colors are applied through CSS classes on the render root (no
inline style). To customize the contained background, override the
`--mdc-loading-indicator-enabled-contained-container-color` token from your own CSS.

`speed` (default `1`) scales the indeterminate animation rate — `2` runs twice
as fast, `0.5` half speed, `0` pauses the loop. Determinate tracking is not
time-driven, so `speed` does not affect it.

## Development

A runtime smoke test bundles the component with rolldown and drives the real
render / spring / color / event code paths under Node (no browser needed):

```sh
cd packages/mdc
npm run smoke
```
