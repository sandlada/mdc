/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape, Typescale } from '@sandlada/mdk'
import { createStyleDefinition, defineSchema, type PrimitiveTokenValue } from '@sandlada/styles/schema'
import { expandPadding, expandTypescale } from '@sandlada/styles/tokens'

export const ButtonSizes = ['extra-small', 'small', 'medium', 'large', 'extra-large'] as const

export const ButtonSizeSchema = defineSchema(ButtonSizes)

export type ButtonSize = (typeof ButtonSizes)[number]

const SHAPES = ['round', 'square'] as const

type SizeName = ButtonSize
type ShapeName = (typeof SHAPES)[number]

const toSizeTuple = (pick: (size: SizeName) => PrimitiveTokenValue): PrimitiveTokenValue[] =>
    ButtonSizes.map((size) => pick(size))

const shapeSizeFamily = (
    keyBase: string,
    pick: (size: SizeName) => PrimitiveTokenValue
): Record<string, PrimitiveTokenValue[]> => {
    const row = (corner: string): Record<string, PrimitiveTokenValue[]> => ({
        [`${keyBase}-${corner}`]: toSizeTuple(pick)
    })
    return {
        ...row('start-start'),
        ...row('start-end'),
        ...row('end-start'),
        ...row('end-end')
    }
}

const shapeTable: Record<SizeName, Record<ShapeName, PrimitiveTokenValue>> = {
    'extra-small': { round: Shape.Full, square: Shape.Medium },
    small: { round: Shape.Full, square: Shape.Medium },
    medium: { round: Shape.Full, square: Shape.Large },
    large: { round: Shape.Full, square: Shape.ExtraLarge },
    'extra-large': { round: Shape.Full, square: Shape.ExtraLarge }
}

const selectedShapeTable: Record<SizeName, Record<ShapeName, PrimitiveTokenValue>> = {
    'extra-small': { round: Shape.Medium, square: Shape.Full },
    small: { round: Shape.Medium, square: Shape.Full },
    medium: { round: Shape.Large, square: Shape.Full },
    large: { round: Shape.ExtraLarge, square: Shape.Full },
    'extra-large': { round: Shape.ExtraLarge, square: Shape.Full }
}

const morphShapeTable: Record<SizeName, PrimitiveTokenValue> = {
    'extra-small': Shape.Small,
    small: Shape.Small,
    medium: Shape.Medium,
    large: Shape.Large,
    'extra-large': Shape.Large
}

const buttonSizeTokens = {
    ...expandTypescale('label')([
        Typescale.LabelLarge,
        Typescale.LabelLarge,
        Typescale.TitleMedium,
        Typescale.HeadlineSmall,
        Typescale.HeadlineLarge
    ]),

    ...expandPadding('container')([
        { block: `0px`, inlineStart: `12px`, inlineEnd: `12px` },
        { block: `0px`, inlineStart: `16px`, inlineEnd: `16px` },
        { block: `0px`, inlineStart: `24px`, inlineEnd: `24px` },
        { block: `0px`, inlineStart: `48px`, inlineEnd: `48px` },
        { block: `0px`, inlineStart: `64px`, inlineEnd: `64px` }
    ]),

    ...shapeSizeFamily('container-shape-round', (size) => shapeTable[size].round),
    ...shapeSizeFamily('container-shape-square', (size) => shapeTable[size].square),
    ...shapeSizeFamily('container-shape-round-selected', (size) => selectedShapeTable[size].round),
    ...shapeSizeFamily('container-shape-square-selected', (size) => selectedShapeTable[size].square),
    ...shapeSizeFamily('container-shape-pressed-morph', (size) => morphShapeTable[size]),

    'container-height': [`32px`, `40px`, `56px`, `96px`, `136px`],

    'outline-width': [`1px`, `1px`, `1px`, `2px`, `3px`],

    'icon-size': [`20px`, `20px`, `24px`, `32px`, `40px`],

    'icon-label-space': [`8px`, `8px`, `8px`, `12px`, `16px`]
} as const

export const ButtonSizeDefinition = createStyleDefinition(ButtonSizeSchema)(buttonSizeTokens)
