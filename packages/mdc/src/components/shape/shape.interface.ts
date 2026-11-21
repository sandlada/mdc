/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { IMixinFocusRingAttributes } from '../focus-ring/focus-ring-options.mixin'
import type { IMixinRippleAttributes } from '../ripple/ripple-options.mixin'
import type { RoundedPolygon } from './internal/rounded-polygon'

/**
 * All 35 predefined Material Design 3 Expressive shapes from
 * `androidx.compose.material3.MaterialShapes`.
 */
export const MaterialShape = {
    Circle: 'circle',
    Square: 'square',
    Slanted: 'slanted',
    Arch: 'arch',
    Fan: 'fan',
    Arrow: 'arrow',
    SemiCircle: 'semi-circle',
    Oval: 'oval',
    Pill: 'pill',
    Triangle: 'triangle',
    Diamond: 'diamond',
    ClamShell: 'clam-shell',
    Pentagon: 'pentagon',
    Gem: 'gem',
    Sunny: 'sunny',
    VerySunny: 'very-sunny',
    Cookie4Sided: 'cookie-4-sided',
    Cookie6Sided: 'cookie-6-sided',
    Cookie7Sided: 'cookie-7-sided',
    Cookie9Sided: 'cookie-9-sided',
    Cookie12Sided: 'cookie-12-sided',
    Ghostish: 'ghostish',
    Clover4Leaf: 'clover-4-leaf',
    Clover8Leaf: 'clover-8-leaf',
    Burst: 'burst',
    SoftBurst: 'soft-burst',
    Boom: 'boom',
    SoftBoom: 'soft-boom',
    Flower: 'flower',
    Puffy: 'puffy',
    PuffyDiamond: 'puffy-diamond',
    PixelCircle: 'pixel-circle',
    PixelTriangle: 'pixel-triangle',
    Bun: 'bun',
    Heart: 'heart',
} as const
export type MaterialShape = (typeof MaterialShape)[keyof typeof MaterialShape]

/**
 * Parametric shape builders from `androidx.graphics.shapes` (`Shapes.kt`).
 */
export const ParametricShape = {
    Polygon: 'polygon',
    Star: 'star',
    Rectangle: 'rectangle',
    PillStar: 'pill-star',
} as const
export type ParametricShape = (typeof ParametricShape)[keyof typeof ParametricShape]

/**
 * Any named shape accepted by `<mdc-shape>` (`MaterialShapes` or `Shapes.kt` builders).
 */
export const ShapeKind = {
    ...MaterialShape,
    ...ParametricShape,
} as const
export type ShapeKind = (typeof ShapeKind)[keyof typeof ShapeKind]

/**
 * Surface & container appearance variant for `<mdc-shape>`.
 */
export const ShapeVariant = {
    Filled: 'filled',
    Tonal: 'tonal',
    Outlined: 'outlined',
    Elevated: 'elevated',
    Surface: 'surface',
    Transparent: 'transparent',
} as const
export type ShapeVariant = (typeof ShapeVariant)[keyof typeof ShapeVariant]

/**
 * MD3 color-role scheme for `<mdc-shape>`.
 */
export const ShapeColor = {
    Primary: 'primary',
    Secondary: 'secondary',
    Tertiary: 'tertiary',
    Error: 'error',
    Surface: 'surface',
} as const
export type ShapeColor = (typeof ShapeColor)[keyof typeof ShapeColor]

/**
 * Preset size scale for `<mdc-shape>`.
 */
export const ShapeSize = {
    ExtraSmall: 'extra-small',
    Small: 'small',
    Medium: 'medium',
    Large: 'large',
    ExtraLarge: 'extra-large',
} as const
export type ShapeSize = (typeof ShapeSize)[keyof typeof ShapeSize]

/**
 * How normalized `[0, 1] x [0, 1]` geometry maps into non-square boxes.
 * - `contain`: Preserves 1:1 geometric proportions centered in the box (default).
 * - `fill`: Stretches to `(width, height)`, matching Compose `RoundedPolygon.toShape()`.
 */
export const ShapeFit = {
    Contain: 'contain',
    Fill: 'fill',
} as const
export type ShapeFit = (typeof ShapeFit)[keyof typeof ShapeFit]

/**
 * Material 3 motion scheme (`MotionScheme.expressive()` vs `MotionScheme.standard()`).
 */
export const ShapeMotionScheme = {
    Expressive: 'expressive',
    Standard: 'standard',
} as const
export type ShapeMotionScheme = (typeof ShapeMotionScheme)[keyof typeof ShapeMotionScheme]

/**
 * Spatial spring speed tier within the active `MotionScheme`.
 */
export const ShapeMotionSpeed = {
    Fast: 'fast',
    Default: 'default',
    Slow: 'slow',
} as const
export type ShapeMotionSpeed = (typeof ShapeMotionSpeed)[keyof typeof ShapeMotionSpeed]

export const ShapeMorphStartEvent = 'shape-morph-start'
export const ShapeMorphEndEvent = 'shape-morph-end'
export const ShapeChangeEvent = 'shape-change'

export interface IMDCShapeMorphStartDetail {
    from: string
    to: string
}

export interface IMDCShapeMorphEndDetail {
    shape: string
}

export interface IMDCShapeChangeDetail {
    selected: boolean
    activeShape: string
}

export interface IMDCShapeAttributes {
    /** Base / rest shape (`MaterialShape` or `ParametricShape`). Defaults to `'circle'`. */
    shape: ShapeKind
    /** Target shape when pointer hovers over the element. */
    hoverShape: ShapeKind | ''
    /** Target shape when element receives keyboard focus. */
    focusShape: ShapeKind | ''
    /** Target shape while element is pressed. */
    pressedShape: ShapeKind | ''
    /** Target shape when `selected` is `true`. */
    selectedShape: ShapeKind | ''
    /** Target shape when `disabled` is `true`. */
    disabledShape: ShapeKind | ''
    /** Optional target shape for manual scrub interpolation driven by `progress`. */
    morphTo: ShapeKind | ''
    /** Manual morph progress `[0, 1]` (used when `morphTo` is set). */
    progress: number
    /** Surface variant: `'tonal'` (default), `'filled'`, `'outlined'`, `'elevated'`, `'surface'`, `'transparent'`. */
    variant: ShapeVariant
    /** MD3 color-role scheme: `'primary'` (default), `'secondary'`, `'tertiary'`, `'error'`, `'surface'`. */
    color: ShapeColor
    /** Preset size scale: `'extra-small'` ~ `'extra-large'`. Defaults to `'medium'`. */
    size: ShapeSize
    /** Geometry fit mode inside non-square bounds: `'contain'` (default) | `'fill'`. */
    fit: ShapeFit
    /** Clockwise rotation around the shape center in degrees. Spring-animated on change. */
    rotation: number
    /** Compose `startAngle` offset in degrees (0 keeps canonical orientation). */
    startAngle: number
    /** Disables `clip-path` clipping of slotted content. */
    disableClip: boolean
    /** Makes the shape an interactive `<button>` with ripple, focus indicator, and keyboard activation. */
    interactive: boolean
    /** Enables toggleable `selected` state on activation (implies `interactive`). */
    toggle: boolean
    /** Selected / checked state. */
    selected: boolean
    /** Disables interactive states and dims visual appearance. */
    disabled: boolean
    /** Material 3 motion scheme (`'expressive'` | `'standard'`). Defaults to `'expressive'`. */
    motionScheme: ShapeMotionScheme
    /** Spatial spring speed tier (`'fast'` | `'default'` | `'slow'`). Defaults to `'default'`. */
    motionSpeed: ShapeMotionSpeed
    /** Optional custom spring stiffness override (must be > 0). */
    stiffness: number | null
    /** Optional custom spring damping ratio override (must be >= 0). */
    dampingRatio: number | null
    /** Disables spring animations and jumps directly to the target shape/rotation. */
    disableAnimation: boolean
    /** Vertex/ray count for parametric `'polygon'`, `'star'`, and `'pill-star'`. Defaults to `5`. */
    sides: number
    /** Inner radius ratio `(0, 1)` for parametric `'star'` and `'pill-star'`. Defaults to `0.5`. */
    innerRadius: number
    /** Corner rounding radius for parametric shapes and custom `vertices`. Defaults to `0.15`. */
    cornerRadius: number
    /** Optional inner corner rounding radius for parametric `'star'` and `'pill-star'`. */
    innerCornerRadius: number | null
    /** Corner smoothing factor `[0, 1]` for parametric shapes and custom `vertices`. Defaults to `0`. */
    smoothing: number
    /** Width-to-height aspect ratio for parametric `'rectangle'` and `'pill-star'`. Defaults to `1`. */
    aspectRatio: number
    /** Vertex spacing `[0, 1]` for parametric `'pill-star'`. Defaults to `0.5`. */
    vertexSpacing: number
    /** Optional custom `RoundedPolygon` instance overriding `shape`. */
    polygon: RoundedPolygon | null
    /** Optional flat `[x0, y0, x1, y1, ...]` vertex array overriding `shape`. */
    vertices: number[] | null
    /** Comma-separated shape sequence for `autoplay` or `next()`. */
    sequence: string
    /** Automatically cycles through `sequence` (or default expressive shapes) using spring morphs. */
    autoplay: boolean
    /** Milliseconds between `autoplay` shape steps. Defaults to `1000`. */
    interval: number
    /** Extra clockwise rotation (degrees) added per `autoplay` step. Defaults to `0`. */
    spinPerStep: number
}

export interface IMDCShapeEvents {
    'shape-morph-start': CustomEvent<IMDCShapeMorphStartDetail>
    'shape-morph-end': CustomEvent<IMDCShapeMorphEndDetail>
    'shape-change': CustomEvent<IMDCShapeChangeDetail>
}

export interface IMDCShape
    extends LitElement,
        IMDCShapeAttributes,
        IMixinRippleAttributes,
        IMixinFocusRingAttributes {
    /** Currently active target shape name (reflecting hover/focus/press/selected/disabled). */
    readonly activeShape: string
    /** Current resolved target `RoundedPolygon` (normalized to `[0, 1]^2`). */
    readonly resolvedPolygon: RoundedPolygon
    /** Current SVG path data (`d` attribute) in pixel coordinates. */
    readonly pathData: string
    /** Whether a spring morph or rotation animation is currently running. */
    readonly isMorphing: boolean
    /** Imperatively morphs to a named shape or custom `RoundedPolygon`. */
    morphToShape(target: ShapeKind | RoundedPolygon, options?: { stiffness?: number; dampingRatio?: number }): void
    /** Advances one step in `sequence`. */
    next(): void
}
