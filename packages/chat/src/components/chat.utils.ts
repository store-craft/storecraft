

export const delta_to_scroll_end = (div?: HTMLDivElement) => {
  if(!div)
    return Number.POSITIVE_INFINITY;

  const a = div?.clientHeight;
  const b = div?.scrollHeight;
  const c = div?.scrollTop;

  return b - (a + c);
}
