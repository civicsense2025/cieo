export function motionAttrs(o = {}) {
    if (o.motion === false)
        return { 'data-motion': 'off' };
    const attrs = { 'data-motion': 'on' };
    if (o.entering !== undefined)
        attrs['data-entering'] = o.entering;
    if (o.exiting !== undefined)
        attrs['data-exiting'] = o.exiting;
    return attrs;
}
