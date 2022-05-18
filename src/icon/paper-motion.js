/*
    Copyright 2022 Iván Todorovich
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

import paper from 'paper';
import {bezierTAtSlope, bezierSplitAtT} from './bezier.js';

const {Curve, Path, CompoundPath} = paper;


function radians(degrees) {
    return degrees * (Math.PI/180);
}


/**
 * @param {Path|CompoundPath} path 
 * @param {Number} angle 
 * @param {Number} distance 
 * @return {CompoundPath}
 */
export function paperMotionEffect(path, angle=45, distance=100, insert=true) {
    if (!["CompoundPath", "Path"].includes(path.className)) {
        throw new TypeError("`path` has to be a Path or CompoundPath");
    }
    const delx = Math.cos(radians(angle)) * distance;
    const dely = Math.sin(radians(angle)) * distance;
    const paths = path.className === "Path" ? [path] : path.children;

    function processCurve(curve, delx, dely) {
        const bez = curve.points.map(p => [p.x, p.y]);
        const tees = bezierTAtSlope(bez, [delx, dely]).filter(i => (0 < i) && (i < 1)).sort();
        const faceCurves = [];

        if (tees.length === 1) {
            const [one, two] = bezierSplitAtT(bez, tees[0]);
            faceCurves.push(new Curve(...one.flat()));
            faceCurves.push(new Curve(...two.flat()));
        } else if (tees.length === 2) {
            const [one] = bezierSplitAtT(bez, tees[0]);
            const [two, three] = bezierSplitAtT(bez, tees[1]);
            faceCurves.push(new Curve(...one.flat()));
            faceCurves.push(new Curve(...two.flat()));
            faceCurves.push(new Curve(...three.flat()));
        } else {
            faceCurves.push(new Curve(...bez.flat()));
        }

        const paths = [];
        for (const faceCurve of faceCurves) {
            const path = new Path({insert: false});
            path.moveTo(faceCurve.point1);
            path.cubicCurveTo(...faceCurve.points.slice(-3));
            const reversed = faceCurve.reversed();
            reversed.point1.x += delx;
            reversed.point1.y += dely;
            reversed.point2.x += delx;
            reversed.point2.y += dely;
            path.lineTo(reversed.point1);
            path.cubicCurveTo(...reversed.points.slice(-3));
            path.closePath();
            paths.push(path);
        }

        return paths.reduce((path1, path2) => path1.unite(path2, {insert: false}));
    }

    const shadowPaths = new CompoundPath({insert: insert});
    for (const path of paths) {
        const shadowPathFaces = path.curves.map(curve => processCurve(curve, delx, dely));
        const shadowPath = shadowPathFaces.reduce((path1, path2) => path1.unite(path2, {insert: false}));
        shadowPaths.addChild(shadowPath);
    }

    return shadowPaths
}
