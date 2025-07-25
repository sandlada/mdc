import { html, LitElement, type TemplateResult } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { redispatchEvent } from '../../utils/event/redispatch-event'
import { searchBarStyle } from './search-bar.style'

@customElement('mdc-search-bar')
export class MDCSearchBar extends LitElement {

    static override styles = searchBarStyle

    @property({ type: String, attribute: 'supporting-text' })
    public supportingText: string = 'Type here to search'

    @property({ type: Boolean, attribute: 'hide-avatar' })
    public hideAvatar: boolean = false

    @state()
    protected hasLeadingIcon: boolean = false
    @state()
    protected hasTrailingIcon: boolean = false
    @state()
    protected hasAvatar: boolean = false

    @query('.avatar')
    private avatarElement!: HTMLButtonElement | null

    protected override render(): TemplateResult {
        return html`
            <div role="search" class="search ${classMap(this.getRenderClasses())}">
                <span class="background" aria-hidden="true"></span>
                ${this.renderLeadingIcon()}
                ${this.renderInput()}
                ${this.renderTrailingIcon()}
                ${this.renderAvatar()}
                ${this.renderTouchTarget()}
            </div>
        `
    }

    protected renderLeadingIcon() {
        return html`
            <span class="leading-icon icon" @slotchange=${this.handleLeadingIconSlotChange}>
                <slot name="leading-icon"></slot>
            </span>
        `
    }

    protected renderTrailingIcon() {
        return html`
            <span class="trailing-icon icon" @slotchange=${this.handleTrailingIconSlotChange}>
                <slot name="trailing-icon"></slot>
            </span>
        `
    }

    protected renderInput() {
        return html`
            <input 
                class="input"
                id="input"
                placeholder=${this.supportingText}
                aria-placeholder=${this.supportingText}
                @input=${this.handleInput}
                @change=${this.handleChange}
            />
        `
    }

    protected renderTouchTarget() {
        return html`
            <span class="touch-target" aria-hidden="true"></span>
        `
    }

    protected renderAvatar() {
        return html`
            <button class="avatar" @click=${this.handleAvatarClick}>
                <slot name="avatar" @slotchange=${this.handleAvatarSlotChange}>
                    ${this.renderAvatarIcon()}
                </slot>
                <mdc-ripple></mdc-ripple>
                <mdc-focus-ring></mdc-focus-ring>
            </button>
        `
    }

    protected renderAvatarIcon() {
        return html`
            <svg class="avatar-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg>        
        `
    }

    protected getRenderClasses() {
        return ({
            'has-leading-icon': this.hasLeadingIcon,
            'has-trailing-icon': this.hasTrailingIcon,
            'has-avatar': this.hasAvatar,
            'hide-avatar': this.hideAvatar,
        })
    }

    private handleAvatarClick(e: Event) {
        e.stopPropagation()
        const avatarClickEvent = new CustomEvent('avatar-click', {
            bubbles: true,
            cancelable: false,
            detail: {
                target: this.avatarElement,
                currentTarget: this,
            }
        })
        redispatchEvent(this, avatarClickEvent)
    }
    private handleInput(e: Event) {
        redispatchEvent(this, e)
    }
    private handleChange(e: Event) {
        redispatchEvent(this, e)
    }

    private handleLeadingIconSlotChange(e: Event) {
        this.hasLeadingIcon = (e.target as HTMLSlotElement).assignedElements().length > 0
    }
    private handleTrailingIconSlotChange(e: Event) {
        this.hasTrailingIcon = (e.target as HTMLSlotElement).assignedElements().length > 0
    }
    private handleAvatarSlotChange(e: Event) {
        this.hasAvatar = (e.target as HTMLSlotElement).assignedElements().length > 0
    }
}
