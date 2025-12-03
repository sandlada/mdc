/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { defineComponent, type SlotsType } from 'vue'
import { redispatchEvent } from '../../internals'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { isServer } from '../../utils'
import { Icon } from '../icon'
import { NavigationDrawerDefaultCloseAnimation, NavigationDrawerDefaultOpenAnimation, type INavigationAnimation, type TNavigationDrawerAnimationArgs } from './animations'
import { NavigationDrawerController } from './navigation-drawer-controller'
import { NavigationDrawerHeadline } from './navigation-drawer-headline'
import { NavigationDrawerIndicator } from './navigation-drawer-indicator'
import { props, type TNavigationDrawerSlots } from './navigation-drawer.definition'
import { ENavigationDrawerState } from './navigation-state'
import css from './styles/navigation-drawer.module.scss'

export const NavigationDrawer = defineComponent({
    name: `${componentNamePrefix}-navigation-drawer`,
    props: props,
    slots: {} as SlotsType<TNavigationDrawerSlots>,
    emits: [
        'open',
        'opend',
        'cancel',
        'close',
        'closed',
        'submit',
        'update:modelValue',
    ],
    data: () => ({
        animationController: null as null | AbortController,
        open: false,
        opening: false,
        nextClickIsFromContent: false,
        escapePressedWithoutCancel: false,
        isAtScrollTop: false,
        isAtScrollBottom: false,
        intersectionObserver: null as null | IntersectionObserver,
        controller: null as null | NavigationDrawerController,
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
            }
        }
    },
    mounted() {
        if (isServer()) {
            return
        }

        const root = this.$el as HTMLElement

        this.controller = new NavigationDrawerController(this.$el, this.show, this.close)
        this.isOpen = this.defaultOpen

        if (this.isOpen) {
            this.setRootAttribute(ENavigationDrawerState.Opend)
        } else {
            this.setRootAttribute(ENavigationDrawerState.Closed)
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

        this.getContainerElement().addEventListener('click', this.handleContentClick)
        this.getDialogElement().addEventListener('click', this.handleDialogClick)
        this.getDialogElement().addEventListener('cancel', this.handleCancel)
        this.getDialogElement().addEventListener('close', this.handleClose)
        this.getDialogElement().addEventListener('keydown', this.handleKeydown)
        this.getScrimElement().addEventListener('click', this.handleClose)
        // @ts-ignore
        root.addEventListener('request-route', this.handleRequestRoute)
    },
    methods: {
        getDialogElement(): HTMLDialogElement {
            return (this.$el as HTMLElement).querySelector(`&>.${css.dialog}`)!
        },
        getScrimElement(): HTMLSpanElement {
            return (this.$el as HTMLElement).querySelector(`&>.${css.scrim}`)!
        },
        getContainerElement(): HTMLElement {
            return (this.$el as HTMLElement).querySelector(`&>.${css.dialog}>.${css.container}`)!
        },
        getScrollerElement() {
            return (this.$el as HTMLElement).querySelector(`&>.${css.dialog}>.${css.scroller}`) as HTMLElement
        },
        getTopAnchorElement() {
            return (this.$el as HTMLElement).querySelector(`& .${css.top}.${css.anchor}`) as HTMLElement
        },
        getBottomAnchorElement() {
            return (this.$el as HTMLElement).querySelector(`& .${css.bottom}.${css.anchor}`) as HTMLElement
        },
        setRootAttribute(state: ENavigationDrawerState) {
            const root = (this.$el) as HTMLElement
            root.setAttribute('state', state)
        },
        handleRequestRoute(e: CustomEvent<{ element: HTMLElement }>) {
            this.controller?.setActiveIndicatorByElement(e.detail.element)
        },
        handleClose(e: Event) {
            if (!this.escapePressedWithoutCancel) {
                return
            }

            this.escapePressedWithoutCancel = false
            this.getDialogElement().dispatchEvent(new Event('cancel', {
                cancelable: true,
            }))
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
        handleContentClick() {
            this.nextClickIsFromContent = true
        },
        handleDialogClick() {
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
        },
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
            this.setRootAttribute(ENavigationDrawerState.Opening)

            if (preventOpen) {
                this.isOpen = false
                this.opening = false
                return
            }

            this.isOpen = true

            if (this.modal) {
                this.getDialogElement().showModal()
            } else {
                this.getDialogElement().show()
            }

            await this.animateDialog(NavigationDrawerDefaultOpenAnimation)

            this.opening = false

            const opendEvent = new Event('opend', {
                bubbles: false,
                cancelable: false,
                composed: false
            })
            this.$emit('opend', opendEvent);
            (this.$el as HTMLElement).dispatchEvent(opendEvent)
            this.setRootAttribute(ENavigationDrawerState.Opend)
        },
        async close() {
            this.opening = false

            if (!this.getDialogElement().open || this.opening) {
                this.isOpen = false
                return
            }

            const closeEvent = new Event('close', {
                bubbles: false,
                cancelable: true,
                composed: false,
            })
            this.$emit('close', closeEvent)
            const preventClose = !(this.$el as HTMLElement).dispatchEvent(closeEvent)
            this.setRootAttribute(ENavigationDrawerState.Closing)

            if (preventClose) {
                return
            }

            await this.animateDialog(NavigationDrawerDefaultCloseAnimation)
            this.getDialogElement().close()
            this.isOpen = false

            const closedEvent = new Event('closed')
            this.$emit('closed', closedEvent);
            (this.$el as HTMLElement).dispatchEvent(closeEvent)
            this.setRootAttribute(ENavigationDrawerState.Closed)
        },
        async animateDialog(animation: INavigationAnimation) {
            this.animationController?.abort()
            this.animationController = new AbortController()

            const {
                container: containerAnimate,
                dialog: dialogAnimate,
                scrim: scrimAnimate,
                headline: headlineAnimate,
                // content: contentAnimate,
                // actions: actionsAnimate,
            } = animation

            const elementAndAnimation: Array<[Element, Array<TNavigationDrawerAnimationArgs>]> = [
                [this.getDialogElement(), dialogAnimate ?? []],
                [this.getScrimElement(), scrimAnimate ?? []],
                [this.getContainerElement(), containerAnimate ?? []],
                // [this.getHeadlineElement(), headlineAnimate ?? []],
                // [this.getContentElement(), contentAnimate ?? []],
                // [this.getActionsElement(), actionsAnimate ?? []],
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
    },
    render() {
        const scrollable = this.isOpen && !(this.isAtScrollTop && this.isAtScrollBottom)

        const classes = [
            this.modal ? css.modal : css.standard,
            scrollable && css.scrollable,
            (scrollable && !this.isAtScrollTop) && css['show-top-divider'],
            (scrollable && !this.isAtScrollBottom) && css['show-bottom-divider'],
        ]

        return (
            <div data-component="navigation-drawer" role='dialog' class={[css['navigation-drawer-component-styles'], ...classes]}>
                <span aria-hidden="true" class={css.scrim}></span>
                <dialog class={css.dialog} role='alertdialog'>
                    <div class={css.container}>
                        <div class={css.scroller}>
                            <div class={css['content-wrapper']}>
                                <div class={[css.top, css.anchor]}></div>
                                <span class={css.content}>
                                    <NavigationDrawerHeadline>Headline One</NavigationDrawerHeadline>

                                    <div class={css['indicator-list']}>
                                        <NavigationDrawerIndicator defaultActive>
                                            {{
                                                default: () => 'Label',
                                                icon: () => <Icon>Menu</Icon>
                                            }}
                                        </NavigationDrawerIndicator>
                                        <NavigationDrawerIndicator>Label</NavigationDrawerIndicator>
                                        <NavigationDrawerIndicator>Label</NavigationDrawerIndicator>
                                    </div>
                                    {this.$slots.default && this.$slots.default()}
                                </span>
                                <div class={[css.bottom, css.anchor]}></div>
                            </div>
                        </div>

                        <span aria-hidden="true" class={css.background}></span>
                    </div>
                </dialog>
            </div>
        )
    },
    inheritAttrs: true,
})
