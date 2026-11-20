/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { PullToRefreshState } from '../pull-to-refresh.interface'

/**
 * Applies Android Compose-style drag multiplier and asymptotic resistance past
 * `threshold`, clamping the resulting pull distance to `[0, maxPullDistance]`.
 */
export function applyPullResistance(
    rawDeltaY: number,
    threshold: number,
    maxPullDistance: number,
    dragMultiplier = 0.5,
): number {
    if (!Number.isFinite(threshold) || threshold <= 0) {
        throw new Error(`PullToRefresh threshold must be a positive number, received ${threshold}`)
    }
    if (!Number.isFinite(maxPullDistance) || maxPullDistance < threshold) {
        throw new Error(
            `PullToRefresh maxPullDistance (${maxPullDistance}) must be >= threshold (${threshold})`
        )
    }
    if (!Number.isFinite(dragMultiplier) || dragMultiplier <= 0 || dragMultiplier > 1) {
        throw new Error(
            `PullToRefresh dragMultiplier must be in (0, 1], received ${dragMultiplier}`
        )
    }

    if (!Number.isFinite(rawDeltaY) || rawDeltaY <= 0) {
        return 0
    }

    const scaled = rawDeltaY * dragMultiplier
    if (scaled <= threshold) {
        return scaled
    }

    const headroom = maxPullDistance - threshold
    if (headroom <= 0) {
        return threshold
    }

    const excess = scaled - threshold
    return threshold + headroom * (1 - Math.exp(-excess / headroom))
}

/**
 * Computes normalized `[0, 1]` pull progress relative to `threshold`.
 */
export function computePullProgress(distance: number, threshold: number): number {
    if (!Number.isFinite(threshold) || threshold <= 0) {
        throw new Error(`PullToRefresh threshold must be a positive number, received ${threshold}`)
    }
    if (!Number.isFinite(distance) || distance <= 0) {
        return 0
    }
    return Math.min(1, distance / threshold)
}

/**
 * Resolves the lifecycle state from current `distance`, `threshold`, and `refreshing`.
 */
export function resolvePullState(
    distance: number,
    threshold: number,
    refreshing: boolean,
): PullToRefreshState {
    if (refreshing) {
        return PullToRefreshState.Refreshing
    }
    if (distance <= 0) {
        return PullToRefreshState.Idle
    }
    if (distance >= threshold) {
        return PullToRefreshState.Ready
    }
    return PullToRefreshState.Pulling
}

/**
 * Computes visual scale `[0, 1]` for the floating indicator container.
 */
export function computeIndicatorScale(progress: number, state: PullToRefreshState): number {
    if (state === PullToRefreshState.Refreshing || state === PullToRefreshState.Ready) {
        return 1
    }
    if (state === PullToRefreshState.Idle || progress <= 0) {
        return 0
    }
    return Math.min(1, Math.max(0, progress))
}
