/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { Ref } from 'vue'
import { useAttachable } from '../../internals'
import type { IAttachable } from '../../internals/controller/use-attachable'
import { isServer } from '../../utils'
import { FocusRingEvents } from './focus-ring-events'

const SHandleByFocusRing = Symbol('handleByFocusRing')
interface IFocusRingEvent extends Event {
    [SHandleByFocusRing]: true
}

export class FocusRingController {

    private _visible = false
    public get visible() {
        return this._visible
    }
    public set visible(value: boolean) {
        if (value === this._visible) {
            return
        }
        this._visible = value
        if (value) {
            this.host.value?.setAttribute('visible', ``)
        } else if (this.host.value?.hasAttribute('visible')) {
            this.host.value?.removeAttribute('visible')
        }
    }

    private attachale: IAttachable | null = null

    constructor(
        private host: Ref<HTMLElement | null>
    ) {
        this.attachale = useAttachable(host, (prev, next) => {
            if (isServer()) {
                return
            }
            for (const event of FocusRingEvents) {
                prev?.removeEventListener(event, this.handleEvent)
                next?.addEventListener(event, this.handleEvent)
            }
        })
    }

    private readonly handleEvent = (e: Event) => {
        const event = e as IFocusRingEvent
        if (event[SHandleByFocusRing]) {
            return
        }
        switch (event.type) {
            case 'focusin':
                this.visible = this.attachale?.control?.value?.matches(':focus-visible') ?? false
                break
            case 'focusout':
            case 'pointerdown':
                this.visible = false
                break
            default:
                break
        }

        event[SHandleByFocusRing] = true
    }
}
