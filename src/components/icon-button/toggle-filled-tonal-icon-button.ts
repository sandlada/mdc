import { customElement } from 'lit/decorators.js'
import { filledTonalIconButtonStyle } from './icon-button.style'
import { TogglableIconButton } from './togglable-icon-button'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-toggle-filled-tonal-icon-button": ToggleFilledTonalIconButton
    }
}

@customElement('mdc-toggle-filled-tonal-icon-button')
export class ToggleFilledTonalIconButton extends TogglableIconButton {
    static override styles = filledTonalIconButtonStyle
}
