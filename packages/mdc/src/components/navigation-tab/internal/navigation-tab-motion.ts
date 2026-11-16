/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Duration, Easing } from '@sandlada/mdk'
import {
    cancelTrackedAnimations,
    capturePresenceSnapshot,
    hasRunningAnimation,
    isInvertibleTransform,
    isReducedMotion,
    runScaleFadeTransition,
} from '../../../utils/motion'
import type { NavigationTabVariant } from '../navigation-tab.interface'

export { isReducedMotion }

export interface INavigationTabMotionElements {
    container        : HTMLElement | null
    indicator        : HTMLElement | null
    iconContainer    : HTMLElement | null
    defaultIcon      : HTMLElement | null
    activeIcon       : HTMLElement | null
    inactiveIcon     : HTMLElement | null
    inLabel          : HTMLElement | null
    outLabel         : HTMLElement | null
    badgeLabel       : HTMLElement | null
}

export interface INavigationTabMotionState {
    checked         : boolean
    variant         : NavigationTabVariant
    disabled        : boolean
    badge           : string
    hasActiveIcon   : boolean
    hasInactiveIcon : boolean
}

export interface INavigationTabMotionSnapshot {
    checkedChanged    : boolean
    variantChanged    : boolean
    disabledChanged   : boolean
    badgeChanged      : boolean
    prevChecked       : boolean
    prevVariant       : NavigationTabVariant
    prevBadge         : string
    containerRect     : DOMRect | null
    indicatorRect     : DOMRect | null
    iconRect          : DOMRect | null
    labelRect         : DOMRect | null
    indicatorOpacity  : string
    indicatorTransform: string
    indicatorBg       : string
    badgeOpacity      : string
    badgeTransform    : string
    iconOpacities     : { default: string; active: string; inactive: string }
    iconColor         : string
    labelColor        : string
}

const HorizontalIndicatorVariants = new Set<NavigationTabVariant>([
    'rail-horizontal',
    'drawer',
    'drawer-horizontal',
])

const RoundVariants = new Set<NavigationTabVariant>([
    'rail-round',
    'rail-xr-round',
])

function getVisibleLabel(
    variant: NavigationTabVariant,
    elements: INavigationTabMotionElements,
): HTMLElement | null {
    if (RoundVariants.has(variant)) return null
    return variant === 'bar-horizontal' ? elements.inLabel : elements.outLabel
}

function getVisibleIcon(
    checked: boolean,
    state: Pick<INavigationTabMotionState, 'hasActiveIcon' | 'hasInactiveIcon'>,
    elements: INavigationTabMotionElements,
): HTMLElement | null {
    if (checked) {
        return state.hasActiveIcon ? elements.activeIcon : elements.defaultIcon
    }
    return state.hasInactiveIcon ? elements.inactiveIcon : elements.defaultIcon
}

function safeRect(el: HTMLElement | null): DOMRect | null {
    if (!el) return null
    const rect = el.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0 ? rect : null
}

function safeComputedStyle(el: HTMLElement | null): CSSStyleDeclaration | null {
    if (!el || typeof getComputedStyle !== 'function') return null
    return getComputedStyle(el)
}

function playAnimation(
    tracker: Set<Animation>,
    el: HTMLElement | null,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions,
): Animation | null {
    if (!el || typeof el.animate !== 'function') return null
    const anim = el.animate(keyframes, { fill: 'none', ...options })
    tracker.add(anim)
    const cleanup = () => tracker.delete(anim)
    anim.addEventListener('finish', cleanup, { once: true })
    anim.addEventListener('cancel', cleanup, { once: true })
    return anim
}

function cancelElementAnimations(tracker: Set<Animation>, targets: Array<HTMLElement | null>): void {
    cancelTrackedAnimations(tracker, targets)
}

export function captureNavigationTabSnapshot(
    elements: INavigationTabMotionElements,
    prevState: INavigationTabMotionState,
    flags: {
        checkedChanged: boolean
        variantChanged: boolean
        disabledChanged: boolean
        badgeChanged: boolean
    },
): INavigationTabMotionSnapshot {
    const indicatorStyle = safeComputedStyle(elements.indicator)
    const prevLabel = getVisibleLabel(prevState.variant, elements)
    const prevIcon = getVisibleIcon(prevState.checked, prevState, elements)

    const indicatorRunning = hasRunningAnimation(elements.indicator)
    const rawTransform = indicatorStyle?.transform ?? ''
    const badgeSnapshot = flags.badgeChanged
        ? capturePresenceSnapshot(elements.badgeLabel, Boolean(prevState.badge))
        : { opacity: prevState.badge ? '1' : '0', transform: '' }

    return {
        ...flags,
        prevChecked       : prevState.checked,
        prevVariant       : prevState.variant,
        prevBadge         : prevState.badge,
        containerRect     : flags.variantChanged ? safeRect(elements.container) : null,
        indicatorRect     : flags.variantChanged ? safeRect(elements.indicator) : null,
        iconRect          : flags.variantChanged ? safeRect(elements.iconContainer) : null,
        labelRect         : flags.variantChanged ? safeRect(prevLabel) : null,
        indicatorOpacity  : indicatorRunning && indicatorStyle ? indicatorStyle.opacity : (prevState.checked ? '1' : '0'),
        indicatorTransform: indicatorRunning && isInvertibleTransform(rawTransform) ? rawTransform : '',
        indicatorBg       : indicatorStyle?.backgroundColor ?? '',
        badgeOpacity      : badgeSnapshot.opacity,
        badgeTransform    : badgeSnapshot.transform,
        iconOpacities     : {
            default : hasRunningAnimation(elements.defaultIcon)
                ? (safeComputedStyle(elements.defaultIcon)?.opacity ?? '0')
                : (!prevState.hasActiveIcon && !prevState.hasInactiveIcon ? '1' : '0'),
            active  : hasRunningAnimation(elements.activeIcon)
                ? (safeComputedStyle(elements.activeIcon)?.opacity ?? '0')
                : (prevState.checked && prevState.hasActiveIcon ? '1' : '0'),
            inactive: hasRunningAnimation(elements.inactiveIcon)
                ? (safeComputedStyle(elements.inactiveIcon)?.opacity ?? '0')
                : (!prevState.checked && prevState.hasInactiveIcon ? '1' : '0'),
        },
        iconColor : safeComputedStyle(prevIcon)?.color ?? '',
        labelColor: safeComputedStyle(prevLabel)?.color ?? '',
    }
}

export function runNavigationTabTransitions(
    tracker: Set<Animation>,
    elements: INavigationTabMotionElements,
    state: INavigationTabMotionState,
    snapshot: INavigationTabMotionSnapshot,
    callbacks?: { onBadgeExitComplete?: () => void },
): void {
    if (isReducedMotion()) return

    if (snapshot.checkedChanged) {
        animateCheckedState(tracker, elements, state, snapshot)
    }

    if (snapshot.variantChanged) {
        animateVariantState(tracker, elements, state, snapshot)
    }

    if (snapshot.disabledChanged && !snapshot.checkedChanged) {
        animateDisabledState(tracker, elements, state, snapshot)
    }

    if (snapshot.badgeChanged) {
        animateBadgeState(tracker, elements, state, snapshot, callbacks?.onBadgeExitComplete)
    }
}

function animateCheckedState(
    tracker: Set<Animation>,
    elements: INavigationTabMotionElements,
    state: INavigationTabMotionState,
    snapshot: INavigationTabMotionSnapshot,
): void {
    const spatialDuration = Duration.ExpressiveDefaultSpatial.Value
    const spatialEasing = Easing.ExpressiveDefaultSpatial.ToCSSValue()
    const effectsDuration = Duration.ExpressiveFastEffects.Value
    const effectsEasing = Easing.ExpressiveFastEffects.ToCSSValue()

    const isHorizontal = HorizontalIndicatorVariants.has(state.variant)
    const hiddenTransform = isHorizontal ? 'scaleX(0.88)' : 'scaleX(0.2) scaleY(0.82)'
    const shownTransform = isHorizontal ? 'scaleX(1)' : 'scaleX(1) scaleY(1)'

    if (elements.indicator) {
        cancelElementAnimations(tracker, [elements.indicator])
        const fromTransform = snapshot.indicatorTransform || (state.checked ? hiddenTransform : shownTransform)
        const fromOpacity = Number.parseFloat(snapshot.indicatorOpacity)
        const startOpacity = Number.isFinite(fromOpacity) ? fromOpacity : (state.checked ? 0 : 1)

        if (state.checked) {
            playAnimation(
                tracker,
                elements.indicator,
                [
                    { opacity: startOpacity, transform: fromTransform },
                    { opacity: 1, transform: shownTransform },
                ],
                { duration: spatialDuration, easing: spatialEasing },
            )
        } else {
            const fromFrame: Keyframe = { opacity: startOpacity, transform: fromTransform }
            const toFrame: Keyframe = { opacity: 0, transform: hiddenTransform }
            // Keep the previous non-transparent background while fading out so it does not muddle toward transparent black.
            if (snapshot.indicatorBg && snapshot.indicatorBg !== 'rgba(0, 0, 0, 0)' && snapshot.indicatorBg !== 'transparent') {
                fromFrame['backgroundColor'] = snapshot.indicatorBg
                toFrame['backgroundColor'] = snapshot.indicatorBg
            }
            playAnimation(
                tracker,
                elements.indicator,
                [fromFrame, toFrame],
                { duration: effectsDuration, easing: effectsEasing },
            )
        }
    }

    animateIconCheckedTransition(tracker, elements, state, snapshot, effectsDuration, effectsEasing)

    const currentLabel = getVisibleLabel(state.variant, elements)
    const afterLabelColor = safeComputedStyle(currentLabel)?.color ?? ''
    if (currentLabel && snapshot.labelColor && afterLabelColor && snapshot.labelColor !== afterLabelColor) {
        cancelElementAnimations(tracker, [currentLabel])
        playAnimation(
            tracker,
            currentLabel,
            [{ color: snapshot.labelColor }, { color: afterLabelColor }],
            { duration: effectsDuration, easing: effectsEasing },
        )
    }
}

function animateIconCheckedTransition(
    tracker: Set<Animation>,
    elements: INavigationTabMotionElements,
    state: INavigationTabMotionState,
    snapshot: INavigationTabMotionSnapshot,
    effectsDuration: number,
    effectsEasing: string,
): void {
    const iconTargets = [elements.defaultIcon, elements.activeIcon, elements.inactiveIcon]
    cancelElementAnimations(tracker, iconTargets)

    const incomingIcon = getVisibleIcon(state.checked, state, elements)
    const outgoingIcon = getVisibleIcon(!state.checked, state, elements)

    if (incomingIcon && outgoingIcon && incomingIcon !== outgoingIcon) {
        const incomingStartOpacity = resolveIconOpacity(incomingIcon, elements, snapshot.iconOpacities, 0)
        const outgoingStartOpacity = resolveIconOpacity(outgoingIcon, elements, snapshot.iconOpacities, 1)

        playAnimation(
            tracker,
            incomingIcon,
            [
                { opacity: incomingStartOpacity, transform: 'scale(0.85)' },
                { opacity: 1, transform: 'scale(1)' },
            ],
            { duration: effectsDuration, easing: effectsEasing },
        )
        playAnimation(
            tracker,
            outgoingIcon,
            [
                { opacity: outgoingStartOpacity, transform: 'scale(1)' },
                { opacity: 0, transform: 'scale(0.85)' },
            ],
            { duration: effectsDuration, easing: effectsEasing },
        )
        return
    }

    if (incomingIcon) {
        const afterColor = safeComputedStyle(incomingIcon)?.color ?? ''
        if (snapshot.iconColor && afterColor && snapshot.iconColor !== afterColor) {
            playAnimation(
                tracker,
                incomingIcon,
                [{ color: snapshot.iconColor }, { color: afterColor }],
                { duration: effectsDuration, easing: effectsEasing },
            )
        }

        if (state.checked && !snapshot.variantChanged && elements.iconContainer) {
            cancelElementAnimations(tracker, [elements.iconContainer])
            playAnimation(
                tracker,
                elements.iconContainer,
                [
                    { transform: 'scale(1)' },
                    { transform: 'scale(1.08)', offset: 0.45 },
                    { transform: 'scale(1)' },
                ],
                {
                    duration: Duration.ExpressiveFastSpatial.Value,
                    easing  : Easing.ExpressiveFastSpatial.ToCSSValue(),
                },
            )
        }
    }
}

function resolveIconOpacity(
    target: HTMLElement,
    elements: INavigationTabMotionElements,
    opacities: { default: string; active: string; inactive: string },
    fallback: number,
): number {
    let raw = ''
    if (target === elements.activeIcon) raw = opacities.active
    else if (target === elements.inactiveIcon) raw = opacities.inactive
    else raw = opacities.default
    const parsed = Number.parseFloat(raw)
    return Number.isFinite(parsed) ? parsed : fallback
}

function animateVariantState(
    tracker: Set<Animation>,
    elements: INavigationTabMotionElements,
    state: INavigationTabMotionState,
    snapshot: INavigationTabMotionSnapshot,
): void {
    const duration = Duration.ExpressiveDefaultSpatial.Value
    const easing = Easing.ExpressiveDefaultSpatial.ToCSSValue()

    if (state.checked && snapshot.indicatorRect && elements.indicator) {
        const afterRect = safeRect(elements.indicator)
        if (afterRect) {
            const dx = (snapshot.indicatorRect.left + snapshot.indicatorRect.width / 2)
                - (afterRect.left + afterRect.width / 2)
            const dy = (snapshot.indicatorRect.top + snapshot.indicatorRect.height / 2)
                - (afterRect.top + afterRect.height / 2)
            const sx = snapshot.indicatorRect.width / afterRect.width
            const sy = snapshot.indicatorRect.height / afterRect.height
            if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5 || Math.abs(sx - 1) > 0.02 || Math.abs(sy - 1) > 0.02) {
                cancelElementAnimations(tracker, [elements.indicator])
                playAnimation(
                    tracker,
                    elements.indicator,
                    [
                        { transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})` },
                        { transform: 'translate(0, 0) scale(1, 1)' },
                    ],
                    { duration, easing },
                )
            }
        }
    }

    if (snapshot.iconRect && elements.iconContainer) {
        const afterIconRect = safeRect(elements.iconContainer)
        if (afterIconRect) {
            const dx = (snapshot.iconRect.left + snapshot.iconRect.width / 2)
                - (afterIconRect.left + afterIconRect.width / 2)
            const dy = (snapshot.iconRect.top + snapshot.iconRect.height / 2)
                - (afterIconRect.top + afterIconRect.height / 2)
            if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
                cancelElementAnimations(tracker, [elements.iconContainer])
                playAnimation(
                    tracker,
                    elements.iconContainer,
                    [
                        { transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)` },
                        { transform: 'translate(0, 0)' },
                    ],
                    { duration, easing },
                )
            }
        }
    }

    const afterLabel = getVisibleLabel(state.variant, elements)
    const afterLabelStyle = safeComputedStyle(afterLabel)
    if (afterLabel && afterLabelStyle && afterLabelStyle.visibility !== 'hidden') {
        const afterLabelRect = safeRect(afterLabel)
        if (snapshot.labelRect && afterLabelRect) {
            const dx = snapshot.labelRect.left - afterLabelRect.left
            const dy = snapshot.labelRect.top - afterLabelRect.top
            const crossedLabelNodes = (snapshot.prevVariant === 'bar-horizontal') !== (state.variant === 'bar-horizontal')
            if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
                cancelElementAnimations(tracker, [afterLabel])
                playAnimation(
                    tracker,
                    afterLabel,
                    [
                        {
                            transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`,
                            opacity  : crossedLabelNodes ? 0.35 : 1,
                        },
                        { transform: 'translate(0, 0)', opacity: 1 },
                    ],
                    { duration, easing },
                )
            }
        } else if (!snapshot.labelRect && afterLabelRect) {
            cancelElementAnimations(tracker, [afterLabel])
            playAnimation(
                tracker,
                afterLabel,
                [
                    { opacity: 0, transform: 'translateY(-4px)' },
                    { opacity: 1, transform: 'translateY(0)' },
                ],
                {
                    duration: Duration.ExpressiveFastEffects.Value,
                    easing  : Easing.ExpressiveFastEffects.ToCSSValue(),
                },
            )
        }
    }
}

function animateDisabledState(
    tracker: Set<Animation>,
    elements: INavigationTabMotionElements,
    state: INavigationTabMotionState,
    snapshot: INavigationTabMotionSnapshot,
): void {
    const duration = Duration.ExpressiveFastEffects.Value
    const easing = Easing.ExpressiveFastEffects.ToCSSValue()

    const currentIcon = getVisibleIcon(state.checked, state, elements)
    const afterIconColor = safeComputedStyle(currentIcon)?.color ?? ''
    if (currentIcon && snapshot.iconColor && afterIconColor && snapshot.iconColor !== afterIconColor) {
        cancelElementAnimations(tracker, [currentIcon])
        playAnimation(tracker, currentIcon, [{ color: snapshot.iconColor }, { color: afterIconColor }], { duration, easing })
    }

    const currentLabel = getVisibleLabel(state.variant, elements)
    const afterLabelColor = safeComputedStyle(currentLabel)?.color ?? ''
    if (currentLabel && snapshot.labelColor && afterLabelColor && snapshot.labelColor !== afterLabelColor) {
        cancelElementAnimations(tracker, [currentLabel])
        playAnimation(tracker, currentLabel, [{ color: snapshot.labelColor }, { color: afterLabelColor }], { duration, easing })
    }

    if (state.checked && elements.indicator) {
        const afterBg = safeComputedStyle(elements.indicator)?.backgroundColor ?? ''
        if (snapshot.indicatorBg && afterBg && snapshot.indicatorBg !== afterBg) {
            cancelElementAnimations(tracker, [elements.indicator])
            playAnimation(
                tracker,
                elements.indicator,
                [{ backgroundColor: snapshot.indicatorBg }, { backgroundColor: afterBg }],
                { duration, easing },
            )
        }
    }
}

function animateBadgeState(
    tracker: Set<Animation>,
    elements: INavigationTabMotionElements,
    state: INavigationTabMotionState,
    snapshot: INavigationTabMotionSnapshot,
    onExitComplete?: () => void,
): void {
    const isUpdate = Boolean(state.badge && snapshot.prevBadge)
    runScaleFadeTransition(
        tracker,
        elements.badgeLabel,
        Boolean(state.badge),
        { opacity: snapshot.badgeOpacity, transform: snapshot.badgeTransform },
        {
            startOpacity: isUpdate ? 0.7 : 0,
            startScale  : isUpdate ? 0.85 : 0.6,
            onExitComplete,
        },
    )
}
