import { defineComponent, type SlotsType } from 'vue'
import { Elevation } from '../../elevation/elevation'
import { propsShared, type ISlotsShared } from './base'
import cssBase from './base.module.css'
import css from './topAppbar.module.css'

const props = propsShared
const slots = {} as SlotsType<ISlotsShared>

export const CenterAlignedTopAppbar = defineComponent({
    name: 'GlareUi-CenterAlignedTopAppbar',
    props,
    slots,
    render() {
        const renderLeadingIcon = (
            <span class={cssBase['leading-icon']}>
                {this.$slots.leadingIcon && this.$slots.leadingIcon()}
            </span>
        )
        const renderTrailingIcon = (
            <span class={cssBase['trailing-icon']}>
                {this.$slots.trailingIcon && this.$slots.trailingIcon()}
            </span>
        )
        const renderTitle = (
            <span class={cssBase.headline}>
                {this.headline}
            </span>
        )

        const shadowMode = []
        if(this.alwaysShadow) {
            shadowMode.push(cssBase['always-shadow'])
        } else {
            if(this.onTopShadow) {
                shadowMode.push(cssBase['on-top-shadow'])
            }
            if(this.onScrollShadow) {
                shadowMode.push(cssBase['on-scroll-shadow'])
            }
        }

        return (
            <div
                data-is-top-app-bar="true"
                data-is-forced-sticky={this.forcedSticky}
                class={[cssBase.container, this.forcedSticky && cssBase['on-scroll'], css['center-aligned'], ...shadowMode]}
            >
                <div aria-hidden="true" class={cssBase.background}></div>
                <div aria-hidden="true" class={cssBase.outline}></div>

                <div class={cssBase['center-aligned-grid']}>
                    {renderLeadingIcon}
                    {renderTitle}
                    {renderTrailingIcon}
                </div>
                <Elevation></Elevation>
            </div>
        )
    }
})
