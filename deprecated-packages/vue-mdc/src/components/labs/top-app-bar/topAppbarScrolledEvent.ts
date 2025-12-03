import css from './base.module.css'


const removeTopAppbarOnScrollStyles = (element: HTMLElement) => {
    if (element.getAttribute('data-is-forced-sticky') === 'false' && element.classList.contains(css['on-scroll'])) {
        element.classList.remove(css['on-scroll'])
    }
}
const addTopAppbarOnScrollStyles = (element: HTMLElement) => {
    if (element.getAttribute('data-is-forced-sticky') === 'false' && !element.classList.contains(css['on-scroll'])) {
        element.classList.add(css['on-scroll'])
    }
}

/**
 * 用于管理CenterAlignedTopAppbar组件启用与关闭[on-scroll状态]的scroll事件处理函数
 * @example
 * ```html
 * <div class="max-h-screen min-h-screen overflow-auto" @scroll="topAppbarScrolledEvent">
 *   <CenterAlignedTopAppbar title="Title" forcedSticky></CenterAlignedTopAppbar>
 * </div>
 * ```
 * 
 * **请确保绑定了事件的容器可以滚动, 并且容器拥有高度**
 * @example
 * ```html
 * <div class="relative h-screen overflow-auto" @scroll="topAppbarScrolledEvent">
 *   <CenterAlignedTopAppbar></CenterAlignedTopAppbar>
 * </div>
 * ```
 */
export const topAppbarScrolledEvent = (e: Event) => {
    const target = e.target as HTMLElement
    const topAppbar = target.querySelector('[data-is-top-app-bar="true"]') as HTMLElement

    if (target.scrollTop - topAppbar.offsetTop === 0 && (topAppbar.offsetTop === 0)) {
        removeTopAppbarOnScrollStyles(topAppbar)
        return
    }
    if (target.scrollTop - topAppbar.offsetTop !== 0 && target.scrollTop !== 0) {
        addTopAppbarOnScrollStyles(topAppbar)
        return
    }


    if ((target.scrollTop - topAppbar.offsetTop) < 1 && target.scrollTop - topAppbar.offsetTop > -1) return

    if ((target.scrollTop) > topAppbar.offsetTop) {
        addTopAppbarOnScrollStyles(topAppbar)
    } else {
        removeTopAppbarOnScrollStyles(topAppbar)
    }

}

