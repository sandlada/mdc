import { type PropType, type SlotsType, type VNodeRef, computed, defineComponent, onBeforeMount, onMounted, onUpdated, provide, readonly, ref, watch } from 'vue'
import css from './navigationDrawer.module.css'
import { type INavigationDrawerContext, NavigationDrawerContext } from './NavigationDrawerContext'

const Events = [
    'click',
    'pointerup',
]

const props = {
    /**
     * 表示首次渲染前默认激活的标签名
     * @example
     * ```html
     * <NavigationDrawer default-label="Home">
     *   <template #default>
     *     <NavigationDrawItem url="/" label="Home"></NavigationDrawItem>
     *     <NavigationDrawItem url="/store" label="store" ></NavigationDrawItem>
     *   </template>
     * </NavigationDrawer>
     * ```
     * 
     * defaultLabel属性设置后不会触发[routeRequested]和[labelChanged]事件, 修改defaultLabel属性值也不会触发[routeRequested]和[labelChanged]事件
     */
    defaultLabel: {
        type: String as PropType<string | null>,
        default: null,
    },
    defaultOpen: {
        type: Boolean as PropType<boolean>,
        default: true
    },

    /**
     * @private
     */
    modelValue: {
        type: Boolean as PropType<boolean>,
        default: true,
    },

    modal: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
}
const emits = {
    /**
     * @event routeRequested
     * 
     * 当导航组件的标签切换后触发此[routeRequested]事件, **仅当子组件设置了url属性时触发[routeRequested]事件**
     * @example
     * ```html
     * <NavigationDrawer @route-requested="(payload) => router.push(payload.url)">
     *   <NavigationDrawerItem url="/" label="Home"></NavigationDrawerItem>
     * </<NavigationDrawer>
     * ```
     * 
     * @param {{
     *   payload: { url: string }
     * }} payload - 事件触发时传递给callback函数的url信息
     */
    routeRequested: (payload: { url: string }) => payload,

    /**
     * @event labelChanged
     * 
     * 当导航组件的标签切换后触发此[labelChanged]事件
     * @example
     * ```html
     * <NavigationDrawer @label-changed="(payload) => { console.log(payload.labelName) }">
     *   <NavigationDrawerItem url="/" label="Home"></NavigationDrawerItem>
     * </<NavigationDrawer>
     * ```
     * 
     * @param {{
     *   payload: { labelName: string }
     * }} payload - 事件触发时传递给callback函数的label信息
     */
    labelChanged: (payload: { labelName: string }) => payload,

    /**
     * @todo
     * 
     * @param {{
     *  payload: {}
     * }} payload 
     */
    drawerOpen: () => {},
    drawerClosed: () => {},

    /**
     * @private
     * @event update:modelValue
     */
    'update:modelValue': (modelValue: boolean) => modelValue,
}
const slots = {} as SlotsType<{
    /**
     * 默认插槽应被使用作导航
     * @example
     * ```html
     * <template #default>
     *   <NavigationDrawItem label="Home"></NavigationDrawItem>
     *   <NavigationDrawItem label="Store"></NavigationDrawItem>
     * </template>
     * ```
     * 
     * 默认插槽公开了表示当前标签名的参数[currentLabelName]和[setCurrentLabelName]
     * ```html
     * <template #default="{ currentLabelName }">
     *   {{ currentLabelName }}
     * </template>
     * ```
     */
    default: ({
        currentLabelName: string | null,
        setCurrentLabelName: (label: string) => void,
    })

    /**
     * start插槽位于顶部, 应被使用作网站的标题显示
     * start插槽公开了表示导航组件开启与关闭的参数[isOpen], [open], [close]和[setIsOpen]
     * @example
     * ```html
     * <template #start="{ isOpen, open, close }">
     *   <button @click="() => isOpen ? close() : open()">
     *     {{ isOpen ? 'close' : 'open' }}
     *   </button>
     * </template>
     * ```
     */
    start: ({
        isOpen: boolean
        open: () => void
        close: () => void
        setIsOpen: (open: boolean) => void
    })
    end?: void
}>

export const NavigationDrawer = defineComponent({
    name: 'GlareUi-NavigationDrawer',
    props,
    slots,
    emits,
    setup(props, { emit }) {
        const root = ref<VNodeRef | null | undefined>(null)

        /**
         * [_isOpen]表示导航组件的开关(显示与隐藏)
         * 
         * **[_isOpen]应被[isOpen]管理**. 修改[isOpen]时会直接修改[_isOpen]并触发[update:modelValue]
         * 
         * @private
         */
        const _isOpen = ref(props.modelValue)
        const isOpen = computed<boolean>({
            get: () => _isOpen.value,
            set: (value: boolean) => {
                _isOpen.value = value
                emit('update:modelValue', value)
                if(value) {
                    emit('drawerOpen')
                } else {
                    emit('drawerClosed')
                }
            },
        })
        const setIsOpen = (open: boolean) => {
            isOpen.value = open
        }
        const open = () => setIsOpen(true)
        const close = () => setIsOpen(false)

        watch(() => props.modelValue, (change: boolean) => {
            setIsOpen(change)
        })

        onBeforeMount(() => {
            setIsOpen(props.defaultOpen)
        })

        const bindingScrimEvent = () => {
            if (!props.modal) {
                return
            }

            const scrim = (root.value as HTMLElement).querySelector(`div.${css.scrim}[data-scrim="true"]`) as HTMLElement
            if(scrim === null) {
                console.warn(`The scrim node for the NavigationDrawer could not be found as expected.`)
            }

            Events.map(event => {
                scrim.addEventListener(event, scrimHandleEvent)
            })
        }
        const scrimHandleEvent = (e: Event) => {
            const handle = () => {
                setIsOpen(false)
            }
            switch (e.type) {
                case 'click':
                    handle()
                    break
                case 'pointerup':
                    handle()
                    break
                default:
                    break
            }
        }
        onMounted(() => {
            if(typeof root.value === 'undefined' || root.value === null) {
                throw new Error(`NavigationDrawer failed to find the root node, this may be an internal error. Please report it.`)
            }

            bindingScrimEvent()
        })
        onUpdated(() => {
            bindingScrimEvent()

        })


        const currentUrl = ref<string | null>(null)
        const currentLabelName = ref<string | null>(props.defaultLabel)
        const setCurrentLabelName = (label: string) => {
            currentLabelName.value = label
            emit('labelChanged', { labelName: currentLabelName.value })
        }
        const setCurrentUrl = (url: string) => {
            currentUrl.value = url
            emit('routeRequested', { url: currentUrl.value })
        }
        const labels = ref<Array<string>>([])

        provide<INavigationDrawerContext>(NavigationDrawerContext, readonly({
            currentLabelName,
            setCurrentLabelName,
            currentUrl,
            setCurrentUrl,
            labels,
        }))

        return {
            currentLabelName,
            setCurrentLabelName,
            isOpen,
            setIsOpen,
            open,
            close,
            root,
        }
    },
    render() {
        const isContainerOpen = this.isOpen ? css.open : css.close
        const containerStyle = [css.container, isContainerOpen]

        const renderStart = this.$slots.start && (
            <span class={css.start}>
                {this.$slots.start({
                    isOpen: this.isOpen,
                    open: this.open,
                    close: this.close,
                    setIsOpen: this.setIsOpen
                })}
            </span>
        )
        const renderEnd = this.$slots.end && (
            <span class={css.end}>
                {this.$slots.end()}
            </span>
        )
        const renderScrim = this.modal && (
            <div aria-hidden="true" class={css.scrim} data-scrim="true">
            </div>
        )
        const renderContent = (
            <ul data-is-navigation-drawer-items="true" class={css.content}>
                {this.$slots.default && this.$slots.default({
                    currentLabelName: this.currentLabelName,
                    setCurrentLabelName: this.setCurrentLabelName,
                })}
            </ul>
        )

        return (
            <div class={containerStyle} ref={e => this.root = e}>
                {renderStart}
                {renderContent}
                {renderEnd}
                {renderScrim}
            </div>
        )
    }
})
