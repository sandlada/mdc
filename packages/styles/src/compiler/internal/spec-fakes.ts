/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * at-rules 系单元 spec 共用测试替身（非 spec 文件，vitest 不直接执行）。
 *
 * 设计原则：handler 直测只依赖本模块的手写最小 fake，不导入
 * `compileStateSheet`、`withState`、`withVariant`、`defineSchema`、
 * `createStyleDefinition` 任一真实实现（tables 是纯数据，字面量即 fake）。
 * 上游任一变更变红时，只有直接依赖它的 spec 变红。
 * 类型层面允许 `import type` 真实类型（编译期擦除，无运行时耦合）。
 */

import type { AtRulesCompilerContext, StateTokenMetadata } from '../sheet'
import type { ParsedStatement, TransformResult } from './primitives'
import type { TriggerTables } from '../../schema'
import type { AtRuleHandlerResult, Recurse } from '../transforms/at-rule-handler'

/**
 * Handler 级映射表行：[at-rule 表头, 原始 body, 期望的规范化 handler 结果]。
 * 与 sheet 级 MappingRow 对称，但输入拆成 handler 实参，期望为结果对象字符串化。
 */
export type HandlerRow = readonly [header: string, body: string, expected: string]

/**
 * Handler 级映射表：行数组（对应各 spec 的 greenMapping / redMapping 注解）。
 */
export type HandlerMapping = ReadonlyArray<HandlerRow>

/**
 * 规范化 handler 结果：base 在前，hoisted 按发射顺序拼接；只做 `\r\n` 统一 + trim。
 * 不排序——发射顺序本身是语义（combo 笛卡尔积顺序固定），由被测实现保证确定性。
 */
export const canonicalHandlerResult = (res: AtRuleHandlerResult): string => {
    const parts: string[] = []
    if (res.base) {
        parts.push(res.base.replace(/\r\n/g, '\n').trim())
    }
    for (const h of res.hoisted ?? []) {
        const text = h.replace(/\r\n/g, '\n').trim()
        if (text) {
            parts.push(text)
        }
    }
    return parts.filter(Boolean).join(' ')
}

/**
 * 回声 recurse：把收到的 statements 原样渲染为 CSS，不做声明重写与 token 解析。
 * decl 渲染为 `prop: value`；block 渲染为 `header { body }`（body 仅 trim）。
 */
export const echoStatement = (stmt: ParsedStatement): string => {
    if (stmt.type === 'decl') {
        return `${stmt.property}: ${stmt.value}`
    }
    const body = (stmt.body ?? '').trim()
    if (!body) {
        return `${stmt.header} {}`
    }
    return `${stmt.header} { ${body} }`
}

/**
 * 默认回声 recurse：base 为回声渲染，hoisted 为空。
 */
export const echoRecurse: Recurse = (
    statements: readonly ParsedStatement[]
): TransformResult => {
    return {
        baseRules: statements.map(echoStatement),
        hoistedRules: []
    }
}

/**
 * 可观测 recurse：记录每次调用收到的 ctx（供 ancestorPath / variantSelector 断言）。
 */
export function captureRecurse() {
    const calls: AtRulesCompilerContext[] = []
    const recurse: Recurse = (
        statements: readonly ParsedStatement[],
        ctx: AtRulesCompilerContext
    ): TransformResult => {
        calls.push(ctx)
        return {
            baseRules: statements.map(echoStatement),
            hoistedRules: []
        }
    }
    return { recurse, calls }
}

/**
 * 最小 trigger tables 替身：冻结字面量即数据，无需任何真实实现。
 * 未映射的变体名解析为 `undefined`（严格丢弃，无默认回退）。
 */
export function fakeTables(
    states: Record<string, string> = {},
    variants: Record<string, string> = {}
): TriggerTables {
    return Object.freeze({
        states: Object.freeze({ ...states }),
        variants: Object.freeze({ ...variants })
    })
}

/**
 * 最小 token-metadata 替身：只提供 handler 消费的字段。
 * 空集合預設使無 token 定義時恆發射（對應 hasAnyStateToken 的豁免分支）。
 */
export function fakeMeta(variantNames: readonly string[] = []): StateTokenMetadata {
    return {
        hasToken: () => false,
        isStateToken: () => false,
        hasStateToken: () => false,
        allTokens: new Set<string>(),
        allStateTokens: new Set<string>(),
        allDefinedStates: new Set<string>(),
        getDefinedStates: () => new Set<string>(),
        resolveStateVarName: (name: string) => name,
        hasStateDelta: () => false,
        statesList: [],
        baseState: 'enabled',
        isVariantDictionary: variantNames.length > 0,
        allVariantNames: variantNames,
        variantTokensMap: new Map<string, ReadonlySet<string>>(),
        intersectionTokens: new Set<string>()
    } as unknown as StateTokenMetadata
}

/**
 * 最小编译上下文：调用方可按需覆盖任意字段。
 */
export function fakeBaseCtx(
    overrides: Partial<AtRulesCompilerContext> = {}
): AtRulesCompilerContext {
    return {
        states: [],
        isCombo: false,
        tables: fakeTables(),
        options: {},
        meta: undefined,
        schema: undefined,
        ancestorPath: [],
        ...overrides
    } as AtRulesCompilerContext
}
