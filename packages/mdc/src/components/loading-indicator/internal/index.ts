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
    ConstantRotationPerPeriod as CONSTANT_ROTATION_PER_PERIOD,
    ContainerSizePx as CONTAINER_SIZE_PX,
    IndicatorSizePx as INDICATOR_SIZE_PX,
    indeterminateFrameAt,
    determinateFrameAt,
    getDeterminateShapeScale,
    getIndeterminateShapeScale,
    LoopDurationMs as LOOP_DURATION_MS,
    MorphSpring as MORPH_SPRING,
    RotationPerPeriod as ROTATION_PER_PERIOD,
    ShapePeriodMs as SHAPE_PERIOD_MS,
    SpringRotationPerPeriod as SPRING_ROTATION_PER_PERIOD,
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

export { Morph, cubicsAreaCentroid, cubicsBoundsCenter, cubicsToPathData } from './morph'

export { estimateAnimationDurationMillis, springMotionAt, type SpringDurationEstimate, type SpringParameters } from './spring'

export { RoundedPolygon, cornerRounding, type RoundedCornerSpec } from './rounded-polygon'

export { Feature, FeatureCorner, FeatureEdge } from './feature'
