/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import type { ReactiveController } from 'lit'
import { describe, expect, it } from 'vitest'
import { MeasuredContentWidthController } from './measured-content-width-controller'
import { MeasuredDimensionController } from './measured-dimension-controller'
import { OpacityTransitionController } from './opacity-transition-controller'

class Host extends HTMLElement {
    public controllers: ReactiveController[] = []
    public addController(c: ReactiveController) {
        this.controllers.push(c)
    }
    public requestUpdate() {}
    public updateComplete = Promise.resolve(true)
}
customElements.define('measured-content-host', Host)

const Build = (opts: Partial<ConstructorParameters<typeof MeasuredContentWidthController>[1]> = {}) => {
    const host = new Host()
    new MeasuredContentWidthController(host, { target: () => null, ...opts })
    return host.controllers
}

describe('MeasuredContentWidthController (deprecated facade)', () => {
    it('registers a dimension and an opacity controller by default', () => {
        const controllers = Build()
        expect(controllers).toHaveLength(2)
        expect(controllers[0]).toBeInstanceOf(MeasuredDimensionController)
        expect(controllers[1]).toBeInstanceOf(OpacityTransitionController)
    })

    it('opacity: false registers only the dimension controller', () => {
        const controllers = Build({ opacity: false })
        expect(controllers).toHaveLength(1)
        expect(controllers[0]).toBeInstanceOf(MeasuredDimensionController)
    })

    it('forwards duration/easing/dimension to sub-controllers', () => {
        const controllers = Build({ duration: 77, easing: 'linear', dimension: 'height' }) as unknown as Array<{
            options: Record<string, unknown>
        }>
        expect(controllers[0].options).toMatchObject({ duration: 77, easing: 'linear', dimension: 'height' })
        expect(controllers[1].options).toMatchObject({ duration: 77, easing: 'linear' })
    })

    it('applies defaults', () => {
        const controllers = Build() as unknown as Array<{ options: Record<string, unknown> }>
        expect(controllers[0].options).toMatchObject({
            dimension: 'width',
            duration: 300,
            easing: 'cubic-bezier(0.2, 0, 0.2, 1)',
        })
    })

    it('lifecycle methods are safe no-ops', () => {
        const host = new Host()
        const c = new MeasuredContentWidthController(host, { target: () => null })
        expect(() => {
            c.hostConnected()
            c.hostUpdated()
            c.hostDisconnected()
        }).not.toThrow()
    })
})
