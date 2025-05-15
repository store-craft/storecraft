
export type scroll_snapshop = { 
  scrollLeft: number, scrollTop: number,
  scrollWidth: number, scrollHeight: number,
  clientLeft: number, clientTop: number, 
  clientWidth: number, clientHeight: number, 
}

export const delta_to_scroll_end = (info?: scroll_snapshop) => {
  if(!info)
    return Number.POSITIVE_INFINITY;
  const a = info?.clientHeight;
  const b = info?.scrollHeight;
  const c = info?.scrollTop;

  return b - (a + c);
}
