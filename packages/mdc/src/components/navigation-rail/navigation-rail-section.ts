import { html, LitElement, type TemplateResult } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { NavigationRailSectionStyles } from './navigation-rail-section.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-navigation-rail-section': MDCNavigationRailSection
    }
}

@customElement('mdc-navigation-rail-section')
export class MDCNavigationRailSection extends LitElement {

    static override styles = NavigationRailSectionStyles

    @state()
    protected hasDefault: boolean = false
    @state()
    protected hasHeader: boolean = false

    public getContainerClasses() {
        return ({
            section: true,
            'has-header': this.hasHeader,
            'has-content': this.hasDefault,
        })
    }

    public override render(): TemplateResult<1> {
        return html`
            <div class=${classMap(this.getContainerClasses())}>
                ${this.renderHeaderSlot()}
                ${this.renderDefaultSlot()}
            </div>
        `
    }

    public renderDefaultSlot() {
        return html`<slot @slotchange=${this.handleDefaultSlotChange}></slot>`
    }

    public renderHeaderSlot() {
        return html`<slot name="header" @slotchange=${this.handleHeaderSlotChange}></slot>`
    }

    protected handleDefaultSlotChange(event: Event) {
        const slot = event.target as HTMLSlotElement
        this.hasDefault = slot.assignedElements().length > 0
    }

    protected handleHeaderSlotChange(event: Event) {
        const slot = event.target as HTMLSlotElement
        this.hasHeader = slot.assignedElements().length > 0
    }

}
