import { Easing } from '@sandlada/mdk'

export type TNavigationBarAnimationArgs = Parameters<Element['animate']>

export type TNavigationBarAnimation = {
    /**
     * Animations for the dialog itself.
     */
    dialog?: TNavigationBarAnimationArgs[]

    /**
     * Animations for the container of the dialog.
     */
    container?: TNavigationBarAnimationArgs[]

    /**
     * Animations for the contents section.
     */
    content?: TNavigationBarAnimationArgs[]
}

/**
 * The default dialog open animation.
 */
export const NavigationBarDefaultOpenAnimation: TNavigationBarAnimation = {
    dialog: [
        [
            // Dialog slide up
            [{ 'transform': 'translateY(100%)' }, { 'transform': 'translateY(0%)' }],
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

export const NavigationBarDefaultCloseAnimation: TNavigationBarAnimation = {
    dialog: [
        [
            // Dialog slide up
            [{ 'transform': 'translateY(0)' }, { 'transform': 'translateY(100%)' }],
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
