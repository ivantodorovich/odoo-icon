
/*
    Copyright 2022 Iván Todorovich
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
import paper from 'paper';

const {Numerical} = paper;

/**
 * Converts the bezier parametrisation from the default form
 * P(t) = (1-t)³ P_1 + 3(1-t)²t P_2 + 3(1-t)t² P_3 + t³ x_4
 * to the a form which can be differentiated more easily
 * P(t) = a t³ + b t² + c t + P0
 * 
 * @param {Number[]} v the curve values
 * @returns {Number[]} the bezier parameter size [ax, ay, bx, by, cx, cy, x0, y0]
 */
 export function bezierParameterize(v) {
    const [bx0, by0, bx1, by1, bx2, by2, bx3, by3] = v;
    const x0 = bx0;
    const y0 = by0;
    const cx = (bx1 - x0) * 3;
    const bx = (bx2 - bx1) * 3 - cx;
    const ax = bx3 - x0 - cx - bx;
    const cy = (by1 - y0) * 3;
    const by = (by2 - by1) * 3 - cy;
    const ay = by3 - y0 - cy - by;
    return [ax, ay, bx, by, cx, cy, x0, y0];
}

/**
 * Get the time from slope along a bezier curve
 * @param {Number[]} v the curve values
 * @param {Number} dx
 * @param {Number} dy
 * @returns {Number[]} the slope times
 */
 export function bezierTAtSlope(v, [dx, dy]) {
    const [ax, ay, bx, by, cx, cy] = bezierParameterize(v);
    let slope, a, b, c = null;
    // quadratic coefficients of slope formula
    if (dx) {
        slope = dy / dx;
        a = ay * 3 - ax * 3 * slope;
        b = by * 2 - bx * 2 * slope;
        c = cy - cx * slope;
    } else if (dy) {
        slope = dx / dy;
        a = ax * 3 - ay * 3 * slope;
        b = bx * 2 - by * 2 * slope;
        c = cx - cy * slope;
    } else {
        return [];
    }
    const roots = [];
    const epsilon = Numerical.CURVETIME_EPSILON;
    const epsilonInv = 1 / epsilon;
    const tMin = epsilon;
    const tMax = 1 - tMin;
    Numerical.solveQuadratic(a, b, c, roots, tMin, tMax);
    return roots.map(n => Math.round(n * epsilonInv) / epsilonInv);
}
