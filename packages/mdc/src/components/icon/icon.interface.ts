import type { LitElement } from 'lit'

/**
 * MDC Icon Attributes
 */
export interface IMDCIconAttributes {
    name       : string | undefined
    filled     : boolean
    weight     : number
    grade      : number
    opticalSize: number
}

/**
 * MDC Icon Events Map
 */
export interface IMDCIconEvents {
}

/**
 * MDC Icon Element Interface
 */
export interface IMDCIcon extends LitElement, IMDCIconAttributes {}
