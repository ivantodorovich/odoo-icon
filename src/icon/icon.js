/*
    Copyright 2022 Odoo IT (https://www.odooit.dev).
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

import { resizePathToFit, getShadowPath, svgPathCommander } from './svg.js';
import { adjustColor } from './color.js';
import paper from 'paper';

// Setup paper.js
paper.settings.insertItems = false;
paper.setup(document.createElement("canvas"));


async function makeOdooIconSVG(iconPath, color, size=0.65) {
    if (isNaN(size) || size <= 0 || size > 1) {
        throw TypeError("`size` has to be a Number between 0 and 1");
    }
    const boxSize = 70;
    const iconSize = Math.ceil(boxSize * size);
    const iconPathFit = resizePathToFit(iconPath, iconSize);
    const shadowPath = getShadowPath(iconPathFit, 135, boxSize);
    // Center icon
    const iconBBox = svgPathCommander(iconPathFit).getBBox();
    const [posx, posy] = [(boxSize / 2) - (iconBBox.width / 2) - iconBBox.x, (boxSize / 2) - (iconBBox.height / 2) - iconBBox.y];

    return `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="70" height="70" viewBox="0 0 70 70">
        <defs>
            <path id="icon-card" d="M4 0c32.416 0 54.0836 0 61 0c4 0 5 1 5 5c0 38.0489 0 57.4235 0 60c0 4 -1 5 -5 5S9 70 4 70C1 70 0 69 0 65C0 62.4677 0 41.8005 0 5C0 1 1 0 4 0z"/>
            <linearGradient id="icon-card-bg" x1="100%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stop-color="${adjustColor(color, 0.2)}"/>
                <stop offset="100%" stop-color="${adjustColor(color, 0)}"/>
            </linearGradient>
            <path id="icon-d" d="${iconPathFit}"/>
            <path id="icon-shadow" d="${shadowPath}"/>
        </defs>
        <g fill="none" fill-rule="evenodd">
            <mask id="icon-b" fill="#fff">
                <use xlink:href="#icon-card"/>
            </mask>
            <g mask="url(#icon-b)">
                <rect width="70" height="70" fill="url(#icon-card-bg)"/>
                <path fill="#FFF" fill-opacity=".383" d="M4,1.8 L65,1.8 C67.6666667,1.8 69.3333333,1.13333333 70,-0.2 C70,2.46666667 70,3.46666667 70,2.8 L1.10547097e-14,2.8 C-1.65952376e-14,3.46666667 -2.9161925e-14,2.46666667 -2.66453526e-14,-0.2 C0.666666667,1.13333333 2,1.8 4,1.8 Z" transform="matrix(1 0 0 -1 0 2.8)"/>
                <path fill="#000" fill-opacity=".383" d="M4,4 L65,4 C67.6666667,4 69.3333333,3 70,1 C70,3.66666667 70,5 70,5 L1.77635684e-15,5 C1.77635684e-15,5 1.77635684e-15,3.66666667 1.77635684e-15,1 C0.666666667,3 2,4 4,4 Z" transform="translate(0 65)"/>
                <use fill="#393939" transform="translate(${posx}, ${posy})" opacity=".324" fill-rule="nonzero" href="#icon-shadow" />
                <use fill="#000" transform="translate(${posx}, ${posy})" y="2" fill-rule="nonzero" opacity=".3" href="#icon-d"/>
                <use fill="#FFF" transform="translate(${posx}, ${posy})" fill-rule="nonzero" href="#icon-d" />
            </g>
        </g>
    </svg>
    `
}

export {makeOdooIconSVG};
