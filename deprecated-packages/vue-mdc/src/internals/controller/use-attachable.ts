/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { computed, onBeforeUnmount, onMounted, ref, watch, type ComputedRef, type Ref, type WritableComputedRef } from 'vue'
import { isServer } from '../../utils'

/**
 * An object that can be attached to an associated controlling element.
 * Represents the public API of the attachable logic.
 */
export interface IAttachable {
    /**
     * Reflects the value of the `for` attribute on the host element.
     * Setting this property updates the attribute. Setting it also
     * implies that the source of the `control` is the `for` attribute,
     * overriding any previous imperative `attach` call.
     */
    readonly htmlFor: WritableComputedRef<string | null>

    /**
     * Gets the element that controls the attachable element. It is one of:
     *
     * - The control referenced by the `for` attribute (if present and not empty).
     * - The control provided to `element.attach(control)` (if `attach` was called).
     * - The element's parent (if no `for` and no imperative attachment).
     * - `null` if detached (via `detach()` or `for=""`) or not connected.
     *
     * This is a reactive property.
     */
    readonly control: ComputedRef<HTMLElement | null>

    readonly host: ComputedRef<IAttachableHost | null>
    readonly hostRef: Ref<IAttachableHost | null>

    /**
     * Attaches the element to an interactive control imperatively.
     * This overrides the `for` attribute.
     *
     * @param control The element that controls the attachable element.
     */
    attach(control: HTMLElement): void

    /**
     * Detaches the element from its current control.
     * Sets the `for` attribute to `""` to prevent parent fallback.
     */
    detach(): void
}

export const SAttachableController = Symbol('attachableController')

export interface IAttachableHost extends HTMLElement {
    [SAttachableController]: IAttachable
}

/**
 * A composable function that provides attachable element logic for a Vue component.
 *
 * It manages the association between the host element (the element the composable
 * is used on) and a 'control' element based on the host's 'for' attribute,
 * imperative `attach`/`detach` calls, or the parent element.
 *
 * @param hostRef A Vue Ref pointing to the host HTMLElement. This ref
 *   should be assigned to the component's root element or the element that needs
 *   the attachable behavior. The element must be connected to the DOM for
 *   'for' attribute lookup and parent element fallback to work correctly.
 * @param onControlChange A callback function that is called whenever the
 *   `control` element changes. Receives the previous and next control elements.
 * @returns An object implementing the `IAttachable` interface.
 */
export function useAttachable(
    hostRef: Ref<HTMLElement | null>,
    onControlChange: (prev: HTMLElement | null | undefined, next: HTMLElement | null | undefined) => void
): IAttachable {

    const currentControl = ref<HTMLElement | null>(null)
    const forAttribute = ref<string | null>(null)
    const isAttached = ref(false)

    let observer: MutationObserver | null = null

    /**
     * Reactive computed property reflecting the 'for' attribute.
     * Setting this updates the attribute on the host element.
     */
    const htmlFor = computed<string | null>({
        get: () => forAttribute.value,
        set: (value: string | null) => {
            const host = hostRef.value
            if (!host) {
                console.warn('useAttachable: Cannot set htmlFor, host element ref is null.')
                return
            }

            isAttached.value = false

            if (value === null) {
                if (host.hasAttribute('for')) {
                    host.removeAttribute('for')
                }
            } else {
                if (host.getAttribute('for') !== value) {
                    host.setAttribute('for', value)
                }
            }
        }
    })

    const hostComputed = computed<IAttachableHost | null>(() => {
        const _host = hostRef.value as IAttachableHost | null
        if (!_host) {
            return null
        }
        return _host
    })

    /**
     * Reactive computed property for the currently determined control element.
     * Its value depends on the internal state (isAttached,
     * currentControl, forAttribute) and the host element's parent.
     */
    const control = computed<HTMLElement | null>(() => {
        const host = hostRef.value
        if (!host) {
            return null
        }

        if (isAttached.value) {
            return currentControl.value
        }

        const htmlForValue = forAttribute.value
        if (htmlForValue !== null) {
            if (htmlForValue === '' || !host.isConnected) {
                return null
            }
            // Query using getRootNode() for Shadow DOM compatibility
            return (host.getRootNode() as Document | ShadowRoot).querySelector<HTMLElement>(`#${htmlForValue} `)
        }

        // No 'for' attribute and not imperatively attached, fallback to parentElement
        // This matches the original Lit logic unless for="" was set.
        return host.parentElement
    })

    const attach: IAttachable['attach'] = (controlElement: HTMLElement) => {
        const host = hostRef.value
        if (!host) {
            console.warn('useAttachable: Cannot attach, host element ref is null.')
            return
        }

        // Only update if the target control or source (imperative vs attribute) is different
        if (isAttached.value && currentControl.value === controlElement) {
            if (host.hasAttribute('for')) {
                host.removeAttribute('for')
            }
            return
        }

        isAttached.value = true
        currentControl.value = controlElement

        if (host.hasAttribute('for')) {
            host.removeAttribute('for')
        }
    }

    const detach: IAttachable['detach'] = () => {
        const host = hostRef.value
        if (!host) {
            console.warn('useAttachable: Cannot detach, host element ref is null.')
            return
        }

        isAttached.value = false
        currentControl.value = null

        if (host.getAttribute('for') !== '') {
            host.setAttribute('for', '')
        }
    }

    onMounted(() => {
        if (isServer()) {
            return
        }

        const host = hostRef.value as IAttachableHost | null
        if (!host) {
            console.error("useAttachable: Host element ref is null on mount. Attachable logic will not function.")
            return
        }

        forAttribute.value = host.getAttribute('for') ?? null

        observer = new MutationObserver((records) => {
            for (const record of records) {
                const targetElement = record.target as HTMLElement
                const newHtmlFor = targetElement.getAttribute('for') ?? null

                forAttribute.value = newHtmlFor

                if (isAttached.value && newHtmlFor !== null) {
                    isAttached.value = false
                    currentControl.value = null
                }
            }
        })

        observer.observe(host, { attributeFilter: ['for'] })

        host[SAttachableController] = ({
            detach,
            attach,
            htmlFor,
            control,
            host: hostComputed,
            hostRef: hostRef as Ref<IAttachableHost | null>,
        })
    })

    onBeforeUnmount(() => {
        observer?.disconnect()
        observer = null
        detach()
    })

    watch(control, (newControl, prevControl) => {
        if (prevControl !== newControl) {
            onControlChange(prevControl, newControl)
        }
    }, { immediate: true })

    return {
        htmlFor,
        control,
        host: hostComputed,
        hostRef: hostRef as Ref<IAttachableHost | null>,
        attach,
        detach,
    }
}
