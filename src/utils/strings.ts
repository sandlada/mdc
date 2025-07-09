/**
 * @license
 * Copyright 2024 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * OnPrimary -> on-primary
 */
export function toKebabCase<T extends string>(str: T): KebabCase<T> {
    return str.split('').map((letter, idx) => {
        return letter.toUpperCase() === letter
            ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}`
            : letter
    }).join('') as KebabCase<T>
}

export type KebabCase<S extends string> = S extends `${infer T}${infer U}`
    ? U extends Uncapitalize<U>
    ? `${Lowercase<T>}${KebabCase<U>}`
    : `${Lowercase<T>}-${KebabCase<U>}`
    : S
