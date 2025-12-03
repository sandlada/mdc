# Icon

**Please make sure you are using the dependency `material-symbols`.** material-symbols is an open source icon library that adheres to Material Design design specifications. I highly recommend everyone to try it!

1. You can use npm to download material-symbols dependencies:

```
npm i material-symbols
```

2. and then import it: _(The introduction method depends on your development environment. I recommend using Vite as the development environment.)_

```typescript
import 'material-symbols'
```

---

|Links|
|:--|
|[Material Design Icons in Github](https://github.com/google/material-design-icons)|
|[Material Symbols in Github](https://github.com/marella/material-symbols/tree/main/material-symbols#readme)|

## Imports

```typescript
import { Icon } from '@glare-labs/ui'
```

## Examples

you can use it alone.

```html
<Icon>send</Icon>

<Icon size="small">send</Icon>
<Icon size="medium">send</Icon>
<Icon size="semi-large">send</Icon>
<Icon size="large">send</Icon>
```

You can use this in a Button component (or other component that supports inserting icons).

```html
<Button>
    <template #icon>
        <Icon>send</Icon>
    <template>
    <template #default>
        Send Message
    </template>
</Button>
```
