
import { type SlotsType, defineComponent } from 'vue'
import { Elevation } from '../../elevation/elevation'
import { type ISlotsShared, propsShared } from './base'
import cssBase from './base.module.css'
import css from './topAppbar.module.css'

const props = propsShared
const slots = {} as SlotsType<Pick<ISlotsShared, 'leadingIcon'> & {
    trailingIcons: void
}>

export const SmallTopAppbar = defineComponent({
    name: 'GlareUi-SmallTopAppbar',
    props,
    slots,
    render() {
        const renderLeadingIcon = this.$slots.leadingIcon && <span class={cssBase['leading-icon']}>{this.$slots.leadingIcon()}</span>
        const renderTrailingIcons = this.$slots.trailingIcons && <span class={cssBase['trailing-icons']}>{this.$slots.trailingIcons()}</span>
        const renderTitle = <span class={cssBase.headline}>{this.headline}</span>

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
                class={[cssBase.container, this.forcedSticky && cssBase['on-scroll'], css.small, ...shadowMode]}
            >
                <Elevation></Elevation>

                <div aria-hidden="true" class={cssBase.background}></div>
                <div aria-hidden="true" class={cssBase.outline}></div>

                <div class={cssBase['small-grid']}>
                    {renderLeadingIcon}
                    {renderTitle}
                    {renderTrailingIcons}
                </div>
            </div>
        )
    }
})
