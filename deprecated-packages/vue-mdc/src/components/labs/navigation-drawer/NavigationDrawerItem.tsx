import { type PropType, type SlotsType, computed, defineComponent, inject, onBeforeMount, onBeforeUnmount, watch } from 'vue'
import { Ripple } from '../../ripple/ripple'
import { type INavigationDrawerContext, NavigationDrawerContext } from './NavigationDrawerContext'
import css from './navigationDrawerItem.module.css'

export type TNavigationDrawerItemType = 'headline' | 'divider' | 'indicator'
export const NavigationDrawerItemTypes = {
    Headline: 'headline',
    Divider: 'divider',
    Indicator: 'indicator',
}

const props = {
    /**
     * 表示导航按钮的显示文本
     *
     * **当[type]为indicator或headline时必须提供label属性值**, 当type为divider时label属性值没有作用
     *
     * *label应该使用最短的词语且尽可能的表达明确意义*
     * @example
     * ```
     * // 完全不推荐, 完全错误
     * <NavigationDrawerItem label="Click here to login"></NavigationDrawerItem>
     *
     * // 良好
     * <NavigationDrawerItem label="Login"></NavigationDrawerItem>
     * ```
     *
     * @param {string} label 导航按钮的显示文本
     */
    label: {
        type: String as PropType<string>,
        default: null,
    },

    /**
     * 表示导航按钮旁的数字, **通常用于表达某一邻域相关的通知, 例如特别活动, 未读消息, 注意事项**
     *
     * @param {string} badge 导航按钮的消息数
     */
    badge: {
        type: String as PropType<string | null>,
        default: null,
    },

    /**
     * 表示导航按钮代表的url地址
     *
     * 当NavigationDrawerItem组件触发事件后(例如点击导航按钮), NavigationDrawer组件的currentLabelName和currentUrl会发生变换,
     * 同时触发[routeRequested]事件, [routeRequested]事件会传递目标url到callback
     *
     * 当url没有参数时不会触发[routeRequested]事件
     *
     * @param {string | null} 导航按钮代表的url地址
     */
    url: {
        type: String as PropType<string | null>,
        default: null,
    },

    /**
     * NavigationDrawerItem组件的类型, [type]默认取值为'indicator'
     *
     * + 支持的类型
     *   - indicator
     *   - headline
     *   - divider
     *
     * @param {'indicator' | 'headline' | 'divider'} type 组件的类型
     */
    type: {
        type: String as PropType<TNavigationDrawerItemType>,
        default: NavigationDrawerItemTypes.Indicator,
    }
}
const slots = {} as SlotsType<{
    default?: void
}>

export const NavigationDrawerItem = defineComponent({
    name: 'GlareUi-NavigationDrawerItem',
    props,
    slots,
    setup(props, ctx) {
        const injection = inject<INavigationDrawerContext>(NavigationDrawerContext)

        const isActive = computed(() => injection?.currentLabelName === props.label)

        const handleClicked = () => {
            injection?.setCurrentLabelName(props.label)
            if (props.url) {
                injection?.setCurrentUrl(props.url)
            }
        }

        const checkLabel = (label: string) => !injection?.labels.includes(label)

        onBeforeMount(() => {
            if (props.type !== NavigationDrawerItemTypes.Divider && props.label === null) {
                throw new Error(`The NavigationDrawerItem component must specify the [label] attribute value when the [type] is 'headline' or 'indicator'.`)
            }
            if (![NavigationDrawerItemTypes.Divider, NavigationDrawerItemTypes.Headline, NavigationDrawerItemTypes.Indicator].includes(props.type)) {
                throw new Error(`Unaccepted parameter [type], [type] should be 'headline', 'divider', or 'indicator'`)
            }
        })
        onBeforeUnmount(() => {
            injection?.labels.splice(injection.labels.lastIndexOf(props.label), 1)
        })

        watch(() => props.label, (newValue, oldValue) => {
            if (oldValue) {
                injection?.labels.splice(injection.labels.lastIndexOf(oldValue), 1)
            }
            if (checkLabel(newValue)) {
                injection?.labels.push(newValue)
            } else {
                throw new Error(`[label] already exists. The [label] attribute should be treated as a unique value. Please do not make the [label] attribute value of multiple NavigationDrawerItem components the same.`)
            }
        }, { immediate: true })

        return {
            handleClicked,
            isActive,
        }
    },
    render() {
        let renderContent = null

        if (this.type === NavigationDrawerItemTypes.Divider) {
            renderContent = (
                <span class={css.divider}></span>
            )
        } else if (this.type === NavigationDrawerItemTypes.Headline) {
            renderContent = (
                <span class={css.headline}>{this.label}</span>
            )
        } else if (this.type === NavigationDrawerItemTypes.Indicator) {
            const containerStyles = [css.container, this.isActive ? css.active : css.inactive]
            renderContent = (
                <div
                    data-is-navigation-drawer-item="true"
                    onClick={this.handleClicked}
                    data-label={props.label}
                    data-active={this.isActive}
                    class={containerStyles}
                >
                    <span class={css.icon}>
                        {this.$slots.default ? this.$slots.default() : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path d="M3 3v18h18V3H3zm16 16H5V5h14v14z" /></svg>)}
                    </span>
                    <span class={css.label}>
                        {this.label}
                    </span>
                    <span class={css.badge}>{this.badge}</span>
                    <Ripple></Ripple>
                </div>
            )
        }

        return renderContent
    }
})
