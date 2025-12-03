import { type PropType } from 'vue'

export const propsShared = {

    /**
     * CenterAlignedTopAppbar组件显示的标题
     * 
     * @default 'Untitled'
     */
    headline: {
        type: String as PropType<string>,
        default: 'Untitled'
    },

    /**
     * 强制启用sticky样式, 启用后此组件将粘滞在[top: 0]的位置
     * @example
     * ```html
     * <div class="max-h-screen min-h-screen overflow-auto" @scroll="topAppbarScrolledEvent">
     *   <CenterAlignedTopAppbar title="Title" forcedSticky></CenterAlignedTopAppbar>
     * </div>
     * ```
     */
    forcedSticky: {
        type: Boolean as PropType<boolean>,
        default: false
    },

    /**
     * 启用阴影
     */
    alwaysShadow: {
        type: Boolean as PropType<boolean>,
        default: false
    },

    onScrollShadow: {
        type: Boolean as PropType<boolean>,
        default: false
    },

    onTopShadow: {
        type: Boolean as PropType<boolean>,
        default: false
    },


}

export interface ISlotsShared {
    /**
     * 位于TopAppbar左侧的图标按钮
     * 
     * **不应该设置多个图标**
     */
    leadingIcon?: void

    /**
     * 位于TopAppbar左侧的图标按钮
     * 
     * **不应该设置多个图标**
     */
    trailingIcon?: void
}
