export type BadgeSize = 'large' | 'small'
export const BadgeSize = {
    Large: 'large',
    Small: 'small',
} as const

export interface IBadge {
    size: BadgeSize
}
