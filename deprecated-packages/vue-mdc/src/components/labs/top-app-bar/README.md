# TopAppbar

|Links|
|:--|
|[Specs](https://m3.material.io/components/top-app-bar/specs)|
|[Guidelines](https://m3.material.io/components/top-app-bar/guidelines)|

## States

topappbar has two states (these two states are not managed by anyone at all), which is enabled by default. When the parent container is bound and scrolls through the topAppbarScrolledEvent event, it is directly switched between enabled and on-scroll.

## Guidelines

Please pay attention to these things:

+ The content of TopAppbar must be related to the screen content.
+ TopAppbar must not be disabled
+ The leading icon and trailing icon must be an icon button
+ Trailing icons can only have a maximum of 3 icon buttons

## Imports

```typescript
import {
    CenterAlignedTopAppbar,
    SmallTopAppbar,
    MediumTopAppbar,
    LargeTopAppbar
} from '@glare-labs/ui'
```

## Examples

```html
<CenterAlignedTopAppbar headline="Title">
  <template #leadingIcon>
    <IconButton>
      <Icon>menu</Icon>
    </IconButton>
  </template>
  <template #trailingIcon>
    <IconButton>
      <Icon>dark_mode</Icon>
    </IconButton>
  </template>
</CenterAlignedTopAppbar>
```
