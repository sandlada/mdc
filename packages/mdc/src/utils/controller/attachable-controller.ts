/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 * 
 * @link
 * https://github.com/material-components/material-web/blob/main/internal/controller/attachable-controller.ts
 */

import { isServer, type ReactiveController, type ReactiveControllerHost } from 'lit';

/**
 * Local deviation from upstream: `for` is treated as an HTML IDREF and resolved
 * with `getElementById`, so valid HTML ids such as React's `:r0:` and `.class`
 * work without being interpreted as CSS selectors.
 */
const AsciiWhitespace = /[\t\n\f\r ]/;

const assertValidControlId = (id: string): void => {
    if (id === '') return;
    if (!AsciiWhitespace.test(id)) return;

    throw new Error(
        `Invalid "for" id ${JSON.stringify(id)}: HTML IDs must not contain ASCII whitespace`
    );
};

/**
 * An element that can be attached to an associated controlling element.
 */
export interface IAttachable {
    /**
     * Reflects the value of the `for` attribute, which is the ID of the element's
     * associated control.
     *
     * Use this when the elements's associated control is not its parent.
     *
     * To manually control an element, set its `for` attribute to `""`.
     *
     * The value is an HTML IDREF, not a CSS selector. Valid HTML ids such as
     * `:r0:` and `.class` are accepted; ids containing ASCII whitespace throw.
     *
     * @example
     * ```html
     * <div class="container">
     *   <md-attachable for="interactive"></md-attachable>
     *   <button id="interactive">Action</button>
     * </div>
     * ```
     *
     * @example
     * ```html
     * <button class="manually-controlled">
     *   <md-attachable for=""></md-attachable>
     * </button>
     * ```
     */
    htmlFor: string | null;

    /**
     * Gets or sets the element that controls the visibility of the attachable
     * element. It is one of:
     *
     * - The control referenced by the `for` attribute.
     * - The control provided to `element.attach(control)`
     * - The element's parent.
     * - `null` if the element is not controlled.
     */
    control: HTMLElement | null;

    /**
     * Attaches the element to an interactive control.
     *
     * @param control The element that controls the attachable element.
     */
    attach(control: HTMLElement): void;

    /**
     * Detaches the element from its current control.
     */
    detach(): void;
}

/**
 * A key to retrieve an `IAttachable` element's `AttachableController` from a
 * global `MutationObserver`.
 */
const AttachableControllerSymbol = Symbol('attachableController');

/**
 * The host of an `AttachableController`. The controller will add itself to
 * the host so it can be retrieved in a global `MutationObserver`.
 */
export interface IAttachableControllerHost extends ReactiveControllerHost, HTMLElement {
    [AttachableControllerSymbol]?: AttachableController;
}

let ForAttributeObserver: MutationObserver | undefined;

if (!isServer) {
    /**
     * A global `MutationObserver` that reacts to `for` attribute changes on
     * `IAttachable` elements. If the `for` attribute changes, the controller will
     * re-attach to the new referenced element.
     */
    ForAttributeObserver = new MutationObserver((records) => {
        for (const record of records) {
            // When a control's `for` attribute changes, inform its
            // `AttachableController` to update to a new control.
            (record.target as IAttachableControllerHost)[
                AttachableControllerSymbol
            ]?.hostConnected();
        }
    });
}

/**
 * A controller that provides an implementation for `IAttachable` elements.
 *
 * @example
 * ```ts
 * class MyElement extends LitElement implements IAttachable {
 *   get control() { return this.attachableController.control; }
 *
 *   private readonly attachableController = new AttachableController(
 *     this,
 *     (previousControl, newControl) => {
 *       previousControl?.removeEventListener('click', this.handleClick);
 *       newControl?.addEventListener('click', this.handleClick);
 *     }
 *   );
 *
 *   // Implement remaining `IAttachable` properties/methods that call the
 *   // controller's properties/methods.
 * }
 * ```
 */
export class AttachableController implements ReactiveController, IAttachable {
    private readonly host: IAttachableControllerHost
    private readonly onControlChange: (
        prev: HTMLElement | null,
        next: HTMLElement | null,
    ) => void

    public get htmlFor() {
        return this.host.getAttribute('for');
    }

    public set htmlFor(htmlFor: string | null) {
        if (htmlFor === null) {
            this.host.removeAttribute('for');
        } else {
            assertValidControlId(htmlFor);
            this.host.setAttribute('for', htmlFor);
        }
    }

    public get control() {
        if (this.host.hasAttribute('for')) {
            const id = this.htmlFor;
            assertValidControlId(id ?? '');

            if (!id || !this.host.isConnected) {
                return null;
            }

            return this.resolveById(id);
        }

        return this.currentControl || this.host.parentElement;
    }

    private resolveById(id: string): HTMLElement | null {
        const root = this.host.getRootNode() as Document | ShadowRoot;
        return root.getElementById(id) as HTMLElement | null;
    }
    public set control(control: HTMLElement | null) {
        if (control) {
            this.attach(control);
        } else {
            this.detach();
        }
    }

    private currentControl: HTMLElement | null = null;

    /**
     * Creates a new controller for an `IAttachable` element.
     *
     * @param host The `IAttachable` element.
     * @param onControlChange A callback with two parameters for the previous and
     *     next control. An `IAttachable` element may perform setup or teardown
     *     logic whenever the control changes.
     */
    constructor(
        host: IAttachableControllerHost,
        onControlChange: (prev: HTMLElement | null, next: HTMLElement | null) => void
    ) {
        this.host = host
        this.onControlChange = onControlChange
        
        host.addController(this);
        host[AttachableControllerSymbol] = this;
        ForAttributeObserver?.observe(host, { attributeFilter: ['for'] });
    }

    public attach(control: HTMLElement) {
        if (control === this.currentControl) {
            return;
        }

        this.setCurrentControl(control);
        // When imperatively attaching, remove the `for` attribute so
        // that the attached control is used instead of a referenced one.
        this.host.removeAttribute('for');
    }

    public detach() {
        this.setCurrentControl(null);
        // When imperatively detaching, add an empty `for=""` attribute. This will
        // ensure the control is `null` rather than the `parentElement`.
        this.host.setAttribute('for', '');
    }

    public hostConnected() {
        this.setCurrentControl(this.control);
    }

    public hostDisconnected() {
        this.setCurrentControl(null);
    }

    private setCurrentControl(control: HTMLElement | null) {
        this.onControlChange(this.currentControl, control);
        this.currentControl = control;
    }
}