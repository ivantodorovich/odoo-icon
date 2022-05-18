
/**
 * Get the Cubic function, moic formular of roots, simple root
 */
export function rootWrapper(root_a, root_b, root_c, root_d) {
    if (root_a) {
        // Monics formula, see
        // http://en.wikipedia.org/wiki/Cubic_function#Monic_formula_of_roots
        const mono_a = root_b / root_a;
        const mono_b = root_c / root_a
        const mono_c = root_d / root_a;
        const m = 2.0 * mono_a**3 - 9.0 * mono_a * mono_b + 27.0 * mono_c
        const k = mono_a**2 - 3.0 * mono_b
        const n = m**2 - 4.0 * k**3
        const w1 = -0.5 + 0.5 * Math.sqrt(-3.0)
        const w2 = -0.5 - 0.5 * Math.sqrt(-3.0)
        let m1;
        let n1;
        if (n < 0) {
            // m1 = Math.pow(complex((m + cmath.sqrt(n)) / 2), 1.0 / 3)
            // n1 = Math.pow(complex((m - cmath.sqrt(n)) / 2), 1.0 / 3)
            m1 = Math.pow((m + Math.sqrt(n)) / 2, 1.0 / 3);
            n1 = Math.pow((m - Math.sqrt(n)) / 2, 1.0 / 3);
        } else {
            m1 = (m + Math.sqrt(n) < 0) ? -Math.pow(-(m + Math.sqrt(n)) / 2, 1.0 / 3) : Math.pow((m + Math.sqrt(n)) / 2, 1.0 / 3)
            n1 = (m - Math.sqrt(n) < 0) ? -Math.pow(-(m - Math.sqrt(n)) / 2, 1.0 / 3) : Math.pow((m - Math.sqrt(n)) / 2, 1.0 / 3)
        }
        return [
            -1.0 / 3 * (mono_a + m1 + n1),
            -1.0 / 3 * (mono_a + w1 * m1 + w2 * n1),
            -1.0 / 3 * (mono_a + w2 * m1 + w1 * n1),
        ];
    }
    if (root_b) {
        const det = root_c**2.0 - 4.0 * root_b * root_d
        if (det) {
            return [
                (-root_c + Math.sqrt(det)) / (2.0 * root_b),
                (-root_c - Math.sqrt(det)) / (2.0 * root_b),
            ];
        } else {
            return [-root_c / (2.0 * root_b)];
        }
    }
    if (root_c) {
        return [1.0 * (-root_d / root_c)]
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
    const x0 = bx0;
    const y0 = by0;
    const cx = 3 * (bx1 - x0);
    const bx = 3 * (bx2 - bx1) - cx;
    const ax = bx3 - x0 - cx - bx;
    const cy = 3 * (by1 - y0);
    const by = 3 * (by2 - by1) - cy;
    const ay = by3 - y0 - cy - by;
    return [ax, ay, bx, by, cx, cy, x0, y0];
}

/**
 * Get the time from slope along a bezier curve
 */
export function bezierTAtSlope(bez, [dy, dx]) {
    const [ax, ay, bx, by, cx, cy, x0, y0] = bezierParameterize(bez);
    let slope, a, b, c = null;
    // quadratic coefficients of slope formula
    if (dx) {
        slope = 1.0 * (dy / dx);
        a = 3 * ay - 3 * ax * slope
        b = 2 * by - 2 * bx * slope
        c = cy - cx * slope
    } else if (dy) {
        slope = 1.0 * (dx / dy)
        a = 3 * ax - 3 * ay * slope
        b = 2 * bx - 2 * by * slope
        c = cx - cy * slope
    } else {
        return [];
    }
    const roots = rootWrapper(0, a, b, c);
    return roots.filter(i => (0 <= i) && (i <= 1));
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

export function bezierTranslate(bez, delx, dely) {
    const res = [];
    let isX = true;
    for (const param of bez) {
        res.push(param + (isX ? delx : dely));
        isX = !isX;
    }
    return res;
}
