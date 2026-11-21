/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit'
import {
    dispatchSelectionFeedback,
    enforceSelectionMutex,
    findNextFocusableControl,
    focusSelectionControl,
    getSelectionControls,
    listenForSelection,
    syncRovingTabStops,
    type FocusDirection,
} from './internal'

/**
 * Minimum shape required of any element that acts as a host for
 * `SelectionController`. Satisfied by `MDCTogglableButton` and any other
 * form-associated custom element that participates in a named selection group.
 */
export interface ISelectionControllerHost extends HTMLElement {
    /** Whether this control is currently selected / checked. */
    checked  : boolean
    /** When true the control is non-interactive and ignored by navigation. */
    disabled?: boolean
    /** Used by roving-tabindex management. */
    tabIndex : number
    /** Controls that share the same `name` form a mutual-exclusion group (radio behaviour). */
    name    ?: string
}

/**
 * Configuration options for `SelectionController`.
 * All fields are optional – unspecified fields retain their defaults.
 */
export interface ISelectionControllerOptions {
    /**
     * When `true` the group behaves like checkboxes: each item can be toggled
     * independently and no mutual-exclusion enforcement is applied.
     * When `false` the group behaves like radio buttons: selecting one item
     * automatically deselects all siblings that share the same `name`.
     * @default false
     */
    multiple: boolean

    /**
     * When `true` clicking an already-selected control deselects it (toggle).
     * Typically `true` for checkbox groups and `false` for radio groups.
     * @default false
     */
    canCancel: boolean

    /**
     * When `true`, receiving focus does NOT automatically select the focused
     * control (useful for checkbox groups where focus and selection are
     * independent).
     * @default false
     */
    preventSelectionDuringInitialFocus: boolean

    /**
     * When `true`, moving focus between controls with arrow keys does NOT
     * automatically select the newly focused control.
     * @default false
     */
    preventSelectionDuringSwitching: boolean

    /**
     * When `true`, a synthetic `click` is dispatched on the newly focused
     * control after each arrow-key navigation. This fires ripple press
     * animations and other click-based visual effects without re-triggering
     * `toggleSelection()` (the click is internally suppressed for that purpose).
     *
     * Enable for radio-button groups; leave `false` for focus-only groups such
     * as checkbox lists where arrow keys move focus without selecting.
     * @default false
     */
    dispatchNavigationClick: boolean

    /**
     * Controls whether `SelectionController` dispatches native `input` and
     * `change` events when selection changes.
     *
     * Set to `false` when the host component needs to dispatch custom events
     * with richer payloads or custom timing.
     * @default true
     */
    dispatchInputChangeEvents: boolean

    /**
     * Returns the focusable DOM element for a given host.
     * Defaults to returning the host itself.
     */
    getFocusableElement: (host: ISelectionControllerHost) => HTMLElement

    /**
     * Returns the root in which sibling controls are discovered. Defaults to the
     * host's root node when not configured. Return null to disable group
     * discovery (host only) — an explicit null is not treated as "unset".
     */
    getGroupRoot: (host: ISelectionControllerHost) => ParentNode | null

    /** Called once after `hostConnected()` completes. */
    onConnected: (host: ISelectionControllerHost) => void

    /** Called once after `hostDisconnected()` completes. */
    onDisconnected: (host: ISelectionControllerHost) => void

    /** Called immediately before `host.checked` is mutated by `toggleSelection()`. */
    onBeforeSelect: (host: ISelectionControllerHost) => void

    /** Called immediately after `host.checked` is mutated by `toggleSelection()`. */
    onAfterSelected: (host: ISelectionControllerHost) => void

    /**
     * Called after keyboard navigation completes on the **newly focused** host.
     * Fires after `.focus()`, state mutation, `input`/`change` events, and the
     * optional navigation click have all been dispatched.
     *
     * Use this to perform visual effects that depend on `:focus-visible` not
     * being reliable (e.g. force-opening a focus ring for a custom element that
     * browsers may not grant `:focus-visible` to on programmatic focus).
     *
     * @param next - the host that just received focus via keyboard navigation.
     */
    onAfterNavigate: (next: ISelectionControllerHost) => void
}

/**
 * A `ReactiveController` that adds radio/checkbox selection semantics,
 * keyboard navigation, and roving-tabindex management to a custom element.
 *
 * ### Group discovery
 * Controls are grouped by the value of their `name` attribute, queried from
 * the host's root node (shadow root or document). This mirrors native
 * `<input type="radio">` / `<input type="checkbox">` behaviour where any
 * control exposing `checked` with the same `name` belongs to the same group.
 *
 * Provide `getGroupRoot` to scope discovery to a narrower container, so that
 * independent composite widgets reusing the same `name` do not share a group.
 * Returning `null` disables group discovery entirely (host only).
 *
 * ### Usage
 * ```ts
 * class MyToggle extends LitElement {
 *   private readonly selectionController = new SelectionController(this, {
 *     multiple: false,
 *     canCancel: false,
 *   })
 *   // host.addController(this.selectionController) not required here;
 *   // SelectionController calls host.addController internally.
 * }
 * ```
 */
export class SelectionController implements ReactiveController {
    private options: Partial<ISelectionControllerOptions> = {}
    private stopInteraction: (() => void) | null = null
    private frameId: number | null = null

    private readonly host: ISelectionControllerHost & ReactiveControllerHost

    public constructor(
        host: ISelectionControllerHost & ReactiveControllerHost,
        options?: Partial<ISelectionControllerOptions>,
    ) {
        this.host = host
        if (options) this.configure(options)
        host.addController(this)
    }

    /** Updates the supplied options and keeps the current values of omitted options. */
    public configure(options: Partial<ISelectionControllerOptions>): void {
        const entries = Object.entries(options).filter(([, value]) => value !== undefined)
        this.options = { ...this.options, ...Object.fromEntries(entries) }
    }

    /** Returns same-name controls in document order within the configured group root. */
    public get controls(): ISelectionControllerHost[] {
        return getSelectionControls(this.options.getGroupRoot)(this.host)
    }

    /** Activates the current control and dispatches input/change when its selection changes. */
    public toggleSelection(): void {
        if (this.host.disabled) return
        this.options.onBeforeSelect?.(this.host)
        const wasChecked = this.host.checked
        const controls = this.controls

        this.host.checked = !this.options.canCancel || !wasChecked
        this.enforceMutex(this.host, controls)
        this.options.onAfterSelected?.(this.host)
        this.syncFocus(controls)
        if (wasChecked !== this.host.checked) this.dispatchChange(this.host)
    }

    /** Synchronizes selection and focus after a programmatic checked change. */
    public handleCheckedChange(): void {
        const controls = this.controls
        this.enforceMutex(this.host, controls)
        this.syncFocus(controls)
    }

    /** Ensures the checked host is the only checked item in a single-selection group. */
    public enforceMutexConsistency(): void {
        this.enforceMutex(this.host, this.controls)
    }

    public hostConnected(): void {
        if (this.stopInteraction) return
        this.stopInteraction = listenForSelection({
            activate: () => this.toggleSelection(),
            focus: (pointerDown) => this.handleFocus(pointerDown),
            navigate: (direction, event) => this.navigate(direction, event),
        })(this.host)

        if (this.host.checked) this.enforceMutexConsistency()
        this.frameId = requestAnimationFrame(() => {
            this.frameId = null
            this.syncFocus(this.controls)
        })
        this.options.onConnected?.(this.host)
    }

    public hostDisconnected(): void {
        if (!this.stopInteraction) return
        this.stopInteraction()
        this.stopInteraction = null
        if (this.frameId !== null) cancelAnimationFrame(this.frameId)
        this.frameId = null
        this.options.onDisconnected?.(this.host)
    }

    public hostUpdated(): void {
        this.handleCheckedChange()
    }

    private enforceMutex(selected: ISelectionControllerHost, controls: readonly ISelectionControllerHost[]): void {
        if (selected.checked && !this.options.multiple) enforceSelectionMutex(selected)(controls)
    }

    private readonly getFocusable = (control: ISelectionControllerHost): HTMLElement =>
        this.options.getFocusableElement?.(control) ?? control

    private syncFocus(controls: readonly ISelectionControllerHost[]): void {
        if (!this.host.isConnected) return
        syncRovingTabStops(this.getFocusable)(this.host.getRootNode() as Document | ShadowRoot)(controls)
    }

    private handleFocus(pointerDown: boolean): void {
        const controls = this.controls
        this.syncFocus(controls)
        // A pointer-induced focus must leave the selection change to the click.
        if (!pointerDown && !this.host.disabled && !this.host.checked && !this.options.preventSelectionDuringInitialFocus) {
            this.host.checked = true
            this.enforceMutex(this.host, controls)
        }
    }

    private navigate(direction: FocusDirection, event: KeyboardEvent): void {
        const controls = this.controls
        if (controls.length <= 1) return
        event.preventDefault()

        const next = findNextFocusableControl(direction)(this.host)(controls)
        if (!next) return
        const wasChecked = next.checked
        focusSelectionControl(this.getFocusable)(next)
        if (!this.options.preventSelectionDuringSwitching && !next.checked) {
            next.checked = true
            this.enforceMutex(next, controls)
        }
        if (!wasChecked && next.checked) this.dispatchChange(next)
        if (this.options.dispatchNavigationClick) dispatchSelectionFeedback(true)(next)
        this.options.onAfterNavigate?.(next)
    }

    private dispatchChange(control: ISelectionControllerHost): void {
        if (this.options.dispatchInputChangeEvents === false) return
        control.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }))
        control.dispatchEvent(new Event('change', { bubbles: true }))
    }
}
