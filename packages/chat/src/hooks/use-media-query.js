import screens from "../../screens.js"
import create from './createMediaQueryHook.js'

export const { 
    useBreakpoint,
    useBreakpointEffect,
    useBreakpointValue 
} = create(screens)