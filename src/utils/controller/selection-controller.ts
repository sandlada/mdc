/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit'

interface ISelectionControllerHost extends HTMLElement {
    checked  : boolean
    disabled?: boolean
    tabIndex : number
    name    ?: string
}

export interface ISelectionControllerAttributes {

    /**
     * Multiple Choice
     * true  => checkbox
     * false => radio
     */
    multiple                          : boolean
    canCancel                         : boolean

    preventSelectionDuringInitialFocus: boolean
    preventSelectionDuringSwitching   : boolean

    onConnected                       : (host: ISelectionControllerHost)        => void
    onDisconnected                    : (host: ISelectionControllerHost)        => void

    onBeforeSelect                    : (nextControl: ISelectionControllerHost) => void
    onAfterSelected                   : (nextControl: ISelectionControllerHost) => void
}

interface ISelectionControllerAction {
    controls: Array<ISelectionControllerHost>
    toggleSelection(): void
    enforceMutexConsistency(): void
}

export class SelectionController implements ReactiveController, ISelectionControllerAttributes, ISelectionControllerAction {

    private readonly host: ISelectionControllerHost & ReactiveControllerHost
    private root: Document | ShadowRoot | null = null

    public multiple                          : boolean                                         = false
    public canCancel                         : boolean                                         = false
    public preventSelectionDuringInitialFocus: boolean                                         = false
    public preventSelectionDuringSwitching   : boolean                                         = false
    public onConnected                       : (host: ISelectionControllerHost)        => void = () => {}
    public onDisconnected                    : (host: ISelectionControllerHost)        => void = () => {}
    public onBeforeSelect                    : (nextControl: ISelectionControllerHost) => void = () => {}
    public onAfterSelected                   : (nextControl: ISelectionControllerHost) => void = () => {}

    constructor(
        host: ISelectionControllerHost & ReactiveControllerHost,
        options?: Partial<ISelectionControllerAttributes>
    ) {
        this.host = host

        if(options) {
            for(const [key, value] of Object.entries(options)) {
                // @ts-ignore
                this[key] = value
            }
        }
    }

    public get controls(): Array<ISelectionControllerHost> {
        const name = this.host.getAttribute('name')
        if(!name || !this.root || !this.host.isConnected) return [this.host]
        return Array.from(this.root.querySelectorAll<ISelectionControllerHost>(`[name="${name}"]`))
    }

    public toggleSelection(): void {
        if (this.host.disabled) return

        this.onBeforeSelect(this.host)
        if(this.canCancel) this.host.checked = !this.host.checked
        else this.host.checked = true

        if (!this.multiple && this.host.checked) this.enforceMutexConsistency()
        this.onAfterSelected(this.host)

        this.updateRovingTabindex()
    }

    public enforceMutexConsistency(): void {
        if(this.multiple || !this.host.checked) return
        const siblings = this.controls
        for(const sibling of siblings) {
            if(sibling !== this.host && sibling.checked) {
                sibling.checked = false
            }
        }
    }

    private updateRovingTabindex(): void {
        if (!this.host.isConnected) return

        const controls = this.controls
        const activeEl = this.root?.activeElement as ISelectionControllerHost | null

        let target: ISelectionControllerHost | undefined

        if (activeEl && controls.includes(activeEl)) {
            target = activeEl
        } else {
            target = controls.find(c => c.checked) || controls.find(c => !c.disabled)
        }


        for (const ctrl of controls) {
            const newIndex = (ctrl === target) ? 0 : -1
            console.log(newIndex);
            if (ctrl.tabIndex !== newIndex) {
                ctrl.tabIndex = newIndex
            }
        }
    }

    private moveFocus(direction: 'prev' | 'next' | 'first' | 'last'): void {
        const controls = this.controls
        if (!controls.length) return

        const currentIndex = controls.indexOf(this.host)
        let nextIndex = currentIndex

        switch (direction) {
            case 'first':
                nextIndex = 0;
                break;
            case 'last':
                nextIndex = controls.length - 1;
                break;
            case 'next':
                nextIndex = (currentIndex + 1) % controls.length;
                break;
            case 'prev':
                nextIndex = (currentIndex - 1 + controls.length) % controls.length;
                break;
        }

        const nextControl = controls[nextIndex]

        if (nextControl && nextControl !== this.host) {
            nextControl.focus()

            if (!this.preventSelectionDuringSwitching) {
                if (!nextControl.checked) {
                    nextControl.checked = true
                }
            }
        }
    }

    private readonly handleFocus = () => {
        this.updateRovingTabindex()
        if (!this.preventSelectionDuringInitialFocus && !this.host.checked) {
            this.host.checked = true
            this.enforceMutexConsistency()
        }
    }

    private readonly handleClick = (e: MouseEvent) => {
        if (this.host.disabled) {
            e.preventDefault()
            return
        }
        this.toggleSelection()
    }

    private readonly handleKeyDown = (e: KeyboardEvent) => {
        if (this.host.disabled) return

        const { key } = e

        if (key === ' ' || key === 'Enter') {
            e.preventDefault()
            this.toggleSelection()
            return
        }

        const navKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
        if (!navKeys.includes(key)) return

        e.preventDefault()

        switch (key) {
            case 'ArrowDown':
            case 'ArrowRight':
                this.moveFocus('next')
                break
            case 'ArrowUp':
            case 'ArrowLeft':
                this.moveFocus('prev')
                break
            case 'Home':
                this.moveFocus('first')
                break
            case 'End':
                this.moveFocus('last')
                break
        }
    }

    public hostConnected(): void {
        this.root = this.host.getRootNode() as ParentNode as Document | ShadowRoot
        this.host.addEventListener('keydown', this.handleKeyDown)
        this.host.addEventListener('focus', this.handleFocus)
        this.host.addEventListener('click', this.handleClick)

        if (this.host.checked) {
            this.enforceMutexConsistency()
        }
        requestAnimationFrame(() => this.updateRovingTabindex())

        this.onConnected(this.host)
    }

    public hostDisconnected() {
        this.host.removeEventListener('keydown', this.handleKeyDown)
        this.host.removeEventListener('focus', this.handleFocus)
        this.host.removeEventListener('click', this.handleClick)
        this.root = null
        this.onDisconnected(this.host)
    }

    public hostUpdated(): void {
        if (this.host.checked) {
            this.enforceMutexConsistency()
        }
        this.updateRovingTabindex()
    }

}
