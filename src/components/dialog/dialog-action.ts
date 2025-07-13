/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * [Modified by Kai-Orion & Sandlada]
 */
import { isServer, LitElement } from 'lit'
import { property, state } from 'lit/decorators.js'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { redispatchEvent } from '../../utils/event/redispatch-event'
import { DialogDefaultCloseAnimation, DialogDefaultOpenAnimation, type DialogAnimation, type DialogAnimationArgs } from './dialog-animations'

export abstract class DialogAction extends mixinDelegatesAria(LitElement) {

    declare returnValue: string
    declare quick: boolean

    protected declare readonly dialog: HTMLDialogElement | null
    protected declare readonly scrim: HTMLDialogElement | null
    protected declare readonly container: HTMLDialogElement | null
    protected declare readonly headline: HTMLDialogElement | null
    protected declare readonly content: HTMLDialogElement | null
    protected declare readonly actions: HTMLDialogElement | null
    protected declare readonly scroller: HTMLElement | null
    protected declare readonly topAnchor: HTMLElement | null
    protected declare readonly bottomAnchor: HTMLElement | null
    protected declare readonly firstFocusTrap: HTMLElement | null

    @property({ type: Boolean, noAccessor: true })
    public get open(): boolean {
        return this.isOpen
    }
    public set open(value: boolean) {
        if (value === this.isOpen) {
            return
        }
        this.isOpen = value
        if (value) {
            this.setAttribute('open', '')
            this.show?.()
        } else {
            this.removeAttribute('open')
            this.close?.()
        }
    }

    @state()
    protected isAtScrollTop = false;
    @state()
    protected isAtScrollBottom = false;

    protected isOpen = false
    protected isOpening = false
    protected isConnectedPromiseResolve!: () => void
    protected isConnectedPromise = this.getIsConnectedPromise()
    protected nextClickIsFromContent = false;
    protected intersectionObserver?: IntersectionObserver
    protected cancelAnimations?: AbortController
    protected escapePressedWithoutCancel = false

    protected getIsConnectedPromise() {
        return new Promise<void>((resolve) => {
            this.isConnectedPromiseResolve = resolve
        })
    }

    private get getCloseAnimation() {
        return DialogDefaultCloseAnimation
    }
    private get getOpenAnimation() {
        return DialogDefaultOpenAnimation
    }

    constructor() {
        super()
        if(isServer) {
            return
        }
        this.addEventListener('submit', this.handleSubmit.bind(this))
    }

    protected override firstUpdated() {
        this.intersectionObserver = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
            this.handleAnchorIntersection(entry);
            }
        },
        {root: this.scroller!},
        );

        this.intersectionObserver.observe(this.topAnchor!);
        this.intersectionObserver.observe(this.bottomAnchor!);
    }

    public async show() {
        this.isOpening = true
        // Dialogs can be opened before being attached to the DOM, so we need to
        // wait until we're connected before calling `showModal()`.
        await this.isConnectedPromise
        await this.updateComplete
        const dialog = this.dialog!
        // Check if already opened or if `dialog.close()` was called while awaiting.
        if (dialog.open || !this.isOpening) {
            this.isOpening = false
            return
        }

        const preventOpen = !this.dispatchEvent(
            new Event('open', { cancelable: true }),
        )
        if (preventOpen) {
            this.open = false
            this.isOpening = false
            return
        }

        // All Material dialogs are modal.
        dialog.showModal()
        this.open = true
        // Reset scroll position if re-opening a dialog with the same content.
        if (this.scroller) {
            this.scroller.scrollTop = 0
        }
        // Native modal dialogs ignore autofocus and instead force focus to the
        // first focusable child. Override this behavior if there is a child with
        // an autofocus attribute.
        this.querySelector<HTMLElement>('[autofocus]')?.focus()

        await this.animateDialog(this.getOpenAnimation)
        this.dispatchEvent(new Event('opened'))
        this.isOpening = false
    }

    /**
     * Closes the dialog and fires a cancelable `close` event. After a dialog's
     * animation, a `closed` event is fired.
     *
     * @param returnValue A return value usually indicating which button was used
     *     to close a dialog. If a dialog is canceled by clicking the scrim or
     *     pressing Escape, it will not change the return value after closing.
     * @return A Promise that resolves after the animation is finished and the
     *     `closed` event was fired.
     */
    public async close(returnValue = this.returnValue) {
        this.isOpening = false
        if (!this.isConnected) {
            // Disconnected dialogs do not fire close events or animate.
            this.open = false
            return
        }

        await this.updateComplete
        const dialog = this.dialog!
        // Check if already closed or if `dialog.show()` was called while awaiting.
        if (!dialog.open || this.isOpening) {
            this.open = false
            return
        }

        const prevReturnValue = this.returnValue
        this.returnValue = returnValue
        const preventClose = !this.dispatchEvent(
            new Event('close', { cancelable: true }),
        )
        if (preventClose) {
            this.returnValue = prevReturnValue
            return
        }

        await this.animateDialog(this.getCloseAnimation)
        dialog.close(returnValue)
        this.open = false
        this.dispatchEvent(new Event('closed'))
    }

    private async animateDialog(animation: DialogAnimation) {
        // Always cancel the previous animations. Animations can include `fill`
        // modes that need to be cleared when `quick` is toggled. If not, content
        // that faded out will remain hidden when a `quick` dialog re-opens after
        // previously opening and closing without `quick`.
        this.cancelAnimations?.abort()
        this.cancelAnimations = new AbortController()
        if (this.quick) {
            return
        }

        const { dialog, scrim, container, headline, content, actions } = this
        if (!dialog || !scrim || !container || !headline || !content || !actions) {
            return
        }

        const {
            container: containerAnimate,
            dialog: dialogAnimate,
            scrim: scrimAnimate,
            headline: headlineAnimate,
            content: contentAnimate,
            actions: actionsAnimate,
        } = animation

        const elementAndAnimation: Array<[Element, DialogAnimationArgs[]]> = [
            [dialog, dialogAnimate ?? []],
            [scrim, scrimAnimate ?? []],
            [container, containerAnimate ?? []],
            [headline, headlineAnimate ?? []],
            [content, contentAnimate ?? []],
            [actions, actionsAnimate ?? []],
        ]

        const animations: Animation[] = []
        for (const [element, animation] of elementAndAnimation) {
            for (const animateArgs of animation) {
                const animation = element.animate(...animateArgs)
                this.cancelAnimations.signal.addEventListener('abort', () => {
                    animation.cancel()
                })

                animations.push(animation)
            }
        }

        await Promise.all(
            animations.map((animation) =>
                animation.finished.catch(() => {
                    // Ignore intentional AbortErrors when calling `animation.cancel()`.
                }),
            ),
        )
    }

    protected handleDialogClick() {
        if (this.nextClickIsFromContent) {
            // Avoid doing a layout calculation below if we know the click came from
            // content.
            this.nextClickIsFromContent = false
            return
        }

        // Click originated on the backdrop. Native `<dialog>`s will not cancel,
        // but Material dialogs do.
        const preventDefault = !this.dispatchEvent(
            new Event('cancel', { cancelable: true }),
        )
        if (preventDefault) {
            return
        }

        this.close()
    }

    protected handleContentClick() {
        this.nextClickIsFromContent = true
    }

    protected handleSubmit(event: SubmitEvent) {
        const form = event.target as HTMLFormElement
        const { submitter } = event
        if (form.getAttribute('method') !== 'dialog' || !submitter) {
            return
        }

        // Close reason is the submitter's value attribute, or the dialog's
        // `returnValue` if there is no attribute.
        this.close(submitter.getAttribute('value') ?? this.returnValue)
    }

    protected handleCancel(event: Event) {
        if (event.target !== this.dialog) {
            // Ignore any cancel events dispatched by content.
            return
        }
        this.escapePressedWithoutCancel = false
        const preventDefault = redispatchEvent(this, event)
        // We always prevent default on the original dialog event since we'll
        // animate closing it before it actually closes.
        event.preventDefault()
        if (preventDefault) {
            return
        }

        this.close()
    }

    protected handleClose() {
        if (!this.escapePressedWithoutCancel) {
            return
        }
        this.escapePressedWithoutCancel = false
        this.dialog?.dispatchEvent(new Event('cancel', { cancelable: true }))
    }

    protected handleKeydown(event: KeyboardEvent) {
        if (event.key !== 'Escape') {
            return
        }
        // An escape key was pressed. If a "close" event fires next without a
        // "cancel" event first, then we know we're in the Chrome v120 bug.
        this.escapePressedWithoutCancel = true
        // Wait a full task for the cancel/close event listeners to fire, then
        // reset the flag.
        setTimeout(() => {
            this.escapePressedWithoutCancel = false
        })
    }


    private handleAnchorIntersection(entry: IntersectionObserverEntry) {
        const { target, isIntersecting } = entry
        if (target === this.topAnchor) {
            this.isAtScrollTop = isIntersecting
        }

        if (target === this.bottomAnchor) {
            this.isAtScrollBottom = isIntersecting
        }
    }
}
