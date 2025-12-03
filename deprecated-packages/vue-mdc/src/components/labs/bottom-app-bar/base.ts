import { type PropType, type SlotsType } from 'vue'

export type TBottomAppbarActionButtonShape = 'square' | 'rounded'

export class BottomAppbarBase {
    public static readonly propsShared = {
        actionButtonShape: {
            type: String as PropType<TBottomAppbarActionButtonShape>,
            default: 'rounded'
        },

        enableElevation: {
            type: Boolean as PropType<boolean>,
            default: false
        },



    }

    public static readonly slotsShared = {} as SlotsType<{
        default: void
        'action-button': void
    }>
}
