import { Easing } from '@sandlada/mdk'

export type TNavigationRailAnimationArgs = Parameters<Element['animate']>

export type TNavigationRailAnimation = {
    /**
     * Animations for the dialog itself.
     */
    dialog?: TNavigationRailAnimationArgs[]

    /**
     * Animations for the container of the dialog.
     */
    container?: TNavigationRailAnimationArgs[]

    /**
     * Animations for the contents section.
     */
    content?: TNavigationRailAnimationArgs[]
}

/**
 * The default dialog open animation.
 */
export const NavigationRailDefaultOpenAnimation: TNavigationRailAnimation = {
    dialog: [
        [
            // Dialog slide right
            [{ 'transform': 'translateX(-100%)' }, { 'transform': 'translateX(0)' }],
            { duration: 500, easing: Easing.Emphasized },
        ],
    ],
    container: [
        [
            // Container fade in
            [{ 'opacity': 0 }, { 'opacity': 1 }],
            { duration: 50, easing: 'linear', pseudoElement: '::before' },
        ],
    ],
    content: [
        [
            // Content fade in
            [{ 'opacity': 0 }, { 'opacity': 0, offset: 0.2 }, { 'opacity': 1 }],
            { duration: 250, easing: 'linear', fill: 'forwards' },
        ],
    ],
}

export const NavigationRailDefaultCloseAnimation: TNavigationRailAnimation = {
    dialog: [
        [
            // Dialog slide up
            [{ 'transform': 'translateX(0)' }, { 'transform': 'translateX(-100%)' }],
            { duration: 150, easing: Easing.EmphasizedAccelerate },
        ],
    ],
    container: [
        [
            // Container shrink
            [{ 'height': '100%' }, { 'height': '35%' }],
            {
                duration: 150,
                easing: Easing.EmphasizedAccelerate,
                pseudoElement: '::before',
            },
        ],
        [
            // Container fade out
            [{ 'opacity': '1' }, { 'opacity': '0' }],
            { delay: 100, duration: 50, easing: 'linear', pseudoElement: '::before' },
        ],
    ],
    content: [
        [
            // Content fade out
            [{ 'opacity': 1 }, { 'opacity': 0 }],
            { duration: 100, easing: 'linear', fill: 'forwards' },
        ],
    ],
}
