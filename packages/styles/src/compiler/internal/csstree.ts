/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * Internal CSSTree facade: single encapsulation point for css-tree imports.
 * Prevents leaky vendor paths and external type leakage in public .d.ts.
 */

import * as csstree from 'css-tree'

export { csstree }

export {
    fork,
    parse,
    generate,
    walk,
    find,
    findLast,
    findAll,
    fromPlainObject,
    toPlainObject,
    List,
    Lexer,
    tokenTypes,
    tokenNames,
    tokenize,
    createSyntax,
    createLexer,
    clone,
    keyword,
    property,
    isCustomProperty,
    vendorPrefix
} from 'css-tree'

export type {
    CssNode,
    CssNodePlain,
    StyleSheet,
    StyleSheetPlain,
    Atrule,
    AtrulePlain,
    AtrulePrelude,
    AtrulePreludePlain,
    Block,
    BlockPlain,
    Rule,
    RulePlain,
    SelectorList,
    SelectorListPlain,
    Selector,
    SelectorPlain,
    Raw,
    Declaration,
    DeclarationPlain,
    DeclarationList,
    DeclarationListPlain,
    FunctionNode,
    FunctionNodePlain,
    Identifier,
    Operator,
    PseudoClassSelector,
    PseudoClassSelectorPlain,
    PseudoElementSelector,
    PseudoElementSelectorPlain,
    Parentheses,
    ParenthesesPlain,
    StringNode,
    ClassSelector,
    TypeSelector,
    AttributeSelector,
    Combinator,
    Comment,
    Url,
    Value,
    ValuePlain,
    Syntax,
    SyntaxConfig,
    ParseOptions,
    GenerateOptions,
    WalkOptions,
    ListItem,
    WalkContext
} from 'css-tree'
