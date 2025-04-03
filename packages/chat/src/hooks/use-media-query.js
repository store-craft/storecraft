import screens from "../screens.js"
import create from './create-media-query-hook.js'

export const { 
    useBreakpoint,
    useBreakpointEffect,
    useBreakpointValue 
} = create(screens)