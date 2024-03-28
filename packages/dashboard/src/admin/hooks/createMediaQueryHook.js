import React, { useEffect } from "react";

export const isSSR =
  typeof window === "undefined" || !window.navigator || /ServerSideRendering|^Deno\//.test(window.navigator.userAgent);

export const isBrowser = !isSSR;

export function create(screens) {
  if (!screens) {
    throw new Error("Failed to create breakpoint hooks, given `screens` value is invalid.");
  }

  function useBreakpoint(breakpoint, defaultValue = false) {
    const [match, setMatch] = React.useState(defaultValue)
    const matchRef = React.useRef(defaultValue)

    useEffect(
      () => {
        if (!(isBrowser && 'matchMedia' in window)) return undefined
  
        function track(e) {
          // @ts-expect-error accessing index with uncertain `screens` type
          const value = screens[breakpoint] ?? '999999px'
          const query = window.matchMedia(`(min-width: ${value})`)
          matchRef.current = query.matches
          // console.log('match ', match)
          if (matchRef.current != match) {
            setMatch(matchRef.current)
          }
        }
  
        window.addEventListener('resize', track, false)
        window.addEventListener('load', track, false)
        window.dispatchEvent(new Event('load'));
        return () => {
          window.removeEventListener('resize', track)
          window.removeEventListener('load', track)
        }
      }, [window, screens, breakpoint, defaultValue, isBrowser, match]
    )

    return match
  }

  function useBreakpointEffect(breakpoint, effect) {
    const match = useBreakpoint(breakpoint)
    React.useEffect(() => effect(match))
    return null;
  }

  function useBreakpointValue(breakpoint, valid, invalid) {
    const match = useBreakpoint(breakpoint)
    const value = React.useMemo(
      () => (match ? valid : invalid), 
      [invalid, match, valid]
    )
    return value;
  }

  return {
    useBreakpoint,
    useBreakpointEffect,
    useBreakpointValue,
  }
}

export default create;