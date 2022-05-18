import SVGPathCommander from 'svg-path-commander';
import {bezierTAtSlope, bezierSplitAtT, bezierTranslate} from './bezier.js';
import {radians} from './math.js';
import paper from 'paper';

const {splitPath, pathLengthFactory} = SVGPathCommander;


export function svgPathCommander() {
    return new SVGPathCommander(...arguments);
}

export function svgPathCommanderFromSegments(segments) {
    const tmpPathCommander = new SVGPathCommander("M0 0");
    tmpPathCommander.segments = segments;
    return tmpPathCommander;
}

export function svgCommandProxy(segment, prevPoint={x: 0, y: 0}, prevLength=0) {
    const [command, ...params] = segment;
    const {point, length} = pathLengthFactory([["M", prevPoint.x, prevPoint.y], segment], Infinity);
    return {
        data: segment,
        command: command,
        params: params,
        prevPoint: prevPoint,
        nextPoint: point,
        prevLength: prevLength,
        nextLength: prevLength + length,
        length: length,
    }
}

export function* svgCommandProxyIterator(segments) {
    const nodes = splitPath(segments);
    for (const node of nodes) {
        let prevPoint = {x: 0, y: 0};
        let nodeLength = 0;
        for (const segment of node) {
            const item = svgCommandProxy(segment, prevPoint, nodeLength);
            nodeLength += item.length;
            prevPoint = item.nextPoint;
            yield item;
        }
    }
}

export function resizePathToFit(path, size) {
    if (isNaN(size) || size <= 0) {
        throw TypeError("`size` has to be a Number bigger than 0");
    }
    const pathCommander = new SVGPathCommander(path);
    const boundingBox = pathCommander.getBBox();
    const scaleX = size / (boundingBox.x2 - boundingBox.x);
    const scaleY = size / (boundingBox.y2 - boundingBox.y);
    const scale = Math.min(scaleX, scaleY);
    return pathCommander.transform({scale: scale}).toString();
}

export function getShadowPath(pathData, angle=45, distance=10) {
    const pathCmd = new SVGPathCommander(pathData).toCurve().normalize();
    const delx = Math.cos(radians(angle)) * distance;
    const dely = Math.sin(radians(angle)) * distance;

    function makeFace(prevPoint, segment, delx, dely) {
        // Build translated segment
        const [command, ...params] = segment;
        const npt = svgCommandProxy([command, ...bezierTranslate(params, delx, dely)]);
        // Build reversed
        const rev = svgCommandProxy(
            npt.command === "C" ?
            ["C", npt.params[2], npt.params[3], npt.params[0], npt.params[1], prevPoint.x + delx, prevPoint.y + dely] :
            ["L", prevPoint.x + delx, prevPoint.y + dely]
        );

        return [
            ["M", prevPoint.x, prevPoint.y],
            segment,
            ["L", npt.nextPoint.x, npt.nextPoint.y],
            rev.data,
            ["Z"]
        ];
    }

    function processSegment(segment, delx, dely) {
        const faceSegments = [];

        const bez = [
            [segment.prevPoint.x, segment.prevPoint.y],
            [segment.params[0], segment.params[1]],
            [segment.params[2], segment.params[3]],
            [segment.params[4], segment.params[5]],
        ]
        const tees = bezierTAtSlope(bez, [delx, dely]).filter(i => (0 < i) && (i < 1)).sort();
        if (tees.length === 1) {
            const [one, two] = bezierSplitAtT(bez, tees[0]);
            faceSegments.push(["C", ...one[1], ...one[2], ...one[3]]);
            faceSegments.push(["C", ...two[1], ...two[2], ...two[3]]);
        } else if (tees.length === 2) {
            const [one, _] = bezierSplitAtT(bez, tees[0]);
            const [two, three] = bezierSplitAtT(bez, tees[1]);
            faceSegments.push(["C", ...one[1], ...one[2], ...one[3]]);
            faceSegments.push(["C", ...two[1], ...two[2], ...two[3]]);
            faceSegments.push(["C", ...three[1], ...three[2], ...three[3]]);
        } else {
            faceSegments.push(segment.data);
        }

        const facePaths = [];
        faceSegments.unshift(["M", segment.prevPoint.x, segment.prevPoint.y]);
        for (const faceSegment of svgCommandProxyIterator(faceSegments)) {
            if (faceSegment.command === "M") {
                continue;
            }
            facePaths.push(makeFace(faceSegment.prevPoint, faceSegment.data, delx, dely));
        }

        return facePaths;
    }

    const compositePaths = splitPath(pathCmd.segments);
    const shadowPaths = [];
    for (const path of compositePaths) {
        for (const segment of svgCommandProxyIterator(path)) {
            for (const facePath of processSegment(segment, delx, dely)) {
                shadowPaths.push(facePath)
            }
        }
    }

    // Here we need to combine all faces using binary operation
    // Easiest thing is to use paper.js here, although the whole requirement seems too much
    // TODO: Find another library or another way to unite / combine paths
    let shadowPath = new paper.CompoundPath();
    for (const shadowFace of shadowPaths) {
        const shadowFacePathData = svgPathCommanderFromSegments(shadowFace).toString();
        const paperShadowFace = new paper.CompoundPath(shadowFacePathData);
        shadowPath = shadowPath.unite(paperShadowFace);
    }
    return new SVGPathCommander(shadowPath.pathData).optimize().toString();
}

export function getCombinedPathFromSvg(svg) {
    const pathItem = paper.project.importSVG(svg);

    // Get Path and CompoundPath which are children from this item
    let paths = pathItem.getItems({className: 'Path'});
    let compoundPaths = pathItem.getItems({className: 'CompoundPath'});

    // Filter paths that are inside CompoundPaths
    paths = paths    
        .filter((p) => !compoundPaths.some((cp) => cp.children.includes(p)))
        .filter((p) => !p.clipMask);
    compoundPaths = compoundPaths
        .filter((c) => !c.clipMask);

    // Close all paths to ensure a correct union
    for (const path of compoundPaths.filter((c) => !c.closed)) { path.closePath(); }
    for (const path of paths.filter((c) => !c.closed)) { path.closePath(); }

    // If not paths or compound paths are available, return empty pathData
    if (!paths.length && !compoundPaths.length) { return []; }

    // Merge all the paths to build a single path
    let unitedItem = undefined;
    let compoundPathsStartIndex = 0;
    if (paths.length) {
        unitedItem = paths[0];
        for (let n = 1; n < paths.length; ++n) {
            const path = paths[n];
            unitedItem = unitedItem.unite(path);
        }
    } else {
        unitedItem = compoundPaths[0];
        compoundPathsStartIndex = 1;
    }

    for (let n = compoundPathsStartIndex; n < compoundPaths.length; ++n) {
        const path = compoundPaths[n];
        unitedItem = unitedItem.unite(path);
    }

    return unitedItem.pathData;
}
