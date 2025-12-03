import { defineComponent, type PropType, type SlotsType } from 'vue'
import { Elevation } from '../../elevation/elevation'
import { Ripple } from '../../ripple/ripple'
import css from './Chip.module.css'

export type TChipType = 'assist' | 'filter' | 'input' | 'suggestion'
export const enum EChipType {
    Assist = 'assist',
    Filter = 'filter',
    Input = 'input',
    Suggestion = 'suggestion',
}

export const Chip = defineComponent({
    name: 'GlareUi-Chip',
    props: {
        type: {
            type: String as PropType<TChipType>,
            default: EChipType.Assist,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        elevated: {
            type: Boolean,
            default: false,
        },
    },
    slots: {} as SlotsType<{
        default: void,
        icon: void
    }>,
    setup(props, { slots }) {

        return () => (
            <div class={[css.surface, css[props.type], props.elevated && css.elevated, props.disabled && css.disabled]}>
                <Ripple></Ripple>
                <Elevation></Elevation>
                <div class={css.outline}></div>
                <div class={css.background}></div>
                <button class={css.button}>
                    {slots.icon && <span class={css.icon}>{slots.icon()}</span>}
                    <span class={css.label}>
                        {slots.default && slots.default()}
                    </span>
                    <span class={css['touch-target']}></span>
                </button>
            </div>
        )
    },
})
