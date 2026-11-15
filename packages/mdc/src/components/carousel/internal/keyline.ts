/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Pure-functional Material Design 3 Carousel keyline layout engine.
 *
 * Mirrors the Jetpack Compose Material 3 `KeylineList` / `Strategy` math:
 * items dynamically morph their width and corner roundness as they travel
 * across keylines during scroll, with smooth start/end shifting so the
 * container remains filled edge-to-edge at every scroll offset.
 */
import { CarouselItemSize, CarouselVariant } from '../carousel.interface'

/** Default offscreen anchor size (matches Compose M3 `CarouselDefaults.AnchorSize`). */
export const DefaultAnchorSize = 10

/** A single keyline along the carousel's main axis. */
export interface Keyline {
    readonly size: number
    readonly offset: number
    readonly unadjustedOffset: number
    readonly isFocal: boolean
    readonly isAnchor: boolean
}

/** Precomputed keyline strategy for a given container width, item count, and variant. */
export interface KeylineStrategy {
    readonly variant: CarouselVariant
    readonly availableSpace: number
    readonly clipPaddingStart: number
    readonly clipPaddingEnd: number
    readonly itemSpacing: number
    readonly focalSize: number
    readonly smallSize: number
    readonly mediumSize: number
    readonly step: number
    readonly maxScroll: number
    readonly itemCount: number
    readonly defaultKeylines: readonly Keyline[]
    readonly startKeylines: readonly Keyline[]
    readonly endKeylines: readonly Keyline[]
    readonly startShiftDistance: number
    readonly endShiftDistance: number
}

/** Computed layout for a single `mdc-carousel-item` at a specific scroll offset. */
export interface CarouselItemLayout {
    readonly index: number
    readonly left: number
    readonly width: number
    readonly size: CarouselItemSize
    /** Normalized size ratio from `0` (small/anchor) to `1` (focal/large). */
    readonly ratio: number
    readonly visible: boolean
}

export interface KeylineStrategyOptions {
    readonly variant: CarouselVariant
    readonly availableSpace: number
    readonly itemCount: number
    readonly preferredItemWidth: number
    readonly itemSpacing: number
    readonly minSmallItemWidth: number
    readonly maxSmallItemWidth: number
    readonly anchorSize?: number
    readonly clipPaddingStart?: number
    readonly clipPaddingEnd?: number
}

interface Arrangement {
    readonly largeCount: number
    readonly largeSize: number
    readonly mediumCount: number
    readonly mediumSize: number
    readonly smallCount: number
    readonly smallSize: number
    readonly cost: number
}

const clamp = (min: number, max: number) => (value: number): number =>
    Math.min(max, Math.max(min, value))

const lerp = (start: number, end: number, t: number): number =>
    start + (end - start) * t

/**
 * Finds the lowest-cost `(large, medium, small)` arrangement for `multi-browse`
 * that fills `availableSpace` cleanly while keeping `largeSize` close to `preferredItemWidth`.
 */
function findMultiBrowseArrangement(
    availableSpace: number,
    itemCount: number,
    preferredItemWidth: number,
    itemSpacing: number,
    minSmall: number,
    maxSmall: number,
): Arrangement {
    const targetLarge = clamp(1, availableSpace)(preferredItemWidth)
    const clampSmall = clamp(minSmall, maxSmall)

    const smallCounts = itemCount <= 1 ? [0] : [1, 0]
    const mediumCounts = itemCount <= 2 ? [0] : [1, 0]
    const maxLargeCount = Math.max(1, Math.ceil(availableSpace / Math.max(1, targetLarge)))

    let best: Arrangement | null = null

    for (let largeCount = 1; largeCount <= maxLargeCount; largeCount++) {
        for (const mediumCount of mediumCounts) {
            for (const smallCount of smallCounts) {
                const totalVisible = largeCount + mediumCount + smallCount
                if (totalVisible === 0 || totalVisible > itemCount) continue

                const spaceForItems = availableSpace - (totalVisible - 1) * itemSpacing
                if (spaceForItems <= 0) continue

                let largeSize: number
                let mediumSize: number
                let smallSize: number

                if (mediumCount === 0 && smallCount === 0) {
                    largeSize = spaceForItems / largeCount
                    smallSize = clampSmall(largeSize / 3)
                    mediumSize = (largeSize + smallSize) / 2
                } else if (mediumCount === 0) {
                    const idealSmall = (spaceForItems - largeCount * targetLarge) / smallCount
                    smallSize = clampSmall(idealSmall)
                    largeSize = (spaceForItems - smallCount * smallSize) / largeCount
                    mediumSize = (largeSize + smallSize) / 2
                } else if (smallCount === 0) {
                    // Fallback when no small item fits
                    largeSize = Math.min(targetLarge, spaceForItems / (largeCount + 0.5))
                    mediumSize = (spaceForItems - largeCount * largeSize) / mediumCount
                    smallSize = clampSmall(largeSize / 3)
                } else {
                    // Solve: largeCount * L + mediumCount * ((L + S) / 2) + smallCount * S = spaceForItems
                    const largeCoeff = largeCount + mediumCount * 0.5
                    const smallCoeff = smallCount + mediumCount * 0.5
                    const idealSmall = (spaceForItems - largeCoeff * targetLarge) / smallCoeff
                    smallSize = clampSmall(idealSmall)
                    largeSize = (spaceForItems - smallCoeff * smallSize) / largeCoeff
                    mediumSize = (largeSize + smallSize) / 2
                }

                if (largeSize < mediumSize || mediumSize < smallSize || smallSize <= 0) {
                    continue
                }

                // Prefer arrangements that include small/medium items when items >= 3
                // without shrinking large items excessively.
                const missingSmallPenalty = itemCount >= 2 && smallCount === 0 ? 500 : 0
                const missingMediumPenalty = itemCount >= 3 && mediumCount === 0 ? 150 : 0
                const cost = Math.abs(targetLarge - largeSize) + missingSmallPenalty + missingMediumPenalty

                if (!best || cost < best.cost) {
                    best = {
                        largeCount,
                        largeSize,
                        mediumCount,
                        mediumSize,
                        smallCount,
                        smallSize,
                        cost,
                    }
                }
            }
        }
    }

    if (best) return best

    // Ultimate fallback for very narrow containers
    const fallbackLarge = availableSpace
    const fallbackSmall = Math.min(minSmall, fallbackLarge)
    return {
        largeCount: 1,
        largeSize: fallbackLarge,
        mediumCount: 0,
        mediumSize: (fallbackLarge + fallbackSmall) / 2,
        smallCount: 0,
        smallSize: fallbackSmall,
        cost: 0,
    }
}

/**
 * Builds a `KeylineList` from an ordered list of `{ size, isFocal }` descriptors,
 * wrapping them with start/end offscreen anchor keylines.
 */
function buildKeylineList(
    descriptors: ReadonlyArray<{ size: number; isFocal: boolean }>,
    availableSpace: number,
    itemSpacing: number,
    anchorSize: number,
    focalSize: number,
    anchorFocalIndex: number,
    anchorFocalUnadjustedOffset: number,
    clipPaddingStart: number,
    clipPaddingEnd: number,
): readonly Keyline[] {
    const step = focalSize + itemSpacing
    const result: Keyline[] = []

    const startAnchorOffset = -clipPaddingStart - anchorSize / 2
    const startAnchorUnadjusted = anchorFocalUnadjustedOffset - (anchorFocalIndex + 1) * step
    result.push({
        size: anchorSize,
        offset: startAnchorOffset,
        unadjustedOffset: startAnchorUnadjusted,
        isFocal: false,
        isAnchor: true,
    })

    let x = 0
    for (let i = 0; i < descriptors.length; i++) {
        const desc = descriptors[i]
        const offset = x + desc.size / 2
        const unadjustedOffset = anchorFocalUnadjustedOffset + (i - anchorFocalIndex) * step
        result.push({
            size: desc.size,
            offset,
            unadjustedOffset,
            isFocal: desc.isFocal,
            isAnchor: false,
        })
        x += desc.size + itemSpacing
    }

    const endAnchorOffset = availableSpace + clipPaddingEnd + anchorSize / 2
    const endAnchorUnadjusted = anchorFocalUnadjustedOffset + (descriptors.length - anchorFocalIndex) * step
    result.push({
        size: anchorSize,
        offset: endAnchorOffset,
        unadjustedOffset: endAnchorUnadjusted,
        isFocal: false,
        isAnchor: true,
    })

    return result
}

/**
 * Builds a complete `KeylineStrategy` for the given carousel configuration.
 */
export function buildKeylineStrategy(options: KeylineStrategyOptions): KeylineStrategy {
    const {
        variant,
        availableSpace,
        itemCount,
        preferredItemWidth,
        itemSpacing,
        minSmallItemWidth,
        maxSmallItemWidth,
        anchorSize = DefaultAnchorSize,
        clipPaddingStart = 16,
        clipPaddingEnd = 16,
    } = options

    if (availableSpace <= 0 || itemCount <= 0) {
        return {
            variant,
            availableSpace: Math.max(0, availableSpace),
            clipPaddingStart,
            clipPaddingEnd,
            itemSpacing,
            focalSize: 0,
            smallSize: minSmallItemWidth,
            mediumSize: minSmallItemWidth,
            step: 0,
            maxScroll: 0,
            itemCount,
            defaultKeylines: [],
            startKeylines: [],
            endKeylines: [],
            startShiftDistance: 0,
            endShiftDistance: 0,
        }
    }

    if (variant === CarouselVariant.Uncontained) {
        const focalSize = clamp(1, availableSpace)(preferredItemWidth)
        const smallSize = clamp(minSmallItemWidth, maxSmallItemWidth)(focalSize / 3)
        const mediumSize = (focalSize + smallSize) / 2
        const step = focalSize + itemSpacing
        const totalContent = itemCount * focalSize + Math.max(0, itemCount - 1) * itemSpacing
        const maxScroll = Math.max(0, totalContent - availableSpace)
        return {
            variant,
            availableSpace,
            clipPaddingStart,
            clipPaddingEnd,
            itemSpacing,
            focalSize,
            smallSize,
            mediumSize,
            step,
            maxScroll,
            itemCount,
            defaultKeylines: [],
            startKeylines: [],
            endKeylines: [],
            startShiftDistance: 0,
            endShiftDistance: 0,
        }
    }

    if (variant === CarouselVariant.FullScreen) {
        const focalSize = availableSpace
        const step = focalSize + itemSpacing
        const descriptors = [{ size: focalSize, isFocal: true }]
        const keylines = buildKeylineList(descriptors, availableSpace, itemSpacing, anchorSize, focalSize, 0, focalSize / 2, clipPaddingStart, clipPaddingEnd)
        return {
            variant,
            availableSpace,
            clipPaddingStart,
            clipPaddingEnd,
            itemSpacing,
            focalSize,
            smallSize: minSmallItemWidth,
            mediumSize: focalSize,
            step,
            maxScroll: Math.max(0, (itemCount - 1) * step),
            itemCount,
            defaultKeylines: keylines,
            startKeylines: keylines,
            endKeylines: keylines,
            startShiftDistance: 0,
            endShiftDistance: 0,
        }
    }

    if (variant === CarouselVariant.Hero) {
        const hasPeek = itemCount > 1 && availableSpace > minSmallItemWidth + itemSpacing + 1
        const smallSize = hasPeek ? clamp(minSmallItemWidth, maxSmallItemWidth)(availableSpace * 0.15) : 0
        const focalSize = hasPeek ? availableSpace - smallSize - itemSpacing : availableSpace
        const step = focalSize + itemSpacing
        const defaultDesc = hasPeek
            ? [{ size: focalSize, isFocal: true }, { size: smallSize, isFocal: false }]
            : [{ size: focalSize, isFocal: true }]
        const endDesc = [...defaultDesc].reverse()

        const defaultKeylines = buildKeylineList(defaultDesc, availableSpace, itemSpacing, anchorSize, focalSize, 0, focalSize / 2, clipPaddingStart, clipPaddingEnd)
        const endFocalIdx = endDesc.length - 1
        const endKeylines = buildKeylineList(endDesc, availableSpace, itemSpacing, anchorSize, focalSize, endFocalIdx, focalSize / 2, clipPaddingStart, clipPaddingEnd)
        const endShiftDistance = hasPeek ? step : 0

        return {
            variant,
            availableSpace,
            clipPaddingStart,
            clipPaddingEnd,
            itemSpacing,
            focalSize,
            smallSize: smallSize || minSmallItemWidth,
            mediumSize: (focalSize + (smallSize || minSmallItemWidth)) / 2,
            step,
            maxScroll: Math.max(0, (itemCount - 1) * step),
            itemCount,
            defaultKeylines,
            startKeylines: defaultKeylines,
            endKeylines,
            startShiftDistance: 0,
            endShiftDistance,
        }
    }

    if (variant === CarouselVariant.CenteredHero) {
        if (itemCount === 1) {
            const focalSize = availableSpace
            const step = focalSize + itemSpacing
            const keylines = buildKeylineList([{ size: focalSize, isFocal: true }], availableSpace, itemSpacing, anchorSize, focalSize, 0, focalSize / 2, clipPaddingStart, clipPaddingEnd)
            return {
                variant,
                availableSpace,
                clipPaddingStart,
                clipPaddingEnd,
                itemSpacing,
                focalSize,
                smallSize: minSmallItemWidth,
                mediumSize: focalSize,
                step,
                maxScroll: 0,
                itemCount,
                defaultKeylines: keylines,
                startKeylines: keylines,
                endKeylines: keylines,
                startShiftDistance: 0,
                endShiftDistance: 0,
            }
        }

        if (itemCount === 2) {
            const smallSize = clamp(minSmallItemWidth, maxSmallItemWidth)(availableSpace * 0.15)
            const focalSize = availableSpace - smallSize - itemSpacing
            const step = focalSize + itemSpacing
            const startDesc = [{ size: focalSize, isFocal: true }, { size: smallSize, isFocal: false }]
            const endDesc = [{ size: smallSize, isFocal: false }, { size: focalSize, isFocal: true }]
            const defaultKeylines = buildKeylineList(startDesc, availableSpace, itemSpacing, anchorSize, focalSize, 0, focalSize / 2, clipPaddingStart, clipPaddingEnd)
            const endKeylines = buildKeylineList(endDesc, availableSpace, itemSpacing, anchorSize, focalSize, 1, focalSize / 2, clipPaddingStart, clipPaddingEnd)
            return {
                variant,
                availableSpace,
                clipPaddingStart,
                clipPaddingEnd,
                itemSpacing,
                focalSize,
                smallSize,
                mediumSize: (focalSize + smallSize) / 2,
                step,
                maxScroll: step,
                itemCount,
                defaultKeylines,
                startKeylines: defaultKeylines,
                endKeylines,
                startShiftDistance: 0,
                endShiftDistance: step,
            }
        }

        // 3+ items: Small | Large | Small in the middle, Large | Small | Small at start, Small | Small | Large at end.
        const smallSize = clamp(minSmallItemWidth, maxSmallItemWidth)(availableSpace * 0.15)
        const focalSize = Math.max(1, availableSpace - 2 * smallSize - 2 * itemSpacing)
        const step = focalSize + itemSpacing

        const defaultDesc = [
            { size: smallSize, isFocal: false },
            { size: focalSize, isFocal: true },
            { size: smallSize, isFocal: false },
        ]
        const startDesc = [
            { size: focalSize, isFocal: true },
            { size: smallSize, isFocal: false },
            { size: smallSize, isFocal: false },
        ]
        const endDesc = [
            { size: smallSize, isFocal: false },
            { size: smallSize, isFocal: false },
            { size: focalSize, isFocal: true },
        ]

        const firstFocalUnadjusted = focalSize / 2
        const defaultKeylines = buildKeylineList(defaultDesc, availableSpace, itemSpacing, anchorSize, focalSize, 1, firstFocalUnadjusted, clipPaddingStart, clipPaddingEnd)
        const startKeylines = buildKeylineList(startDesc, availableSpace, itemSpacing, anchorSize, focalSize, 0, firstFocalUnadjusted, clipPaddingStart, clipPaddingEnd)
        const endKeylines = buildKeylineList(endDesc, availableSpace, itemSpacing, anchorSize, focalSize, 2, firstFocalUnadjusted, clipPaddingStart, clipPaddingEnd)

        return {
            variant,
            availableSpace,
            clipPaddingStart,
            clipPaddingEnd,
            itemSpacing,
            focalSize,
            smallSize,
            mediumSize: (focalSize + smallSize) / 2,
            step,
            maxScroll: Math.max(0, (itemCount - 1) * step),
            itemCount,
            defaultKeylines,
            startKeylines,
            endKeylines,
            startShiftDistance: step,
            endShiftDistance: step,
        }
    }

    // Multi-browse (default)
    const arrangement = findMultiBrowseArrangement(
        availableSpace,
        itemCount,
        preferredItemWidth,
        itemSpacing,
        minSmallItemWidth,
        maxSmallItemWidth,
    )
    const focalSize = arrangement.largeSize
    const step = focalSize + itemSpacing
    const defaultDesc: Array<{ size: number; isFocal: boolean }> = []
    for (let i = 0; i < arrangement.largeCount; i++) {
        defaultDesc.push({ size: arrangement.largeSize, isFocal: true })
    }
    for (let i = 0; i < arrangement.mediumCount; i++) {
        defaultDesc.push({ size: arrangement.mediumSize, isFocal: false })
    }
    for (let i = 0; i < arrangement.smallCount; i++) {
        defaultDesc.push({ size: arrangement.smallSize, isFocal: false })
    }

    const endDesc = [...defaultDesc].reverse()
    const firstFocalUnadjusted = focalSize / 2
    const defaultKeylines = buildKeylineList(defaultDesc, availableSpace, itemSpacing, anchorSize, focalSize, 0, firstFocalUnadjusted, clipPaddingStart, clipPaddingEnd)
    const endFocalIdx = endDesc.length - 1
    const endKeylines = buildKeylineList(endDesc, availableSpace, itemSpacing, anchorSize, focalSize, endFocalIdx, firstFocalUnadjusted, clipPaddingStart, clipPaddingEnd)

    const endShiftSteps = Math.min(itemCount - 1, endFocalIdx)
    return {
        variant,
        availableSpace,
        clipPaddingStart,
        clipPaddingEnd,
        itemSpacing,
        focalSize,
        smallSize: arrangement.smallSize,
        mediumSize: arrangement.mediumSize,
        step,
        maxScroll: Math.max(0, (itemCount - 1) * step),
        itemCount,
        defaultKeylines,
        startKeylines: defaultKeylines,
        endKeylines,
        startShiftDistance: 0,
        endShiftDistance: Math.max(0, endShiftSteps * step),
    }
}

function interpolateKeylineLists(a: readonly Keyline[], b: readonly Keyline[], t: number): readonly Keyline[] {
    if (t <= 0) return a
    if (t >= 1) return b
    return a.map((ka, i) => {
        const kb = b[i] ?? ka
        return {
            size: lerp(ka.size, kb.size, t),
            offset: lerp(ka.offset, kb.offset, t),
            unadjustedOffset: lerp(ka.unadjustedOffset, kb.unadjustedOffset, t),
            isFocal: t < 0.5 ? ka.isFocal : kb.isFocal,
            isAnchor: ka.isAnchor,
        }
    })
}

/**
 * Returns the active `KeylineList` for a given `scrollOffset`, smoothly
 * interpolating between start/default/end keylines near the bounds.
 */
export function getKeylineListForScroll(strategy: KeylineStrategy, scrollOffset: number): readonly Keyline[] {
    const {
        defaultKeylines,
        startKeylines,
        endKeylines,
        startShiftDistance,
        endShiftDistance,
        maxScroll,
    } = strategy

    if (!defaultKeylines.length) return defaultKeylines
    const clampedScroll = clamp(0, maxScroll)(scrollOffset)

    if (maxScroll <= 0) return startKeylines

    // If start and end shift zones overlap (very few items), blend proportionally
    if (startShiftDistance > 0 && clampedScroll < startShiftDistance) {
        const t = clampedScroll / startShiftDistance
        return interpolateKeylineLists(startKeylines, defaultKeylines, t)
    }

    const endStart = Math.max(startShiftDistance, maxScroll - endShiftDistance)
    if (endShiftDistance > 0 && clampedScroll > endStart) {
        const t = (clampedScroll - endStart) / Math.max(1, maxScroll - endStart)
        return interpolateKeylineLists(defaultKeylines, endKeylines, t)
    }

    return defaultKeylines
}

/**
 * Maps a continuous width to a semantic `CarouselItemSize` (`'small'` | `'medium'` | `'large'`).
 */
export function classifyItemSize(
    width: number,
    focalSize: number,
    mediumSize: number,
    smallSize: number,
): CarouselItemSize {
    const largeThreshold = (focalSize + mediumSize) / 2
    const smallThreshold = (mediumSize + smallSize) / 2
    if (width >= largeThreshold) return CarouselItemSize.Large
    if (width <= smallThreshold) return CarouselItemSize.Small
    return CarouselItemSize.Medium
}

/**
 * Computes the exact `(left, width, size, ratio, visible)` layout for every item
 * at the given `scrollOffset`.
 */
export function computeItemLayouts(
    strategy: KeylineStrategy,
    scrollOffset: number,
): readonly CarouselItemLayout[] {
    const { itemCount, focalSize, smallSize, mediumSize, step, availableSpace, clipPaddingStart, clipPaddingEnd } = strategy
    if (itemCount <= 0 || availableSpace <= 0) return []

    const keylines = getKeylineListForScroll(strategy, scrollOffset)
    if (keylines.length < 2) return []

    const firstUnadjustedCenter = focalSize / 2
    const clampedScroll = clamp(0, strategy.maxScroll)(scrollOffset)
    const minVisibleWidth = 0.5
    const sizeRange = Math.max(1, focalSize - smallSize)

    const layouts: CarouselItemLayout[] = []

    for (let i = 0; i < itemCount; i++) {
        const unadjustedCenter = firstUnadjustedCenter + i * step - clampedScroll
        const firstKeyline = keylines[0]
        const lastKeyline = keylines[keylines.length - 1]

        if (unadjustedCenter <= firstKeyline.unadjustedOffset || unadjustedCenter >= lastKeyline.unadjustedOffset) {
            layouts.push({
                index: i,
                left: unadjustedCenter <= firstKeyline.unadjustedOffset ? -clipPaddingStart - firstKeyline.size : availableSpace + clipPaddingEnd,
                width: 0,
                size: CarouselItemSize.Small,
                ratio: 0,
                visible: false,
            })
            continue
        }

        let k0 = firstKeyline
        let k1 = lastKeyline
        for (let k = 0; k < keylines.length - 1; k++) {
            if (unadjustedCenter >= keylines[k].unadjustedOffset && unadjustedCenter <= keylines[k + 1].unadjustedOffset) {
                k0 = keylines[k]
                k1 = keylines[k + 1]
                break
            }
        }

        const span = k1.unadjustedOffset - k0.unadjustedOffset
        const t = span > 0 ? clamp(0, 1)((unadjustedCenter - k0.unadjustedOffset) / span) : 0
        const width = lerp(k0.size, k1.size, t)
        const centerOffset = lerp(k0.offset, k1.offset, t)
        const left = centerOffset - width / 2
        const right = centerOffset + width / 2
        const visible = width >= minVisibleWidth && right > -clipPaddingStart && left < availableSpace + clipPaddingEnd
        const ratio = clamp(0, 1)((width - smallSize) / sizeRange)
        const size = classifyItemSize(width, focalSize, mediumSize, smallSize)

        layouts.push({
            index: i,
            left,
            width: Math.max(0, width),
            size,
            ratio,
            visible,
        })
    }

    return layouts
}
