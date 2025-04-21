

export type withDash<T> = {
  dash: T
}
export type withDashDiv<T> = withDash<T> & React.ComponentProps<"div">
export type withDiv<T> = T & React.ComponentProps<"div">