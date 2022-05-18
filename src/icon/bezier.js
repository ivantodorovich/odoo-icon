
/*
    Copyright 2022 Iván Todorovich
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
import Decimal from 'decimal.js';

/**
 * Get the Cubic function, moic formular of roots, simple root
 */
export function rootWrapper(root_a, root_b, root_c, root_d) {
    if (root_a) {
        // Monics formula, see
        // http://en.wikipedia.org/wiki/Cubic_function#Monic_formula_of_roots
        const mono_a = root_b.div(root_a);
        const mono_b = root_c.div(root_a);
        const mono_c = root_d.div(root_a);
        const m = Decimal(2.0).times(mono_a.pow(3)).minus(Decimal(9.0).times(mono_a).times(mono_b)).plus(Decimal(27).times(mono_c))
        const k = mono_a.pow(2).minus(Decimal(3).times(mono_b));
        const n = m.pow(2).minus(Decimal(4).times(k.pow(3)));
        const w1 = Decimal(-0.5).plus(Decimal(0.5).times(Decimal(-3).sqrt()));
        const w2 = Decimal(-0.5).minus(Decimal(0.5).times(Decimal(-3).sqrt()));
        let m1;
        let n1;
        if (n < 0) {
            m1 = m.plus(n.sqrt()).div(2).pow(1.0 / 3.0);
            n1 = m.minus(n.sqrt()).div(2).pow(1.0 / 3.0);
        } else { 
            m1 = (m.plus(n.sqrt()) < 0) ?
                m.plus(n.sqrt()).negated().div(2).pow(1.0 / 3.0) :
                m.plus(n.sqrt()).div(2).pow(1.0 / 3.0);
            n1 = (m.minus(n.sqrt()) < 0) ?
                m.minus(n.sqrt()).negated().div(2).pow(1.0 / 3.0) :
                m.minus(n.sqrt()).div(2).pow(1.0 / 3.0);
        }
        return [
            Decimal(-1.0).div(3).times(mono_a.add(m1).add(n1)),
            Decimal(-1.0).div(3).times(mono_a.add(w1.times(m1)).add(w2.times(n1))),
            Decimal(-1.0).div(3).times(mono_a.add(w2.times(m1)).add(w1.times(n1))),
        ];
    }
    if (root_b) {
        const det = root_c.pow(2.0).minus(Decimal(4.0).times(root_b).times(root_d));
        if (det) {
            return [
                (root_c.negated().plus(det.sqrt())).div(root_b.times(2.0)),
                (root_c.negated().minus(det.sqrt())).div(root_b.times(2.0)),
            ];
        } else {
            return [root_c.negated().div(root_b.times(2.0))];
        }
    }
    if (root_c) {
        return [root_d.negated().div(root_c)]
    }
    return [];
}

/**
 * Converts the bezier parametrisation from the default form
 * P(t) = (1-t)³ P_1 + 3(1-t)²t P_2 + 3(1-t)t² P_3 + t³ x_4
 * to the a form which can be differentiated more easily
 * P(t) = a t³ + b t² + c t + P0
 * 
 * @param bez Array of Array defining the points of a bezier curve:
 *            startPoint, startControlPoint, endControlPoint, endPoint
 * @returns the bezier parameter size [ax, ay, bx, by, cx, cy, x0, y0]
 */
export function bezierParameterize([[bx0, by0], [bx1, by1], [bx2, by2], [bx3, by3]]) {
    const x0 = Decimal(bx0);
    const y0 = Decimal(by0);
    const cx = Decimal(bx1).minus(x0).times(3);
    const bx = Decimal(bx2).minus(bx1).times(3).minus(cx);
    const ax = Decimal(bx3 - x0 - cx - bx);
    const cy = Decimal(by1 - y0).times(3);
    const by = Decimal(by2 - by1).times(3).minus(cy);
    const ay = Decimal(by3 - y0 - cy - by);
    return [ax, ay, bx, by, cx, cy, x0, y0];
}

/**
 * Get the time from slope along a bezier curve
 */
export function bezierTAtSlope(bez, [dx, dy]) {
    const [ax, ay, bx, by, cx, cy] = bezierParameterize(bez).map(Decimal);
    let slope, a, b, c = null;
    // quadratic coefficients of slope formula
    if (dx) {
        slope = Decimal(dy).div(Decimal(dx)).times(1.0);
        a = ay.times(3).minus(ax.times(3).times(slope))
        b = by.times(2).minus(bx.times(2).times(slope))
        c = cy.minus(cx.times(slope))
    } else if (dy) {
        slope = Decimal(dx).div(Decimal(dy)).times(1.0);
        a = ax.times(3).minus(ay.times(3).times(slope))
        b = bx.times(2).minus(by.times(2).times(slope))
        c = cx.minus(cy.times(slope))
    } else {
        return [];
    }
    return rootWrapper(0, a, b, c).filter(i => (0 <= i) && (i <= 1));
}

/**
 * Linearly interpolate between p1 and p2
 */
export function tPoint([x1, y1], [x2, y2], t) {
    return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
}

/**
 * Split bezier at given time
 */
export function bezierSplitAtT(bez, t) {
    const [[bx0, by0], [bx1, by1], [bx2, by2], [bx3, by3]] = bez;
    const m1 = tPoint([bx0, by0], [bx1, by1], t)
    const m2 = tPoint([bx1, by1], [bx2, by2], t)
    const m3 = tPoint([bx2, by2], [bx3, by3], t)
    const m4 = tPoint(m1, m2, t)
    const m5 = tPoint(m2, m3, t)
    const m = tPoint(m4, m5, t)
    return [
        [[bx0, by0], m1, m4, m],
        [m, m5, m3, [bx3, by3]],
    ];
}
