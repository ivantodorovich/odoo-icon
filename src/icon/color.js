
export function adjustColor(color, amount) {
    const rgb = color.replace(/^#/, "").match(/../g).map(hex => parseInt(hex, 16));
    const rgbRes = rgb.map(c => Math.min(255, Math.max(0, Math.round(c + (255 * amount)))));
    const hexRes = rgbRes.map(c => c.toString(16).padStart(2, "0")).join("");
    return `#${hexRes}`
}
