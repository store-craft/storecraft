import screens from "../screens.js"
import create from './create-media-query-hook'

export const { 
  useBreakpoint,
  useBreakpointEffect,
  useBreakpointValue 
} = create(screens)