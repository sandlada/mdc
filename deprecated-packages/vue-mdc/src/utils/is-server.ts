/**
 * @license
 * Copyright 2024 glare-labs & bre97-web
 * SPDX-License-Identifier: MIT
 */

export function isServer() {
    return (typeof window === 'undefined')
}
