/*
    Copyright 2022 Iván Todorovich
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

import paper from 'paper';
import { adjustColor } from './color.js';
import {paperMotionEffect} from './paper-motion.js';

const WATERMARK = "Generated with https://ivantodorovich.github.io/odoo-icon";


class AbstractIcon {
    constructor(options) {
        this.options = Object.assign({}, this.defaultOptions, options);
        this.canvas = this.options.canvas || document.createElement("canvas");
        this.canvas.width = this.options.size;
        this.canvas.height = this.options.size;
        this.project = new paper.Project(this.canvas);
        this.project.view.viewSize.width = this.options.size;
        this.project.view.viewSize.height = this.options.size;
        this.redraw();
    }
    get defaultOptions() {
        return {
            size: 70,
            iconSize: 1,
            iconColor: "#000000",
            iconPathData: "",
        }
    }
    get iconPathData() {
        return this.options.iconPathData;
    }
    redraw() {
        this.project.clear();
        this.project.activate();
    }
    exportOptions() {
        const exportedOptions = Object.assign({}, this.options);
        delete exportedOptions.canvas;
        return exportedOptions;
    }
    exportSVG(asString = false) {
        const svg = this.project.exportSVG();
        svg.prepend(document.createComment(` ${WATERMARK} `));
        return asString ? new XMLSerializer().serializeToString(svg) : svg;
    }
    getSVGDataURL() {
        const svgString = this.exportSVG(true);
        const svgBlob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
        return URL.createObjectURL(svgBlob);
    }
    getPNGDataURL() {
        return this.canvas.toDataURL("image/png");
    }
}


class AbstractOdooIcon extends AbstractIcon {
    get defaultOptions() {
        return Object.assign(super.defaultOptions, {
            iconSize: 0.65,
            iconColor: "#FFFFFF",
            iconFlatShadowAngle: 135,
            backgroundColor: "#000000",
        })
    }
    get absIconSize() {
        return Math.ceil(this.options.iconSize * this.options.size);
    }
}


export class Odoo11Icon extends AbstractOdooIcon {
    drawBox() {
        return new paper.Path.Rectangle({
            name: "box",
            from: [0, 0],
            to: [this.options.size, this.options.size],
            fillColor: this.options.backgroundColor,
        })
    }
    drawIcon() {
        const boxSize = this.options.size;
        const iconSize = this.absIconSize;
        const iconBounds = new paper.Rectangle(
            boxSize / 2 - iconSize / 2,
            boxSize / 2 - iconSize / 2,
            iconSize,
            iconSize,
        );
        const icon = new paper.CompoundPath(this.options.iconPathData);
        icon.name = "icon";
        icon.fillColor = this.options.iconColor;
        icon.fitBounds(iconBounds);
        return icon;
    }
    drawIconFlatShadow() {
        const icon = this.project.getItem({name: "icon"});
        const box = this.project.getItem({name: "box"});
        const shadowPathRaw = paperMotionEffect(
            icon,
            this.options.iconFlatShadowAngle,
            this.options.size,
            false,
        );
        const shadowPath = shadowPathRaw.intersect(box, {insert: false});
        shadowPath.fillColor = "black";
        shadowPath.opacity = 0.324;
        shadowPath.name = "flatShadow";
        shadowPath.insertBelow(icon);
        return shadowPath;
    }
    redraw() {
        super.redraw();
        this.drawBox();
        this.drawIcon();
        this.drawIconFlatShadow();
    }
}


export class Odoo12Icon extends AbstractOdooIcon {
    get defaultOptions() {
        return Object.assign(super.defaultOptions, {
            backgroundGradient: 0.2,
            boxRadius: 3.5,
        })
    }
    get absIconSize() {
        return Math.ceil(this.options.iconSize * this.options.size);
    }
    drawBox() {
        return new paper.Path.Rectangle({
            name: "box",
            from: [0, 0],
            to: [this.options.size, this.options.size],
            radius: this.options.boxRadius,
            fillColor: {
                gradient: {
                    stops: [
                        adjustColor(this.options.backgroundColor, this.options.backgroundGradient),
                        this.options.backgroundColor,
                    ],
                },
                origin: [this.options.size, 0],
                destination: [0, this.options.size],
            }
        })
    }
    drawIcon() {
        const boxSize = this.options.size;
        const iconSize = this.absIconSize;
        const iconBounds = new paper.Rectangle(
            boxSize / 2 - iconSize / 2,
            boxSize / 2 - iconSize / 2,
            iconSize,
            iconSize,
        );
        const icon = new paper.CompoundPath(this.options.iconPathData);
        icon.name = "icon";
        icon.fillColor = this.options.iconColor;
        icon.fitBounds(iconBounds);
        return icon;
    }
    drawIconShadow() {
        const icon = this.project.getItem({name: "icon"});
        const iconShadow = icon.clone({insert: false});
        iconShadow.name = "shadow";
        iconShadow.fillColor = "black";
        iconShadow.position.y += 2;
        iconShadow.opacity = 0.3;
        iconShadow.insertBelow(icon);
        return iconShadow;
    }
    drawIconFlatShadow() {
        const icon = this.project.getItem({name: "icon"});
        const box = this.project.getItem({name: "box"});
        const boxSize = this.options.size;
        const shadowPathRaw = paperMotionEffect(icon, 135, boxSize, false);
        const shadowPath = shadowPathRaw.intersect(box, {insert: false});
        shadowPath.fillColor = "black";
        shadowPath.opacity = 0.324;
        shadowPath.name = "flatShadow";
        shadowPath.insertBelow(icon);
        return shadowPath;
    }
    drawBoxInnerShadow() {
        const box = this.project.getItem({name: "box"});
        // Hardcoded (for now) box 3d effect shadows
        const topBoxShadowRaw = new paper.Path("M4,1.8 L65,1.8 C67.6666667,1.8 69.3333333,1.13333333 70,-0.2 C70,2.46666667 70,3.46666667 70,2.8 L1.10547097e-14,2.8 C-1.65952376e-14,3.46666667 -2.9161925e-14,2.46666667 -2.66453526e-14,-0.2 C0.666666667,1.13333333 2,1.8 4,1.8 Z")
        topBoxShadowRaw.transform(new paper.Matrix([1, 0, 0, -1, 0, 2.8]));
        const topBoxShadow = topBoxShadowRaw.intersect(box);
        topBoxShadowRaw.remove();
        topBoxShadow.name = "topBoxShadow";
        topBoxShadow.fillColor = "white";
        topBoxShadow.opacity = 0.383;
        const bottomBoxShadowRaw = new paper.Path("M4,4 L65,4 C67.6666667,4 69.3333333,3 70,1 C70,3.66666667 70,5 70,5 L1.77635684e-15,5 C1.77635684e-15,5 1.77635684e-15,3.66666667 1.77635684e-15,1 C0.666666667,3 2,4 4,4 Z")
        bottomBoxShadowRaw.translate(0, 65);
        const bottomBoxShadow = bottomBoxShadowRaw.intersect(box);
        bottomBoxShadowRaw.remove();
        bottomBoxShadow.name = "bottomBoxShadow";
        bottomBoxShadow.fillColor = "black";
        bottomBoxShadow.opacity = 0.383;
        return [topBoxShadow, bottomBoxShadow];
    }
    redraw() {
        super.redraw();
        this.drawBox();
        this.drawBoxInnerShadow();
        this.drawIcon();
        this.drawIconShadow();
        this.drawIconFlatShadow();
    }
}


export class Odoo13Icon extends Odoo12Icon {}
export class Odoo14Icon extends Odoo12Icon {}
export class Odoo15Icon extends Odoo12Icon {}
export class Odoo16Icon extends Odoo12Icon {}


export const OdooIcons = {
    "11.0": Odoo11Icon,
    "12.0": Odoo12Icon,
    "13.0": Odoo13Icon,
    "14.0": Odoo14Icon,
    "15.0": Odoo15Icon,
    "16.0": Odoo16Icon,
}
