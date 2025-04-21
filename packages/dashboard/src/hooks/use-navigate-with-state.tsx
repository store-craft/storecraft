import React, { useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export type LinkWithStateProps = {
  to: import('react-router-dom').To
  current_state: any | (() => any)
  next_state?: any | (() => any)
  onClick?: () => any
} & React.AnchorHTMLAttributes<HTMLAnchorElement>


export const LinkWithState = (
  { 
    to, current_state, next_state, onClick, ...rest 
  }: LinkWithStateProps
) => {

  const {
    navWithState
  } = useNavigateWithState()

  const onClickInternal = useCallback(
    (e) => {
      current_state = (typeof current_state === 'function') ? current_state() : current_state
      next_state = (typeof next_state === 'function') ? next_state() : next_state

      navWithState(to, current_state, next_state);
      onClick && onClick();
      e.preventDefault();
    }, [to, onClick, navWithState, current_state, next_state]
  )

  return (
    <Link to={to} onClick={onClickInternal} {...rest} />
  )
}

/**
 * A hook that navigates, BUT saves the state of the current
 */
const useNavigateWithState = () => {
  const location = useLocation()
  const nav = useNavigate()

  const navWithState = useCallback(

    (to: import('react-router-dom').To, current_state?: (() => any) | any, next_state?: (() => any) | any) => {
      current_state = (typeof current_state === 'function') ? current_state() : current_state
      next_state = (typeof next_state === 'function') ? next_state() : next_state
      // rewrite the current route with the state
      // console.log('current_state', current_state)
      // console.log('next_state', next_state)
      if(current_state!==undefined)
        nav(location, { replace: true, state: current_state })
      // navigate to new url
      nav(to, { state: next_state })
    }, [nav, location]
  )
  
  return {
    nav,
    navWithState, 
    location,
    state: location.state
  }
}

export default useNavigateWithState