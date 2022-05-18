/*
    Copyright 2022 Iván Todorovich
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

import paper from 'paper';


export function getCombinedPathFromSvg(svg) {
    const canvas = document.createElement("canvas");
    const project = new paper.Project(canvas);
    // Import svg
    const pathItem = project.importSVG(svg, {insert: false});
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
            unitedItem = unitedItem.unite(path, {insert: false});
        }
    } else {
        unitedItem = compoundPaths[0];
        compoundPathsStartIndex = 1;
    }

    for (let n = compoundPathsStartIndex; n < compoundPaths.length; ++n) {
        const path = compoundPaths[n];
        unitedItem = unitedItem.unite(path, {insert: false});
    }

    const result = unitedItem.pathData;
    project.remove();
    canvas.remove();
    return result;
}
