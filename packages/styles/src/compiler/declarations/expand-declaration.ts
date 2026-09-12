/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * AST-based declaration macro expansions (shape, padding, margin, typescale).
 * Operates on CSSTree AST Value nodes directly.
 */

import {
    parse,
    generate,
    clone,
    List,
    type Declaration,
    type Value,
    type CssNode,
    type FunctionNode,
    type Block
} from '../internal/csstree'

export type PxLiteral = `${number}px` | '0'

export type RejectPxOverflow<V extends string> =
    V extends `${PxLiteral} ${PxLiteral} ${PxLiteral} ${PxLiteral} ${string}` ? never : V

function isDynamicValueNode(valueNode: Value, rawText: string): boolean {
    if (rawText.includes('var(') || rawText.includes('calc(') || rawText.includes('${')) {
        return true
    }
    let dynamic = false
    valueNode.children.forEach((child) => {
        if (child.type === 'Function') {
            const name = (child as FunctionNode).name.toLowerCase()
            if (name === 'var' || name === 'calc' || name === 'min' || name === 'max' || name === 'clamp') {
                dynamic = true
            }
        }
    })
    return dynamic
}

function extractVarPrefix(valueNode: Value): string | null {
    const significant = valueNode.children.toArray().filter((c) => c.type !== 'Comment' && c.type !== 'WhiteSpace')
    if (significant.length === 1 && significant[0].type === 'Function') {
        const fn = significant[0] as FunctionNode
        if (fn.name.toLowerCase() === 'var' && fn.children && !fn.children.isEmpty) {
            const first = fn.children.first
            if (first && first.type === 'Identifier') {
                return first.name
            }
        }
    }
    return null
}

function createDeclaration(property: string, valueAstOrString: CssNode | string): Declaration {
    let value: Value
    if (typeof valueAstOrString === 'string') {
        value = parse(valueAstOrString, { context: 'value' }) as Value
    } else if (valueAstOrString.type === 'Value') {
        value = valueAstOrString as Value
    } else {
        const list = new List<CssNode>()
        list.push(clone(valueAstOrString))
        value = {
            type: 'Value',
            loc: undefined,
            children: list
        } as unknown as Value
    }
    return {
        type: 'Declaration',
        loc: undefined,
        important: false,
        property,
        value
    }
}

/**
 * Expands a single AST Declaration into one or more AST Declarations.
 */
export function expandDeclarationAst(decl: Declaration): Declaration[] {
    const prop = decl.property.toLowerCase()
    if (prop !== 'shape' && prop !== 'padding' && prop !== 'margin' && prop !== 'typescale') {
        return [decl]
    }

    let valueNode: Value
    if (decl.value.type === 'Raw') {
        try {
            valueNode = parse((decl.value as any).value, { context: 'value' }) as Value
        } catch {
            return [decl]
        }
    } else {
        valueNode = decl.value as Value
    }

    const rawText = generate(valueNode)
    const varPrefix = extractVarPrefix(valueNode)
    const significant = valueNode.children.toArray().filter((c) => c.type !== 'Comment' && c.type !== 'WhiteSpace')

    if (prop === 'shape') {
        if (varPrefix) {
            return [
                createDeclaration('border-start-start-radius', `var(${varPrefix}-start-start)`),
                createDeclaration('border-start-end-radius', `var(${varPrefix}-start-end)`),
                createDeclaration('border-end-end-radius', `var(${varPrefix}-end-end)`),
                createDeclaration('border-end-start-radius', `var(${varPrefix}-end-start)`)
            ]
        }

        if (significant.length > 4 && !isDynamicValueNode(valueNode, rawText)) {
            throw new Error(
                `Invalid ${prop} value "${rawText}": at most 4 whitespace-separated values are allowed.`
            )
        }

        if (significant.length === 1) {
            return [
                createDeclaration('border-start-start-radius', significant[0]),
                createDeclaration('border-start-end-radius', significant[0]),
                createDeclaration('border-end-end-radius', significant[0]),
                createDeclaration('border-end-start-radius', significant[0])
            ]
        }
        if (significant.length === 2) {
            return [
                createDeclaration('border-start-start-radius', significant[0]),
                createDeclaration('border-start-end-radius', significant[1]),
                createDeclaration('border-end-end-radius', significant[0]),
                createDeclaration('border-end-start-radius', significant[1])
            ]
        }
        if (significant.length === 3) {
            return [
                createDeclaration('border-start-start-radius', significant[0]),
                createDeclaration('border-start-end-radius', significant[1]),
                createDeclaration('border-end-end-radius', significant[2]),
                createDeclaration('border-end-start-radius', significant[1])
            ]
        }
        if (significant.length === 4) {
            return [
                createDeclaration('border-start-start-radius', significant[0]),
                createDeclaration('border-start-end-radius', significant[1]),
                createDeclaration('border-end-end-radius', significant[2]),
                createDeclaration('border-end-start-radius', significant[3])
            ]
        }
    }

    if (prop === 'padding' || prop === 'margin') {
        if (varPrefix) {
            return [
                createDeclaration(`${prop}-inline-start`, `var(${varPrefix}-inline-start)`),
                createDeclaration(`${prop}-inline-end`, `var(${varPrefix}-inline-end)`),
                createDeclaration(`${prop}-block-start`, `var(${varPrefix}-block-start)`),
                createDeclaration(`${prop}-block-end`, `var(${varPrefix}-block-end)`)
            ]
        }

        if (significant.length > 4 && !isDynamicValueNode(valueNode, rawText)) {
            throw new Error(
                `Invalid ${prop} value "${rawText}": at most 4 whitespace-separated values are allowed.`
            )
        }

        if (significant.length === 1) {
            return [createDeclaration(prop, significant[0])]
        }
        if (significant.length === 2) {
            return [
                createDeclaration(`${prop}-inline-start`, significant[1]),
                createDeclaration(`${prop}-inline-end`, significant[1]),
                createDeclaration(`${prop}-block-start`, significant[0]),
                createDeclaration(`${prop}-block-end`, significant[0])
            ]
        }
        if (significant.length === 3) {
            return [
                createDeclaration(`${prop}-inline-start`, significant[1]),
                createDeclaration(`${prop}-inline-end`, significant[1]),
                createDeclaration(`${prop}-block-start`, significant[0]),
                createDeclaration(`${prop}-block-end`, significant[2])
            ]
        }
        if (significant.length === 4) {
            return [
                createDeclaration(`${prop}-inline-start`, significant[3]),
                createDeclaration(`${prop}-inline-end`, significant[1]),
                createDeclaration(`${prop}-block-start`, significant[0]),
                createDeclaration(`${prop}-block-end`, significant[2])
            ]
        }
    }

    if (prop === 'typescale') {
        if (varPrefix) {
            return [
                createDeclaration('font-family', `var(${varPrefix}-font)`),
                createDeclaration('font-size', `var(${varPrefix}-size)`),
                createDeclaration('line-height', `var(${varPrefix}-leading)`),
                createDeclaration('font-weight', `var(${varPrefix}-weight)`),
                createDeclaration('letter-spacing', `var(${varPrefix}-tracking)`)
            ]
        }
    }

    return [decl]
}

/**
 * Expands all macro declarations inside a Block AST in-place.
 */
export function expandBlockDeclarationsAst(block: Block): void {
    if (!block.children) return
    const newChildren = new List<CssNode>()

    block.children.forEach((child) => {
        if (child.type === 'Declaration') {
            const expanded = expandDeclarationAst(child as Declaration)
            for (const d of expanded) {
                newChildren.push(d)
            }
        } else {
            newChildren.push(child)
        }
    })

    block.children = newChildren
}

/**
 * Legacy/functional declaration expansion interface for property values.
 */
export const expandDeclaration = <V extends string>(prop: string, val: RejectPxOverflow<V>): string => {
    const cleanVal = val.trim().replace(/;$/, '').trim()
    const lowerProp = prop.toLowerCase()
    if (lowerProp !== 'shape' && lowerProp !== 'padding' && lowerProp !== 'margin' && lowerProp !== 'typescale') {
        return `${prop}: ${cleanVal};`
    }
    let valueAst: Value
    try {
        valueAst = parse(cleanVal, { context: 'value' }) as Value
    } catch {
        return `${prop}: ${cleanVal};`
    }

    const decl: Declaration = {
        type: 'Declaration',
        loc: undefined,
        important: false,
        property: prop,
        value: valueAst
    }

    const expanded = expandDeclarationAst(decl)
    return `${expanded.map((d) => `${d.property}: ${generate(d.value)}`).join('; ')};`
}
