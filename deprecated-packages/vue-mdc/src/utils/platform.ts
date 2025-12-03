/**
 * @license
 * Copyright 2024 glare-labs & bre97-web
 * SPDX-License-Identifier: MIT
 */

export type TPlatform = 'android' | 'ios' | 'desktop' | 'unknown'

export interface IDevicePlatform {
    type: TPlatform
    isMobile: boolean
    isDesktop: boolean
    userAgent: string
}

/**
 * Detects the platform type (Android, iOS, Desktop) based on the User-Agent string.
 *
 * @param uaString The User-Agent string. If not provided, it tries to use `navigator.userAgent`.
 * @returns An object containing the platform type and boolean flags.
 */
export function detectPlatform(uaString?: string): IDevicePlatform {
    const ua = (uaString || (typeof navigator !== 'undefined' ? navigator.userAgent : '')).toLowerCase()

    let type: TPlatform = 'unknown'
    let isMobile = false
    let isDesktop = false

    if (!ua) {
        // Cannot determine without a User-Agent string
        return {
            type,
            isMobile,
            isDesktop,
            userAgent: ua,
        }
    }

    // Check for iOS (iPhone, iPad, iPod)
    // iPadOS 13+ User-Agent looks like a Mac, but may contain "ipad" or check for touch points
    // For simplicity here, we'll rely on common iOS keywords.
    // More robust iPad detection might involve checking for 'macintosh' and maxTouchPoints > 0
    if (/\b(iphone|ipad|ipod)/.test(ua) || (ua.includes('macintosh') && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1)) {
        type = 'ios'
        isMobile = true
    }
    // Check for Android
    else if (/\bandroid\b/.test(ua)) {
        type = 'android'
        isMobile = true
    }
    // If not mobile, assume desktop (this is a simplification)
    // Common desktop OS keywords can be added for more specific desktop detection if needed
    // e.g., windows, macintosh (excluding iPads), linux (excluding android)
    else if (
        /\b(windows|linux|macintosh|cros)\b/.test(ua) && // Added cros for Chrome OS
        !/\bandroid\b/.test(ua) // Ensure it's not Android on Linux
    ) {
        // Check again to ensure it's not a mobile device masking as desktop or specific mobile OS
        if (!/\b(iphone|ipad|ipod|tablet|mobile|opera mini|iemobile|wpdesktop|windows phone)\b/.test(ua)) {
            type = 'desktop'
            isDesktop = true
        } else {
            // It has desktop keywords but also mobile keywords, could be a tablet or specific mobile browser.
            // For this simplified version, if it has strong mobile signals, let's try to classify.
            // This part could be refined based on how strictly "mobile" is defined.
            // For instance, an Android tablet is 'android' and 'isMobile'.
            // A Windows tablet could be 'desktop' but might have 'tablet' in UA.
            // If strict mobile (phone-like) vs desktop is needed, this logic would differ.
            // For now, if it's not Android/iOS and not clearly desktop, it remains 'unknown' or
            // could fall into a more nuanced category if the requirements were expanded.
            // Let's re-evaluate if it's mobile based on common patterns
            if (/\b(tablet|mobile|opera mini|iemobile|wpdesktop|windows phone)\b/.test(ua)) {
                // Could be a Windows Phone, or other mobile OS.
                // For this simplified function, we don't have a specific category for them
                // other than not being Android/iOS.
                // Let's assume for this simplified version if it has mobile keywords it's mobile
                isMobile = true
                if (type === 'unknown') { // if not already set (e.g. by earlier desktop check)
                    // we don't have a specific mobile type here other than android/ios
                }
            } else {
                // Default to desktop if primary OS keywords match and no strong mobile signals
                type = 'desktop'
                isDesktop = true
            }
        }
    }

    // If it's mobile, it's not desktop, and vice-versa (for this simplified model)
    if (isMobile) {
        isDesktop = false
    } else if (isDesktop) {
        isMobile = false
    }

    // If still unknown after primary checks, but contains "mobile", consider it mobile.
    if (type === 'unknown' && /\bmobile\b/.test(ua)) {
        isMobile = true
        isDesktop = false
        // We don't know the specific OS (like KaiOS, Tizen, etc.), so type remains 'unknown'
        // or you could add a generic 'other-mobile' type.
    }

    // Final fallback: if no specific mobile or desktop OS detected, but not explicitly mobile,
    // and it's a browser environment, it's likely desktop.
    if (type === 'unknown' && !isMobile && typeof navigator !== 'undefined') {
        type = 'desktop'
        isDesktop = true
    }


    return {
        type,
        isMobile,
        isDesktop,
        userAgent: ua,
    }
}
