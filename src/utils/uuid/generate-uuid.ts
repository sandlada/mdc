/**
 * @license CC BY-SA 4.0
 * @link https://stackoverflow.com/a/8809472/
 * @author Briguy37
 */

/**
 * @deprecated
 * Please use `self.crypto.randomUUID()` instead of `generateUUID()`.
 *
 * Generates a unique identifier.
 *
 * `self.crypto.randomUUID()` is well established and works across many devices and browser versions.
 * It’s been available across browsers since March 2022.
 *
 * @link
 * https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
 */
export function generateUUID() {
    var d = new Date().getTime()
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16//random number between 0 and 16
        if (d > 0) {
            r = (d + r) % 16 | 0
            d = Math.floor(d / 16)
        } else {
            r = (d2 + r) % 16 | 0
            d2 = Math.floor(d2 / 16)
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
}
