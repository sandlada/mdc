import { html, LitElement, type TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'

@customElement('mdc-docked-toolbar-action')
export class MDCDockedToolbarAction extends LitElement {

    static override shadowRootOptions: ShadowRootInit = {
        mode: 'open',
        delegatesFocus: true,
    }

    @property()
    public type: 'standard' | 'vibrant' = 'standard'

    protected getRenderClasses() {
        return ({
            'container': true,
            'standard': this.type === 'standard',
            'vibrant': this.type === 'vibrant',
        })
    }

    public override render(): TemplateResult {
        return html`
            <button class="${classMap(this.getRenderClasses())}">
            </button>
        `
    }

}
