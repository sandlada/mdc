# Skeleton & Shimmer (`<mdc-skeleton>` & `<mdc-skeleton-group>`)

Material Design 3 Expressive loading placeholder components with GPU-composited shimmer/pulse motion, zero-CLS content wrapping, and coordinated group context.

## Variants & Options

- **`SkeletonVariant`**: `text` (default), `rectangular`, `rounded`, `circular`, `pill`
- **`SkeletonAnimation`**: `shimmer` (default), `pulse`, `none`
- **`SkeletonSize`**: `extra-small`, `small`, `medium` (default), `large`, `extra-large`

## Usage

### Standalone Placeholders

```html
<mdc-skeleton variant="circular" size="large"></mdc-skeleton>
<mdc-skeleton variant="text" lines="3" last-line-width="65%"></mdc-skeleton>
<mdc-skeleton variant="rounded" width="320px" aspect-ratio="16 / 9"></mdc-skeleton>
```

### Zero-CLS Content Wrapper Mode

```html
<mdc-skeleton loading variant="rounded">
    <mdc-card variant="outlined" style="padding: 16px;">
        <h3>Loaded Content</h3>
        <p>The skeleton inherits the exact dimensions of the wrapped content.</p>
    </mdc-card>
</mdc-skeleton>
```

### Coordinated Group (`<mdc-skeleton-group>`)

```html
<mdc-skeleton-group loading animation="shimmer" label="Loading profile">
    <mdc-skeleton variant="circular" size="large"></mdc-skeleton>
    <mdc-skeleton variant="text" lines="2"></mdc-skeleton>
</mdc-skeleton-group>
```
