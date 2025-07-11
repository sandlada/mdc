import { html, isServer } from 'lit'
import { property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { internals } from '../../utils/behaviors/element-internals'
import { setupFormSubmitter, type FormSubmitter, type FormSubmitterType } from '../../utils/controller/form-submitter'
import { BaseIconButton } from './base-icon-button'

export abstract class IconButton extends BaseIconButton implements FormSubmitter {
    static readonly formAssociated = true
    static {
        setupFormSubmitter(IconButton)
    }

    public get name() {
        return this.getAttribute('name') ?? '';
    }
    public set name(name: string) {
        this.setAttribute('name', name);
    }

    public get form() {
        return this[internals].form
    }

    @property({ type: String })
    public type: FormSubmitterType = 'submit'

    @property({ type: String, reflect: true})
    public value: string = ''

    @property({ type: Boolean, reflect: true })
    public override disabled = false

    @query('.button')
    protected override readonly buttonElement!: HTMLElement | null

    public override focus() {
        this.buttonElement?.focus()
    }

    public override blur() {
        this.buttonElement?.blur()
    }

    constructor() {
        super()
        if(isServer) {
            return
        }
        this.addEventListener('click', this.handleClick.bind(this))
    }

    protected override render(): unknown {
        return html`
            ${this.renderButton()}
        `
    }

    protected override renderButton(): unknown {
        const classes = classMap({
            [this.size]: true,
            [this.width]: true,
            'round': this.shape === 'round',
            'square': this.shape === 'square',
            'disabled': this.disabled,
        })
        return html`
            <button
                class="button ${classes}"
                .disabled=${this.disabled}
                aria-disabled=${this.disabled}
                type=${this.type}
            >
                ${this.renderIcon()}
                ${this.renderOutline?.()}
                ${this.renderBackground()}
                <mdc-ripple .disabled=${this.disabled} part="ripple"></mdc-ripple>
                <mdc-focus-ring .disabled=${this.disabled} part="focus-ring"></mdc-focus-ring>
            </button>
        `
    }

    protected override renderIcon(): unknown {
        return html`
            <slot></slot>
        `
    }
}
