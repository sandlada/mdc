import { html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { outlinedIconButtonStyle } from './icon-button.style'
import { TogglableIconButton } from './togglable-icon-button'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-toggle-outlined-icon-button": ToggleOutlinedIconButton
    }
}

@customElement('mdc-toggle-outlined-icon-button')
export class ToggleOutlinedIconButton extends TogglableIconButton {
    static override styles = outlinedIconButtonStyle

    protected override renderOutline(): unknown {
        return html`
            <span aria-hidden="true" class="outline"></span>
        `
    }
}
