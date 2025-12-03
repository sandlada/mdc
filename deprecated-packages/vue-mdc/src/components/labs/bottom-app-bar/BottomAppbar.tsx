import { defineComponent } from 'vue'
import { Elevation } from '../../elevation/elevation'
import { BottomAppbarBase } from './base'
import cssBase from './base.module.css'
import css from './bottomAppbar.module.css'

class BottomAppbarComponent {
    private static readonly props = BottomAppbarBase.propsShared
    private static readonly slots = BottomAppbarBase.slotsShared
    private static readonly emits = []

    public static readonly component = defineComponent({
        name: 'GlareUi-BottomAppbar',
        props: this.props,
        slots: this.slots,
        emits: this.emits,
        setup(props, ctx) {

        },
        render() {
            const renderBackground = <div aria-hidden="true" class={cssBase.background}></div>
            const renderDefault = (
                <ul class={cssBase['button-group']}>
                    {this.$slots.default && this.$slots.default()}
                </ul>
            )
            const renderActionButton = (
                <span class={[cssBase['action-button']]}>
                    <span class={cssBase['action-button-wrapper']}>
                        {this.$slots['action-button'] && this.$slots['action-button']()}
                    </span>
                </span>
            )

            return (
                <div class={[css['default-impl'], cssBase.container, this.enableElevation && cssBase['enable-elevation']]}>
                    {renderBackground}
                    {renderDefault}
                    {renderActionButton}

                    <Elevation></Elevation>
                </div>
            )
        }
    })
}

export const BottomAppbar = BottomAppbarComponent.component
