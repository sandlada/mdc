/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment happy-dom
import type { ReactiveController } from 'lit'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SelectionController, type ISelectionControllerOptions } from './selection-controller'

let Seq = 0

class Item extends HTMLElement {
    public checked = false
    public disabled = false
    private readonly controllers: ReactiveController[] = []
    public readonly selection: SelectionController

    constructor(options?: Partial<ISelectionControllerOptions>) {
        super()
        this.selection = new SelectionController(this as never, options)
    }

    public addController(c: ReactiveController) {
        this.controllers.push(c)
    }

    public connectedCallback() {
        this.controllers.forEach((c) => c.hostConnected?.())
    }

    public disconnectedCallback() {
        this.controllers.forEach((c) => c.hostDisconnected?.())
    }
}
customElements.define('sel-item', Item)

const Make = (
    count: number,
    options?: Partial<ISelectionControllerOptions>,
    name = 'g' + ++Seq,
) => {
    const items: Item[] = []
    for (let i = 0; i < count; i++) {
        const el = new Item(options)
        el.setAttribute('name', name)
        items.push(el)
        document.body.appendChild(el)
    }
    return items
}

const Key = (el: HTMLElement, key: string) => {
    const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    el.dispatchEvent(e)
    return e
}

describe('SelectionController', () => {
    beforeEach(() => {
        vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
            cb(0)
            return 0
        })
    })
    afterEach(() => vi.unstubAllGlobals())

    describe('group discovery', () => {
        it('returns [host] when there is no name', () => {
            const el = new Item()
            document.body.appendChild(el)
            expect(el.selection.controls).toEqual([el])
        })

        it('returns [host] when not connected', () => {
            const el = new Item()
            el.setAttribute('name', 'x')
            expect(el.selection.controls).toEqual([el])
        })

        it('finds all same-name siblings in document order', () => {
            const items = Make(3)
            expect(items[0].selection.controls).toEqual(items)
        })

        it('does not mix groups with different names', () => {
            const a = Make(2)
            const b = Make(2)
            expect(a[0].selection.controls).toEqual(a)
            expect(b[0].selection.controls).toEqual(b)
        })

        it('excludes named elements without selection state', () => {
            const [first, second] = Make(2)
            const label = document.createElement('div')
            label.setAttribute('name', first.getAttribute('name')!)
            first.after(label)

            expect(first.selection.controls).toEqual([first, second])
        })

        it('escapes special characters in names', () => {
            const items = Make(2, undefined, 'a.b:c')
            expect(items[0].selection.controls).toEqual(items)
        })

        it('getGroupRoot scopes discovery', () => {
            const scope = document.createElement('div')
            document.body.appendChild(scope)
            const inside = new Item({ getGroupRoot: () => scope })
            const outside = new Item({ getGroupRoot: () => scope })
            inside.setAttribute('name', 'scoped')
            outside.setAttribute('name', 'scoped')
            scope.appendChild(inside)
            document.body.appendChild(outside)
            expect(inside.selection.controls).toEqual([inside])
        })

        it('getGroupRoot returning null disables discovery (does not fall back)', () => {
            const items = Make(2, { getGroupRoot: () => null })
            expect(items[0].selection.controls).toEqual([items[0]])
        })
    })

    describe('toggleSelection', () => {
        it('radio: selects host and unchecks siblings', () => {
            const [a, b] = Make(2)
            a.checked = true
            b.selection.toggleSelection()
            expect(b.checked).toBe(true)
            expect(a.checked).toBe(false)
        })

        it('radio: re-selecting a checked item does not uncheck it (canCancel=false)', () => {
            const [a] = Make(2)
            a.checked = true
            a.selection.toggleSelection()
            expect(a.checked).toBe(true)
        })

        it('canCancel toggles off', () => {
            const [a] = Make(1, { canCancel: true })
            a.selection.toggleSelection()
            expect(a.checked).toBe(true)
            a.selection.toggleSelection()
            expect(a.checked).toBe(false)
        })

        it('multiple: leaves siblings untouched', () => {
            const [a, b] = Make(2, { multiple: true, canCancel: true })
            a.selection.toggleSelection()
            b.selection.toggleSelection()
            expect(a.checked && b.checked).toBe(true)
        })

        it('is a no-op when disabled (no callbacks, no events)', () => {
            const before = vi.fn()
            const [a] = Make(1, { onBeforeSelect: before })
            a.disabled = true
            const onChange = vi.fn()
            a.addEventListener('change', onChange)
            a.selection.toggleSelection()
            expect(a.checked).toBe(false)
            expect(before).not.toHaveBeenCalled()
            expect(onChange).not.toHaveBeenCalled()
        })

        it('fires onBeforeSelect before and onAfterSelected after mutation', () => {
            const seen: boolean[] = []
            const [a] = Make(1, {
                onBeforeSelect: (h) => seen.push(h.checked),
                onAfterSelected: (h) => seen.push(h.checked),
            })
            a.selection.toggleSelection()
            expect(seen).toEqual([false, true])
        })

        it('dispatches input then change only when state changes', () => {
            const [a] = Make(1)
            const order: string[] = []
            a.addEventListener('input', () => order.push('input'))
            a.addEventListener('change', () => order.push('change'))
            a.selection.toggleSelection()
            a.selection.toggleSelection()
            expect(order).toEqual(['input', 'change'])
        })

        it('dispatchInputChangeEvents=false suppresses events', () => {
            const [a] = Make(1, { dispatchInputChangeEvents: false })
            const spy = vi.fn()
            a.addEventListener('change', spy)
            a.selection.toggleSelection()
            expect(spy).not.toHaveBeenCalled()
        })
    })

    describe('programmatic changes', () => {
        it('handleCheckedChange enforces mutex for radio', () => {
            const [a, b] = Make(2)
            a.checked = true
            b.checked = true
            b.selection.handleCheckedChange()
            expect(a.checked).toBe(false)
        })

        it('enforceMutexConsistency is a no-op when multiple', () => {
            const [a, b] = Make(2, { multiple: true })
            a.checked = true
            b.checked = true
            b.selection.enforceMutexConsistency()
            expect(a.checked).toBe(true)
        })

        it('enforceMutexConsistency is a no-op when host unchecked', () => {
            const [a, b] = Make(2)
            a.checked = true
            b.selection.enforceMutexConsistency()
            expect(a.checked).toBe(true)
        })

        it('hostUpdated re-enforces mutex', () => {
            const [a, b] = Make(2)
            a.checked = true
            b.checked = true
            b.selection.hostUpdated()
            expect(a.checked).toBe(false)
        })
    })

    describe('roving tabindex', () => {
        it('checked enabled item owns tabindex 0, others -1', () => {
            const [a, b, c] = Make(3)
            b.checked = true
            b.selection.handleCheckedChange()
            expect([a.tabIndex, b.tabIndex, c.tabIndex]).toEqual([-1, 0, -1])
        })

        it('falls back to first enabled when none checked', () => {
            const [a, b] = Make(2)
            a.disabled = true
            b.selection.handleCheckedChange()
            expect(a.tabIndex).toBe(-1)
            expect(b.tabIndex).toBe(0)
        })

        it('single control is left untouched', () => {
            const [a] = Make(1)
            a.tabIndex = 5
            a.selection.handleCheckedChange()
            expect(a.tabIndex).toBe(5)
        })
    })

    describe('keyboard', () => {
        it('Space/Enter toggles once, prevents default, dispatches a synthetic click that does not re-toggle', () => {
            const [a] = Make(1, { canCancel: true })
            const click = vi.fn()
            a.addEventListener('click', click)
            const e = Key(a, ' ')
            expect(e.defaultPrevented).toBe(true)
            expect(a.checked).toBe(true)
            expect(click).toHaveBeenCalledTimes(1)
            Key(a, 'Enter')
            expect(a.checked).toBe(false)
        })

        it('ignores keys when disabled', () => {
            const [a] = Make(1)
            a.disabled = true
            const e = Key(a, ' ')
            expect(e.defaultPrevented).toBe(false)
            expect(a.checked).toBe(false)
        })

        it('ignores unrelated keys', () => {
            const [a] = Make(2)
            expect(Key(a, 'x').defaultPrevented).toBe(false)
        })

        it('arrow keys do nothing for a single control', () => {
            const [a] = Make(1)
            expect(Key(a, 'ArrowRight').defaultPrevented).toBe(false)
        })

        it('ArrowRight/Down move to next and select it', () => {
            const [a, b, c] = Make(3)
            a.checked = true
            Key(a, 'ArrowRight')
            expect(b.checked).toBe(true)
            expect(a.checked).toBe(false)
            Key(b, 'ArrowDown')
            expect(c.checked).toBe(true)
        })

        it('wraps around at both ends', () => {
            const [a, , c] = Make(3)
            Key(c, 'ArrowRight')
            expect(a.checked).toBe(true)
            Key(a, 'ArrowLeft')
            expect(c.checked).toBe(true)
        })

        it('Home / End jump to first / last', () => {
            const [a, b, c] = Make(3)
            Key(b, 'End')
            expect(c.checked).toBe(true)
            Key(c, 'Home')
            expect(a.checked).toBe(true)
        })

        it('skips disabled controls', () => {
            const [a, b, c] = Make(3)
            b.disabled = true
            Key(a, 'ArrowRight')
            expect(c.checked).toBe(true)
            expect(b.checked).toBe(false)
        })

        it('stays put when every other control is disabled', () => {
            const [a, b, c] = Make(3)
            b.disabled = true
            c.disabled = true
            Key(a, 'ArrowRight')
            expect(a.checked).toBe(false)
            expect(b.checked || c.checked).toBe(false)
        })

        it('preventSelectionDuringSwitching (with initial-focus prevention) moves focus without selecting', () => {
            // NOTE: `preventSelectionDuringSwitching` alone is ineffective because the
            // programmatic `.focus()` fires `handleFocus`, which auto-selects unless
            // `preventSelectionDuringInitialFocus` is also set. Reported as a finding.
            const [a, b] = Make(2, {
                preventSelectionDuringSwitching: true,
                preventSelectionDuringInitialFocus: true,
            })
            Key(a, 'ArrowRight')
            expect(b.checked).toBe(false)
        })

        it('navigation dispatches input/change on the new item and calls onAfterNavigate', () => {
            const after = vi.fn()
            const [a, b] = Make(2, { onAfterNavigate: after })
            const change = vi.fn()
            b.addEventListener('change', change)
            Key(a, 'ArrowRight')
            expect(change).toHaveBeenCalledTimes(1)
            expect(after).toHaveBeenCalledWith(b)
        })

        it('dispatchNavigationClick clicks the new item without re-toggling', () => {
            const [a, b] = Make(2, { dispatchNavigationClick: true, canCancel: true })
            const click = vi.fn()
            b.addEventListener('click', click)
            Key(a, 'ArrowRight')
            expect(click).toHaveBeenCalledTimes(1)
            // canCancel would have flipped it back off if the click re-toggled.
            expect(b.checked).toBe(true)
        })
    })

    describe('pointer & focus', () => {
        it('does not suppress the next real click when a navigation click is stopped', () => {
            const [first, second] = Make(2, { canCancel: true, dispatchNavigationClick: true })
            second.addEventListener('click', (event) => event.stopImmediatePropagation(), {
                capture: true,
                once: true,
            })

            Key(first, 'ArrowRight')
            expect(second.checked).toBe(true)

            second.click()
            expect(second.checked).toBe(false)
        })

        it('click toggles selection and fires change', () => {
            const [a] = Make(1)
            const change = vi.fn()
            a.addEventListener('change', change)
            a.dispatchEvent(new MouseEvent('click', { bubbles: true }))
            expect(a.checked).toBe(true)
            expect(change).toHaveBeenCalledTimes(1)
        })

        it('click on disabled is default-prevented and ignored', () => {
            const [a] = Make(1)
            a.disabled = true
            const e = new MouseEvent('click', { bubbles: true, cancelable: true })
            a.dispatchEvent(e)
            expect(e.defaultPrevented).toBe(true)
            expect(a.checked).toBe(false)
        })

        it('focus auto-selects unless suppressed', () => {
            const [a, b] = Make(2)
            b.dispatchEvent(new FocusEvent('focus'))
            expect(b.checked).toBe(true)
            const [c] = Make(2, { preventSelectionDuringInitialFocus: true })
            c.dispatchEvent(new FocusEvent('focus'))
            expect(c.checked).toBe(false)
            expect(a.checked).toBe(false)
        })

        it('focus while a pointer is held does not select (so click emits change)', () => {
            const [a] = Make(2)
            a.dispatchEvent(new PointerEvent('pointerdown'))
            a.dispatchEvent(new FocusEvent('focus'))
            expect(a.checked).toBe(false)
            a.dispatchEvent(new PointerEvent('pointerup'))
            a.dispatchEvent(new FocusEvent('focus'))
            expect(a.checked).toBe(true)
        })

        it('pointercancel releases the pointer-down guard', () => {
            const [a] = Make(2)
            a.dispatchEvent(new PointerEvent('pointerdown'))
            a.dispatchEvent(new PointerEvent('pointercancel'))
            a.dispatchEvent(new FocusEvent('focus'))
            expect(a.checked).toBe(true)
        })
    })

    describe('lifecycle', () => {
        it('onConnected / onDisconnected fire once each', () => {
            const on = vi.fn()
            const off = vi.fn()
            const el = new Item({ onConnected: on, onDisconnected: off })
            document.body.appendChild(el)
            expect(on).toHaveBeenCalledTimes(1)
            el.remove()
            expect(off).toHaveBeenCalledTimes(1)
        })

        it('removes listeners on disconnect', () => {
            const [a] = Make(1)
            a.remove()
            a.dispatchEvent(new MouseEvent('click'))
            expect(a.checked).toBe(false)
        })

        it('re-connecting restores behavior without double-handling', () => {
            const [a] = Make(1, { canCancel: true })
            a.remove()
            document.body.appendChild(a)
            a.dispatchEvent(new MouseEvent('click', { bubbles: true }))
            expect(a.checked).toBe(true)
        })

        it('connecting a checked item enforces mutex against existing checked sibling', () => {
            const [a] = Make(1, undefined, 'life')
            a.checked = true
            const b = new Item()
            b.setAttribute('name', 'life')
            b.checked = true
            document.body.appendChild(b)
            expect(a.checked).toBe(false)
            expect(b.checked).toBe(true)
        })
    })

    describe('configure', () => {
        it('only applies provided options', () => {
            const [a, b] = Make(2, { canCancel: true })
            a.checked = true
            a.selection.configure({ multiple: true })
            b.checked = true
            a.selection.toggleSelection()
            expect(a.checked).toBe(false)
            a.selection.toggleSelection()
            expect(a.checked).toBe(true)
            expect(b.checked).toBe(true)
        })

        it('defaults', () => {
            const [a, b] = Make(2)
            const onChange = vi.fn()
            a.addEventListener('change', onChange)
            b.checked = true
            a.selection.toggleSelection()
            a.selection.toggleSelection()
            expect(a.checked).toBe(true)
            expect(b.checked).toBe(false)
            expect(onChange).toHaveBeenCalledTimes(1)
        })
    })
})
