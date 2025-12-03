<template>
    <div :class="[Card.surface, Card[props.variant]]">
        <Ripple v-if="!props.disabledRipple"></Ripple>
        <Elevation v-if="!props.disabledElevation"></Elevation>

        <slot></slot>
    </div>
</template>

<script
    setup
    lang="ts"
>
import Ripple from '../ripple/Ripple.vue'
import Elevation from '../elevation/Elevation.vue'

type TCardVariant = 'filled' | 'filled-tonal' | 'outlined' | 'elevated'
interface ICard {

    disabledElevation: boolean
    disabledRipple: boolean

    disabled: boolean

    variant: TCardVariant
}

const props = withDefaults(defineProps<Partial<ICard>>(), {
    disabled: false,
    disabledElevation: false,
    disabledRipple: false,
    variant: 'filled',
})


</script>

<style module="Card">
.surface {
    --_card-container-min-width: var(--mamv-card-container-min-width, var(--_current-card-container-min-width, 64px));
    --_card-container-min-height: var(--mamv-card-container-min-height, var(--_current-card-container-min-height, 64px));
    --_card-container-color: var(--mamv-card-container-color, var(--_current-card-container-color, #6750a4));
    --_card-container-shape: var(--mamv-card-container-shape, var(--_current-card-container-shape, 18px));
    --_card-border-color: var(--mamv-card-border-color, var(--_current-card-border-color, transparent));
    --_card-border-width: var(--mamv-card-border-width, var(--_current-card-border-width, 0px));
    --_card-title-color: var(--mamv-card-title-color, var(--_current-card-title-color, var(--_card-text-color)));
    --_card-text-color: var(--mamv-card-text-color, var(--_current-card-text-color));
    --_card-elevation-level: var(--mamv-card-elevation-level, var(--_current-card-elevation-level, 0));

    position: relative;
    text-overflow: ellipsis;
    text-wrap: wrap;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    transition-duration: 250ms;
    transition-property: box-shadow, background;
    transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
    outline: none;
    border-style: solid;
    border-color: var(--_card-border-color);
    border-width: var(--_card-border-width);
    border-radius: var(--_card-container-shape);
    background-color: var(--_card-container-color);
    min-height: var(--_card-container-min-height);

    --mamv-elevation-level: var(--_card-elevation-level);
}

.filled {
    --_current-card-container-color: var(--md-sys-color-primary);
    --_current-card-text-color: var(--md-sys-color-on-primary);
}

.filled-tonal {
    --_current-card-container-color: var(--md-sys-color-secondary-container);
    --_current-card-text-color: var(--md-sys-color-on-secondary-container);
}

.outlined {
    --_current-card-container-color: transparent;
    --_current-card-border-color: var(--md-sys-color-outline);
    --_current-card-border-width: 1px;
    --_current-card-text-color: var(--md-sys-color-on-surface);
}

.elevated {
    --_current-card-text-color: var(--md-sys-color-on-surface);
    --_current-card-container-color: var(--md-sys-color-surface-container-low);
    --_current-card-elevation-level: 1;
}

.elevated:hover {
    --_current-card-elevation-level: 2;
}

.elevated:active,
.elevated:focus {
    --_current-card-elevation-level: 1;
}
</style>./Card
