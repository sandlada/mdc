<template>
    <div data-am-chip-set v-bind="$attrs" ref="setRef" @keydown="handleKeydown">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const setRef = ref<HTMLElement | null>(null)
const chips = computed(() => {
    if(setRef.value === null || setRef.value?.childElementCount === 0) return []
    const children = [...setRef.value.children].filter(e => e.getAttribute('data-am-chip') || e.getAttribute('data-is-chip'))

    return children
})

const handleKeydown = (e: KeyboardEvent) => {
    const isLeft = e.key === 'ArrowLeft';
    const isRight = e.key === 'ArrowRight';
    const isHome = e.key === 'Home';
    const isEnd = e.key === 'End';

    if (!isLeft && !isRight && !isHome && !isEnd) {
      return;
    }
}
</script>

<style scoped>

</style>