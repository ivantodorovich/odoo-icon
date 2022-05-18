/*
    Copyright 2022 Iván Todorovich
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

export function adjustColor(color, amount = 0) {
    if (amount === 0) return color;
    const rgb = color.replace(/^#/, "").match(/../g).map(hex => parseInt(hex, 16));
    const rgbRes = rgb.map(c => Math.min(255, Math.max(0, Math.round(c + (255 * amount)))));
    const hexRes = rgbRes.map(c => c.toString(16).padStart(2, "0")).join("");
    return `#${hexRes}`
}
