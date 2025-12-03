/**
 * @license
 * Copyright 2024 glare-labs & bre97-web
 * SPDX-License-Identifier: MIT
 *
 * RFC4122 like, v4.
 *
 * @license CC BY-SA 4.0
 * @link https://stackoverflow.com/a/8809472/
 * @author Briguy37
 */
export function generateUuid() {
    let d = new Date().getTime()
    let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        let r = Math.random() * 16
        if (d > 0) {
            r = (d + r) % 16 | 0
            d = Math.floor(d / 16)
        } else {
            r = (d2 + r) % 16 | 0
            d2 = Math.floor(d2 / 16)
        }
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
    })
}
