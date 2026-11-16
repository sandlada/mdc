/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import {
    cancelTrackedAnimations,
    capturePresenceSnapshot,
    isReducedMotion,
    runScaleFadeTransition,
    type IPresenceSnapshot,
} from '../../../utils/motion'

export type IBadgeVisibilitySnapshot = IPresenceSnapshot

export function isBadgeReducedMotion(): boolean {
    return isReducedMotion()
}

export function captureBadgeVisibilitySnapshot(
    container: HTMLElement | null,
    prevHidden: boolean,
): IBadgeVisibilitySnapshot {
    return capturePresenceSnapshot(container, !prevHidden)
}

export function cancelBadgeAnimations(tracker: Set<Animation>): void {
    cancelTrackedAnimations(tracker)
}

export function runBadgeVisibilityTransition(
    tracker: Set<Animation>,
    container: HTMLElement | null,
    hidden: boolean,
    snapshot: IBadgeVisibilitySnapshot,
    onExitComplete?: () => void,
): void {
    runScaleFadeTransition(tracker, container, !hidden, snapshot, { onExitComplete })
}
