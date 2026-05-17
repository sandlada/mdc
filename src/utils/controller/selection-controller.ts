/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit'

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
     * Returns the focusable DOM element for a given host.
     * Defaults to returning the host itself.
     */
    getFocusableElement: (host: ISelectionControllerHost) => HTMLElement

    /** Called once after `hostConnected()` completes. */
    onConnected: (host: ISelectionControllerHost) => void

    /** Called once after `hostDisconnected()` completes. */
    onDisconnected: (host: ISelectionControllerHost) => void

    /** Called immediately before `host.checked` is mutated by `toggleSelection()`. */
    onBeforeSelect: (host: ISelectionControllerHost) => void

    /** Called immediately after `host.checked` is mutated by `toggleSelection()`. */
    onAfterSelected: (host: ISelectionControllerHost) => void
}

/**
 * A `ReactiveController` that adds radio/checkbox selection semantics,
 * keyboard navigation, and roving-tabindex management to a custom element.
 *
 * ### Group discovery
 * Controls are grouped by the value of their `name` attribute, queried from
 * the host's root node (shadow root or document). This mirrors native
 * `<input type="radio">` / `<input type="checkbox">` behaviour where any
 * element with the same `name` – regardless of tag name – belongs to the
 * same logical group.
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

    private readonly host: ISelectionControllerHost & ReactiveControllerHost
    private root: Document | ShadowRoot | null = null

    // ── options (mutable for runtime type-switching) ──────────────────────────

    /** @see ISelectionControllerOptions.multiple */
    public multiple                          : boolean                                          = false
    /** @see ISelectionControllerOptions.canCancel */
    public canCancel                         : boolean                                          = false
    /** @see ISelectionControllerOptions.preventSelectionDuringInitialFocus */
    public preventSelectionDuringInitialFocus: boolean                                          = false
    /** @see ISelectionControllerOptions.preventSelectionDuringSwitching */
    public preventSelectionDuringSwitching   : boolean                                          = false
    /** @see ISelectionControllerOptions.getFocusableElement */
    public getFocusableElement               : (host: ISelectionControllerHost) => HTMLElement  = (host) => host
    /** @see ISelectionControllerOptions.onConnected */
    public onConnected                       : (host: ISelectionControllerHost) => void         = () => {}
    /** @see ISelectionControllerOptions.onDisconnected */
    public onDisconnected                    : (host: ISelectionControllerHost) => void         = () => {}
    /** @see ISelectionControllerOptions.onBeforeSelect */
    public onBeforeSelect                    : (host: ISelectionControllerHost) => void         = () => {}
    /** @see ISelectionControllerOptions.onAfterSelected */
    public onAfterSelected                   : (host: ISelectionControllerHost) => void         = () => {}

    constructor(
        host: ISelectionControllerHost & ReactiveControllerHost,
        options?: Partial<ISelectionControllerOptions>,
    ) {
        this.host = host
        host.addController(this)
        if (options) {
            this.configure(options)
        }
    }

    /**
     * Atomically updates any subset of controller options.
     * Useful when a host property (e.g. `type`) changes and several behavioural
     * flags must be updated together.
     *
     * @example
     * ```ts
     * this.selectionController.configure({
     *   multiple: false,
     *   canCancel: false,
     *   preventSelectionDuringInitialFocus: false,
     *   preventSelectionDuringSwitching: false,
     * })
     * ```
     */
    public configure(options: Partial<ISelectionControllerOptions>): void {
        if (options.multiple                           !== undefined) this.multiple                           = options.multiple
        if (options.canCancel                          !== undefined) this.canCancel                          = options.canCancel
        if (options.preventSelectionDuringInitialFocus !== undefined) this.preventSelectionDuringInitialFocus = options.preventSelectionDuringInitialFocus
        if (options.preventSelectionDuringSwitching    !== undefined) this.preventSelectionDuringSwitching    = options.preventSelectionDuringSwitching
        if (options.getFocusableElement                !== undefined) this.getFocusableElement                = options.getFocusableElement
        if (options.onConnected                        !== undefined) this.onConnected                        = options.onConnected
        if (options.onDisconnected                     !== undefined) this.onDisconnected                     = options.onDisconnected
        if (options.onBeforeSelect                     !== undefined) this.onBeforeSelect                     = options.onBeforeSelect
        if (options.onAfterSelected                    !== undefined) this.onAfterSelected                    = options.onAfterSelected
    }

    // ── group discovery ───────────────────────────────────────────────────────

    /**
     * Returns all controls that belong to the same selection group as the host.
     * A group is defined by matching `name` attribute values within the host's
     * root node (shadow root or document).
     *
     * When the host has no `name`, or is not connected, returns `[host]`.
     */
    public get controls(): ISelectionControllerHost[] {
        const name = this.host.getAttribute('name')
        if (!name || !this.root || !this.host.isConnected) return [this.host]
        return Array.from(
            this.root.querySelectorAll<ISelectionControllerHost>(`[name="${CSS.escape(name)}"]`),
        )
    }

    // ── public actions ────────────────────────────────────────────────────────

    /**
     * Toggles or selects the host according to the current `canCancel` /
     * `multiple` settings, then enforces mutex consistency for radio groups
     * and updates the roving tabindex.
     *
     * No-op when the host is disabled.
     */
    public toggleSelection(): void {
        if (this.host.disabled) return

        this.onBeforeSelect(this.host)

        if (this.canCancel) {
            this.host.checked = !this.host.checked
        } else {
            this.host.checked = true
        }

        if (!this.multiple && this.host.checked) {
            this.enforceMutexConsistency()
        }

        this.onAfterSelected(this.host)
        this.updateRovingTabindex()
    }

    /**
     * Called when the host's `checked` property changes programmatically
     * (i.e. outside of `toggleSelection()`), for example from a property
     * setter. Enforces mutex consistency for radio groups and refreshes the
     * roving tabindex.
     *
     * @example
     * ```ts
     * set checked(value: boolean) {
     *   this._checked = value;
     *   this.selectionController.handleCheckedChange();
     * }
     * ```
     */
    public handleCheckedChange(): void {
        if (!this.multiple && this.host.checked) {
            this.enforceMutexConsistency()
        }
        this.updateRovingTabindex()
    }

    /**
     * Ensures that only the host is checked within its group.
     * No-op when `multiple` is true or the host itself is not checked.
     */
    public enforceMutexConsistency(): void {
        if (this.multiple || !this.host.checked) return
        for (const sibling of this.controls) {
            if (sibling !== this.host && sibling.checked) {
                sibling.checked = false
            }
        }
    }

    // ── private helpers ───────────────────────────────────────────────────────

    private updateRovingTabindex(): void {
        if (!this.host.isConnected) return

        // Resolve the currently focused element, piercing one shadow boundary.
        let activeEl = this.root?.activeElement as HTMLElement | null
        if (activeEl?.shadowRoot) {
            activeEl = activeEl.shadowRoot.activeElement as HTMLElement | null
        }

        const controls = this.controls

        // Determine which control should own tabIndex 0.
        let target: ISelectionControllerHost | undefined
        if (activeEl) {
            target = controls.find(
                (e) => activeEl === this.getFocusableElement(e) || e === activeEl,
            )
        }
        if (!target) {
            target = controls.find((e) => e.checked && !e.disabled)
                ?? controls.find((e) => !e.disabled)
        }

        for (const ctrl of controls) {
            const el = this.getFocusableElement(ctrl)
            if (!el) continue
            const desired = ctrl === target ? 0 : -1
            if (el.tabIndex !== desired) {
                el.tabIndex = desired
            }
        }
    }

    /**
     * Moves focus in the given direction, skipping disabled controls.
     * Falls back to keeping focus on the current host if no enabled sibling
     * is found.
     */
    private moveFocus(direction: 'prev' | 'next' | 'first' | 'last'): void {
        const controls = this.controls
        if (controls.length === 0) return

        const currentIndex = controls.indexOf(this.host)
        const len = controls.length

        let nextIndex: number
        let step: number

        switch (direction) {
            case 'first': nextIndex = 0;       step =  1; break
            case 'last' : nextIndex = len - 1; step = -1; break
            case 'next' : nextIndex = (currentIndex + 1) % len; step =  1; break
            case 'prev' : nextIndex = (currentIndex - 1 + len) % len; step = -1; break
        }

        // Walk in `step` direction until a non-disabled control is found,
        // stopping after at most one full rotation.
        for (let i = 0; i < len; i++) {
            const candidate = controls[nextIndex!]
            if (candidate && !candidate.disabled) break
            nextIndex! = ((nextIndex! + step!) % len + len) % len
        }

        const nextHost = controls[nextIndex!]
        if (!nextHost || nextHost === this.host || nextHost.disabled) return

        const focusableEl = this.getFocusableElement(nextHost)
        ;(focusableEl ?? nextHost).focus()

        if (!this.preventSelectionDuringSwitching && !nextHost.checked) {
            nextHost.checked = true
            if (!this.multiple) {
                // Enforce mutex: uncheck all siblings in the group.
                for (const sibling of this.controls) {
                    if (sibling !== nextHost && sibling.checked) {
                        sibling.checked = false
                    }
                }
            }
        }
    }

    // ── event handlers ────────────────────────────────────────────────────────

    /**
     * When Space / Enter toggles the selection we also dispatch a synthetic
     * (non-composed) click on the host so that visual effects — ripple,
     * activation-click forwarding — fire exactly as they do for pointer clicks.
     *
     * This flag prevents that synthetic click from triggering a second
     * `toggleSelection()` inside `handleClick`.
     */
    private _suppressNextClick = false

    private readonly handleFocus = (): void => {
        this.updateRovingTabindex()
        if (!this.preventSelectionDuringInitialFocus && !this.host.checked) {
            this.host.checked = true
            this.enforceMutexConsistency()
        }
    }

    private readonly handleClick = (e: MouseEvent): void => {
        if (this.host.disabled) {
            e.preventDefault()
            return
        }
        if (this._suppressNextClick) {
            this._suppressNextClick = false
            return
        }
        this.toggleSelection()
    }

    private readonly handleKeyDown = (e: KeyboardEvent): void => {
        if (this.host.disabled) return

        const { key } = e

        if (key === ' ' || key === 'Enter') {
            e.preventDefault()
            this.toggleSelection()
            // Dispatch a synthetic click on the host so that visual effects
            // (ripple, activation-click forwarding to inner button) fire the
            // same way they do for pointer clicks.
            // _suppressNextClick prevents handleClick from calling
            // toggleSelection() a second time for this synthetic click.
            this._suppressNextClick = true
            this.host.dispatchEvent(new MouseEvent('click', { bubbles: true }))
            return
        }

        const navKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
        if (!navKeys.includes(key)) return

        e.preventDefault()

        switch (key) {
            case 'ArrowDown':
            case 'ArrowRight': this.moveFocus('next');  break
            case 'ArrowUp':
            case 'ArrowLeft':  this.moveFocus('prev');  break
            case 'Home':       this.moveFocus('first'); break
            case 'End':        this.moveFocus('last');  break
        }
    }

    // ── ReactiveController lifecycle ──────────────────────────────────────────

    public hostConnected(): void {
        this.root = this.host.getRootNode() as Document | ShadowRoot
        this.host.addEventListener('keydown', this.handleKeyDown)
        this.host.addEventListener('focus',   this.handleFocus)
        this.host.addEventListener('click',   this.handleClick)

        if (this.host.checked) {
            this.enforceMutexConsistency()
        }
        requestAnimationFrame(() => this.updateRovingTabindex())
        this.onConnected(this.host)
    }

    public hostDisconnected(): void {
        this.host.removeEventListener('keydown', this.handleKeyDown)
        this.host.removeEventListener('focus',   this.handleFocus)
        this.host.removeEventListener('click',   this.handleClick)
        this.root = null
        this.onDisconnected(this.host)
    }

    public hostUpdated(): void {
        // Only re-enforce consistency when the host is actually checked to
        // avoid thrashing sibling state on every Lit render.
        if (this.host.checked) {
            this.enforceMutexConsistency()
        }
        this.updateRovingTabindex()
    }

}
