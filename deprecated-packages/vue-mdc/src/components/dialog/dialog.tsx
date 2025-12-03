/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { defineComponent, type SlotsType } from 'vue'
import { redispatchEvent } from '../../internals'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { isServer } from '../../utils'
import { Divider } from '../divider'
import { DialogDefaultCloseAnimation, DialogDefaultOpenAnimation, type IDialogAnimation, type TDialogAnimationArgs } from './animations'
import { SDialogController, type IDialogControllerHost } from './dialog-controller'
import { props, type TDialogSlots } from './dialog.definition'
import css from './styles/dialog.module.scss'

export const Dialog = defineComponent({
    name: `${componentNamePrefix}-dialog`,
    props,
    slots: {} as SlotsType<TDialogSlots>,
    emits: [
        'open',
        'opend',
        'cancel',
        'close',
        'closed',
        'submit',
        'update:modelValue',
    ],
    created() {
        if (this.modelValue !== null) {
            this.$emit('update:modelValue', this.defaultOpen)
        }
    },
    mounted() {
        this.isOpen = this.defaultOpen;

        (this.$el as IDialogControllerHost)[SDialogController] = ({
            show: () => {
                this.isOpen = true
            },
            close: () => {
                this.isOpen = true
            },
        })

        if (isServer()) {
            return
        }

        this.intersectionObserver = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                this.handleAnchorIntersection(entry)
            }
        }, {
            root: this.getScrollerElement(),
        })
        this.intersectionObserver.observe(this.getTopAnchorElement())
        this.intersectionObserver.observe(this.getBottomAnchorElement())

        this.getContainerElement().addEventListener('click', this.handleContentClick);
        (this.$el as HTMLElement).addEventListener('submit', this.handleSubmit)
        this.getDialogElement().addEventListener('click', this.handleDialogClick)
        this.getDialogElement().addEventListener('cancel', this.handleCancel)
        this.getDialogElement().addEventListener('close', this.handleClose)
        this.getDialogElement().addEventListener('keydown', this.handleKeydown)

        this.getDialogElement().returnValue = this.returnValue
    },
    updated() {
        if (this.modelValue !== null) {
            this.isOpen = this.modelValue
        }

        this.getDialogElement().returnValue = this.returnValue
    },
    data: () => ({
        animationController: null as null | AbortController,
        open: false,
        opening: false,
        returnValue: '',
        nextClickIsFromContent: false,
        escapePressedWithoutCancel: false,
        isAtScrollTop: false,
        isAtScrollBottom: false,
        intersectionObserver: null as null | IntersectionObserver,
    }),
    computed: {
        isOpen: {
            get() {
                return this.open
            },
            set(value: boolean) {
                if (this.open === value) {
                    return
                }
                this.open = value
                if (this.isOpen) {
                    this.show()
                } else {
                    this.close()
                }
            }
        }
    },
    methods: {
        async show() {
            this.opening = true

            if (this.getDialogElement().open || !this.opening) {
                this.opening = false
                return
            }

            const openEvent = new Event('open', {
                bubbles: false,
                cancelable: true,
                composed: false
            })
            this.$emit('open', openEvent)
            const preventOpen = !(this.$el as HTMLElement).dispatchEvent(openEvent)

            if (preventOpen) {
                this.isOpen = false
                this.opening = false
                return
            }

            this.isOpen = true
            this.getDialogElement().showModal()

            await this.animateDialog(DialogDefaultOpenAnimation)

            this.opening = false

            const opendEvent = new Event('opend', {
                bubbles: false,
                cancelable: false,
                composed: false
            })
            this.$emit('opend', opendEvent);
            (this.$el as HTMLElement).dispatchEvent(opendEvent)
        },
        async close(returnValue?: string) {
            this.opening = false

            if (!this.getDialogElement().open || this.opening) {
                this.isOpen = false
                return
            }

            const preReturnValue = this.returnValue
            this.returnValue = returnValue ? returnValue : this.returnValue

            const closeEvent = new Event('close', {
                bubbles: false,
                cancelable: true,
                composed: false,
            })
            this.$emit('close', closeEvent)
            const preventClose = !(this.$el as HTMLElement).dispatchEvent(closeEvent)

            if (preventClose) {
                this.returnValue = preReturnValue
                return
            }

            await this.animateDialog(DialogDefaultCloseAnimation)
            this.getDialogElement().close(returnValue ? returnValue : this.returnValue)
            this.isOpen = false

            const closedEvent = new Event('closed')
            this.$emit('closed', closedEvent);
            (this.$el as HTMLElement).dispatchEvent(closeEvent)
        },
        getDialogElement() {
            return (this.$el as HTMLElement).querySelector('&>dialog') as HTMLDialogElement
        },
        getScrimElement() {
            return (this.$el as HTMLElement).querySelector(`&>.${css.scrim}`) as HTMLElement
        },
        getContentElement() {
            return (this.$el as HTMLElement).querySelector(`& .${css.content}`) as HTMLElement
        },
        getContainerElement() {
            return (this.$el as HTMLElement).querySelector(`& .${css.container}`) as HTMLElement
        },
        getScrollerElement() {
            return (this.$el as HTMLElement).querySelector(`& .${css.scroller}`) as HTMLElement
        },
        getHeadlineElement() {
            return (this.$el as HTMLElement).querySelector(`& .${css.headline}`) as HTMLElement
        },
        getActionsElement() {
            return (this.$el as HTMLElement).querySelector(`& .${css.actions}`) as HTMLElement
        },
        getTopAnchorElement() {
            return (this.$el as HTMLElement).querySelector(`& .${css.top}.${css.anchor}`) as HTMLElement
        },
        getBottomAnchorElement() {
            return (this.$el as HTMLElement).querySelector(`& .${css.bottom}.${css.anchor}`) as HTMLElement
        },
        async animateDialog(animation: IDialogAnimation) {
            this.animationController?.abort()
            this.animationController = new AbortController()

            const {
                container: containerAnimate,
                dialog: dialogAnimate,
                scrim: scrimAnimate,
                headline: headlineAnimate,
                content: contentAnimate,
                actions: actionsAnimate,
            } = animation

            const elementAndAnimation: Array<[Element, TDialogAnimationArgs[]]> = [
                [this.getDialogElement(), dialogAnimate ?? []],
                [this.getScrimElement(), scrimAnimate ?? []],
                [this.getContainerElement(), containerAnimate ?? []],
                [this.getHeadlineElement(), headlineAnimate ?? []],
                [this.getContentElement(), contentAnimate ?? []],
                [this.getActionsElement(), actionsAnimate ?? []],
            ]

            const animations: Animation[] = []
            for (const [element, animation] of elementAndAnimation) {
                for (const animateArgs of animation) {
                    const animation = element.animate(...animateArgs)
                    this.animationController.signal.addEventListener('abort', () => {
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
        },
        handleCancel(e: Event) {
            if (e.target !== this.getDialogElement()) {
                return
            }

            this.escapePressedWithoutCancel = false
            this.$emit('cancel', e)
            const preventCancel = !redispatchEvent(this.$el, e)
            e.preventDefault()
            if (preventCancel) {
                return
            }
            this.close()
        },
        handleClose() {
            if (!this.escapePressedWithoutCancel) {
                return
            }

            this.escapePressedWithoutCancel = false
            this.getDialogElement().dispatchEvent(new Event('cancel', {
                cancelable: true,
            }))
        },
        handleSubmit(e: SubmitEvent) {
            const form = e.target as HTMLFormElement
            const { submitter } = e
            if (form.method !== 'dialog' || !submitter) {
                return
            }

            // Close reason is the submitter's value attribute, or the dialog's
            // `returnValue` if there is no attribute.
            this.close(submitter.getAttribute('value') ?? this.returnValue)
        },
        handleContentClick() {
            this.nextClickIsFromContent = true
        },
        handleDialogClick(e: Event) {
            if (this.nextClickIsFromContent) {
                this.nextClickIsFromContent = false
                return
            }
            const cancelEvent = new Event('cancel')
            this.$emit('cancel', cancelEvent)
            const preventCancel = !(this.$el).dispatchEvent(cancelEvent)
            if (preventCancel) {
                return
            }

            this.close()
        },
        handleKeydown(event: KeyboardEvent) {
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
        },
        handleAnchorIntersection(entry: IntersectionObserverEntry) {
            const { target, isIntersecting } = entry
            if (target === this.getTopAnchorElement()) {
                this.isAtScrollTop = isIntersecting
            }

            if (target === this.getBottomAnchorElement()) {
                this.isAtScrollBottom = isIntersecting
            }
        }
    },
    render() {
        const scrollable = this.isOpen && !(this.isAtScrollTop && this.isAtScrollBottom)

        const classes = [
            this.$slots.headline && css['has-headline'],
            this.$slots.actions && css['has-actions'],
            this.$slots.icon && css['has-icon'],
            scrollable && css.scrollable,
            (scrollable && !this.isAtScrollTop) && css['show-top-divider'],
            (scrollable && !this.isAtScrollBottom) && css['show-bottom-divider'],
        ]

        const renderHeadline = (
            <div class={css['headline-wrapper']}>
                <div class={css['icon-wrapper']} aria-hidden="true">
                    {this.$slots.icon && (
                        <span class={css.icon}>
                            {this.$slots.icon()}
                        </span>
                    )}
                </div>
                <h2 class={css.headline}>
                    {this.$slots.headline && this.$slots.headline()}
                </h2>

                <Divider></Divider>
            </div>
        )

        const renderScroller = (
            <div class={css.scroller}>
                <div class={css['content-wrapper']}>
                    <div class={[css.top, css.anchor]}></div>
                    {this.$slots.default && (
                        <span class={css.content}>
                            {this.$slots.default()}
                        </span>
                    )}
                    <div class={[css.bottom, css.anchor]}></div>
                </div>
            </div>
        )

        const renderActions = (
            <div class={css['actions-wrapper']}>
                <Divider></Divider>
                {this.$slots.actions && (
                    <span class={css.actions}>
                        {this.$slots.actions()}
                    </span>
                )}
            </div>
        )

        return (
            <div data-component="dialog" class={[css['dialog-container'], ...classes]}>
                <div class={css.scrim}></div>
                <dialog role='alertdialog'>
                    <div class={css.container}>
                        {renderHeadline}
                        {renderScroller}
                        {renderActions}
                    </div>
                </dialog>
            </div>
        )
    },
    inheritAttrs: true,
})
