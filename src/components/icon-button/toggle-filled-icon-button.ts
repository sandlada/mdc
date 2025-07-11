import { customElement } from 'lit/decorators.js'
import { filledIconButtonStyle } from './icon-button.style'
import { TogglableIconButton } from './togglable-icon-button'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-toggle-filled-icon-button": ToggleFilledIconButton
    }
}

@customElement('mdc-toggle-filled-icon-button')
export class ToggleFilledIconButton extends TogglableIconButton {
    static override styles = filledIconButtonStyle
}
