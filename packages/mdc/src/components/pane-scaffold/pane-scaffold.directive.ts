/**
 * @version 2026.11.21
 * @license
 * Copyright 2024 The Android Open Source Project
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: Apache-2.0
 */
import { ScaffoldBreakpoints, ScaffoldHeightBreakpoints } from '../scaffold'
import { PanePreferredHeight, PanePreferredWidth, PanePreferredWidthXL, PaneSpacer, transposePaneBounds, validatePaneBounds } from './internal'
import {
    PaneHingePolicy, type IPaneScaffoldDirective, type IPaneScaffoldDirectiveOptions, type IPaneScaffoldExcludedBounds,
    type IPaneScaffoldHinge, type IPaneScaffoldPosture, type IPaneScaffoldWindowInfo,
} from './pane-scaffold.interface'

/** Derives Material partition limits and exclusions from CSS pixel dimensions and optional fold posture. */
export const calculatePaneScaffoldDirective = (
    { width, height, posture }: IPaneScaffoldWindowInfo,
    { twoPanesOnMediumWidth, verticalHingePolicy = PaneHingePolicy.AvoidSeparating,
        horizontalHingePolicy = PaneHingePolicy.AvoidSeparating }: IPaneScaffoldDirectiveOptions = {},
): IPaneScaffoldDirective => {
    if (![width, height].every(value => Number.isFinite(value) && value >= 0)) throw new Error('Invalid pane scaffold dimensions')
    const denseMedium = twoPanesOnMediumWidth && width >= ScaffoldBreakpoints.Medium && width < ScaffoldBreakpoints.Expanded
    const large = width >= ScaffoldBreakpoints.Large
    const maxHorizontalPartitions = large ? 3 : width >= ScaffoldBreakpoints.Expanded || denseMedium ? 2 : 1
    const twoVertical = posture?.isTabletop || (maxHorizontalPartitions === 1 && height >= ScaffoldHeightBreakpoints.Expanded)
    return {
        maxHorizontalPartitions,
        horizontalPartitionSpacerSize: maxHorizontalPartitions > 1 ? PaneSpacer : 0,
        minimumPaneWidth: 0,
        maxVerticalPartitions: twoVertical ? 2 : 1,
        verticalPartitionSpacerSize: twoVertical ? PaneSpacer : 0,
        defaultPanePreferredWidth: large ? PanePreferredWidthXL : PanePreferredWidth,
        defaultPanePreferredHeight: PanePreferredHeight,
        excludedBounds: excludedHinges(verticalHingePolicy)(posture?.verticalHinges ?? []),
        horizontalExcludedBounds: excludedHinges(horizontalHingePolicy)(posture?.horizontalHinges ?? []),
    }
}

const excludedHinges = (policy: PaneHingePolicy) => (hinges: readonly IPaneScaffoldHinge[]): IPaneScaffoldExcludedBounds[] => {
    if (!Object.values(PaneHingePolicy).includes(policy)) throw new Error('Invalid pane hinge policy')
    return hinges.flatMap(hinge => {
        validatePaneBounds(hinge.bounds)
        if (policy === PaneHingePolicy.AlwaysAvoid
            || (policy === PaneHingePolicy.AvoidSeparating && (hinge.separating || hinge.occluding))
            || (policy === PaneHingePolicy.AvoidOccluding && hinge.occluding)) return [{ ...hinge.bounds }]
        return []
    })
}

const findSegmentHinges = (contentBox: IPaneScaffoldExcludedBounds) =>
    (segments: readonly IPaneScaffoldExcludedBounds[]): IPaneScaffoldHinge[] => {
        const hinges: IPaneScaffoldHinge[] = []
        const columns = segments.toSorted((a, b) => a.left - b.left)
        for (const [index, segment] of columns.entries()) {
            const neighbor = columns.slice(index + 1).find(rect => rect.top === segment.top && rect.bottom === segment.bottom)
            if (!neighbor || segment.right > neighbor.left || neighbor.left <= contentBox.left || segment.right >= contentBox.right) continue
            const top = Math.max(segment.top, contentBox.top)
            const bottom = Math.min(segment.bottom, contentBox.bottom)
            if (top >= bottom) continue
            hinges.push({
                separating: true,
                occluding: neighbor.left > segment.right,
                bounds: {
                    left: Math.max(segment.right, contentBox.left) - contentBox.left,
                    right: Math.min(neighbor.left, contentBox.right) - contentBox.left,
                    top: top - contentBox.top,
                    bottom: bottom - contentBox.top,
                },
            })
        }
        return hinges
    }

/** Maps browser viewport rectangles to folds intersecting a scaffold content box in the same coordinate space. */
export const panePostureFromViewportSegments = (contentBox: IPaneScaffoldExcludedBounds) =>
    (segments: readonly IPaneScaffoldExcludedBounds[]): IPaneScaffoldPosture => {
        validatePaneBounds(contentBox)
        for (const segment of segments) validatePaneBounds(segment)
        const verticalHinges = findSegmentHinges(contentBox)(segments)
        const horizontalHinges = findSegmentHinges(transposePaneBounds(contentBox))(segments.map(transposePaneBounds))
            .map(hinge => ({ ...hinge, bounds: transposePaneBounds(hinge.bounds) }))
        return { isTabletop: horizontalHinges.length > 0, verticalHinges, horizontalHinges }
    }
