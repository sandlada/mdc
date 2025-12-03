# Ripple

_If you want to use ripple more completely, please go to [@material/web](https://github.com/material-components/material-web) and download the official ripple component._

|Links|
|:--|
|[Ripple in Material Design 2](https://m2.material.io/develop/ios/supporting/ripple)|
|[Ripple in Material Design 3 Source code](https://github.com/material-components/material-web/tree/main/ripple)|

## Imports

```typescript
import { Ripple } from '@glare-labs/ui'
```

## Examples

As a child element of an element, the position value of its **parent element should be relative**.

```html
<div class="relative h-[32px] w-[32px] border">
    <Ripple></Ripple>
</div>

```

If necessary, you can modify ripple's CSS variables to customize your theme.

```html
<style>
.my-container {
  position: relative;
  height: 24px;
  width: 24px;
}
.my-ripple {
    --gu-ripple-hover-color: red;
    --gu-ripple-pressed-color: green;
}
</style>

<div class="my-container">
    <Ripple class="my-ripple"></Ripple>
</div>
```

When you need to use ripple to wrap the parent element, you can set that to ripple.

```html
<style>
.my-container {
  display: flex;
  place-content: center;
  place-items: center;
  position: relative;
  background-color: red;
  height: 24px;
  width: 24px;
  margin: 24px;
}

.my-ripple {
  --gu-ripple-shape: 50%;
  --gu-ripple-touch-target: unset;
  --gu-ripple-width: 48px;
  --gu-ripple-height: 48px;

}
</style>

<div class="my-container">
    <Ripple class="my-ripple"></Ripple>
</div>
```

You can specify the object you want to attach by setting the for attribute on ripple, and you can also attach and detach via `attach` and `detach`.

```html
<template>
    <div class="my-container">
        <Ripple class="my-ripple" for="my-input-ref"></Ripple>
    </div>

    <input
        id="my-input-ref"
        placeholder="Type here"
    />
</template>
<script setup>
import { onMounted } from 'vue'
import { AttachableControllerSymbol, Ripple } from '@glare-labs/ui'

onMounted(() => {
  const ripple = document.querySelector('#my-ripple-ref')
  const input = document.querySelector('#my-input-ref')

  ripple[AttachableControllerSymbol].attach(input)

  setTimeout(() => {
    ripple[AttachableControllerSymbol].detach()
  }, 5000)
})
</script>
```
