/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { baseSideSheetStyles } from './base-side-sheet.style'
import type {
    ISideSheet,
    SideSheetEdge,
    SideSheetVariant,
} from '../side-sheet.interface'

/**
 * Abstract base for `mdc-side-sheet`. Owns the lifecycle, focus traps,
 * and event dispatch. Subclasses define the public tag and the default
 * variant.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/side-sheets/guidelines
 */
export abstract class BaseSideSheet extends composeMixin(
    mixinDelegatesAria
)(LitElement) implements ISideSheet {

    public static override styles = [baseSideSheetStyles]

    @property({ type: String })
    public variant: SideSheetVariant = 'standard'

    @property({ type: Boolean, reflect: true })
    public open: boolean = false

    @property({ type: String, attribute: 'sheet-edge' })
    public sheetEdge: SideSheetEdge = 'end'

    @property({ type: Number, attribute: 'max-width' })
    public maxWidth: number = 400

    @property({ type: Boolean })
    public quick: boolean = false

    @property({ type: Boolean })
    public cancelable: boolean = true

    @property({ type: Boolean, attribute: 'no-focus-trap' })
    public noFocusTrap: boolean = false

    @property({ type: String, attribute: 'return-value' })
    public returnValue: string = ''

    @property({ type: Boolean, attribute: 'show-back-button' })
    public showBackButton: boolean = false

    @property({ type: Boolean })
    public override draggable: boolean = false

    @state()
    protected hasHeadline: boolean = false

    @state()
    protected hasContent: boolean = false

    @state()
    protected hasActions: boolean = false

    @state()
    protected hasCloseIcon: boolean = false

    @state()
    protected hasBackIcon: boolean = false

    protected getRenderClasses(): Record<string, boolean | string> {
        return {
            'standard'    : this.variant === 'standard',
            'modal'       : this.variant === 'modal',
            [`edge-${this.sheetEdge}`]: true,
            'open'        : this.open,
            'closing'     : false,
            'has-headline': this.hasHeadline,
            'has-content' : this.hasContent,
            'has-actions' : this.hasActions,
            'has-close-icon': this.hasCloseIcon,
            'has-back-icon' : this.hasBackIcon,
            'no-focus-trap': this.noFocusTrap,
            'show-back-button': this.showBackButton,
            'quick'       : this.quick,
        }
    }

    protected override render(): TemplateResult {
        return html`
            <dialog
                class="host ${classMap(this.getRenderClasses())}"
                part="host"
                ?open=${this.open}
                .returnValue=${this.returnValue}
            ></dialog>
        `
    }

    public async show(): Promise<void> {
        if (this.open) return
        this.open = true
    }

    public async hide(): Promise<void> {
        if (!this.open) return
        this.open = false
    }

    public async close(returnValue?: string): Promise<void> {
        this.returnValue = returnValue ?? ''
        await this.hide()
    }

    protected override willUpdate(_changedProperties: PropertyValues<this>): void {
        // Filled in by Task 4.
    }
}
