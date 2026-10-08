/**
 * @license
 * Copyright 2023 The Android Open Source Project
 * SPDX-License-Identifier: Apache-2.0
 *
 * [Modified By Kai-Orion & Sandlada]
 *
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * TypeScript port of the feature layer of `androidx.graphics.shapes.Features`:
 * features group the raw cubics of a polygon into straight edges and (convex /
 * concave) corners, which is the granularity the morph mapping operates on.
 *
 * @link https://android.googlesource.com/platform/frameworks/support/+/androidx-main/graphics/graphics-shapes/src/main/java/androidx/graphics/shapes/Features.kt
 */

import type { Cubic, PointTransformer } from './cubic'

/** A named, contiguous group of cubics (an edge or a corner). */
export abstract class Feature {
    /** The raw cubics describing this feature's shape. */
    public readonly cubics: readonly Cubic[]

    public constructor(cubics: readonly Cubic[]) {
        if (cubics.length === 0) throw new Error('Features need at least one cubic.')
        this.cubics = cubics
    }

    /** Transforms the points of this feature, returning a new feature. */
    public abstract transformed(f: PointTransformer): Feature
}

/**
 * Edges lie between corners and have no vertex or concavity; their curves are
 * straight lines.
 */
export class FeatureEdge extends Feature {
    public override transformed(f: PointTransformer): FeatureEdge {
        return new FeatureEdge(this.cubics.map(cubic => cubic.transformed(f)))
    }
}

/**
 * Corners contain the curves describing how the corner is rounded (or not)
 * plus a flag indicating whether the corner is convex.
 */
export class FeatureCorner extends Feature {
    /** Whether this corner is convex (outward) rather than concave. */
    public readonly convex: boolean

    public constructor(cubics: readonly Cubic[], convex: boolean) {
        super(cubics)
        this.convex = convex
    }

    public override transformed(f: PointTransformer): FeatureCorner {
        return new FeatureCorner(this.cubics.map(cubic => cubic.transformed(f)), this.convex)
    }
}
