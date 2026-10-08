/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Barrel of the `mdc-loading-indicator` morphing-shape engine. Everything a
 * consumer (the component or its tests) needs is re-exported here; the
 * individual modules are internal and must not be imported directly.
 */

export {
    CONSTANT_ROTATION_PER_PERIOD,
    CONTAINER_SIZE_PX,
    INDICATOR_SIZE_PX,
    indeterminateFrameAt,
    determinateFrameAt,
    getDeterminateShapeScale,
    getIndeterminateShapeScale,
    LOOP_DURATION_MS,
    MORPH_SPRING,
    ROTATION_PER_PERIOD,
    SHAPE_PERIOD_MS,
    SPRING_ROTATION_PER_PERIOD,
    type LoadingIndicatorFrame,
} from './animation'

export {
    calculateScaleFactor,
    cookie4,
    cookie9,
    getDeterminateMorphs,
    getDeterminatePolygons,
    getIndeterminateMorphs,
    getIndeterminatePolygons,
    oval,
    pentagon,
    pill,
    softBurst,
    sunny,
    circle,
} from './material-shapes'

export { Morph, cubicsBoundsCenter, cubicsToPathData } from './morph'

export { estimateAnimationDurationMillis, springMotionAt, type SpringDurationEstimate, type SpringParameters } from './spring'

export { RoundedPolygon, cornerRounding, type RoundedCornerSpec } from './rounded-polygon'

export { Feature, FeatureCorner, FeatureEdge } from './feature'
