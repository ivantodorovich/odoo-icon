/*
    Copyright 2022 Iván Todorovich
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import {useDropzone} from 'react-dropzone';
import github from './github.svg';
import ColorPicker, { DEFAULT_COLORS } from './components/ColorPicker.js';
import IconifyIconPicker from './components/IconifyIconPicker.js';
import { OdooIcons, readIconSpecsFromString } from './icon/icon.js';
import { getCombinedPathFromSvg } from './icon/svg.js';
import { downloadObjectURL } from './utils/download.js';


const App = () => {

    const VERSIONS = Object.keys(OdooIcons).sort();

    const [iconSpec, setIconSpec] = useState({
        version: VERSIONS[VERSIONS.length -1],
        iconPath: null,
        iconIconifyName: null,
        color: DEFAULT_COLORS[Math.floor(Math.random()*DEFAULT_COLORS.length)],
        size: 65,
    });

    const [loading, setLoading] = useState();
    const [icon, setIcon] = useState();

    const onDrop = useCallback(acceptedFiles => {
        const validFiles = acceptedFiles.filter(file => file.type === "image/svg+xml");
        if (validFiles.length === 0) return;
        const file = validFiles[0];
        const reader = new FileReader();
        reader.onload = e => {
            const svgContent = e.target.result;
            const specs = readIconSpecsFromString(svgContent);
            if (specs.version) {
                console.log(specs);
                const newSpecs = {
                    version: specs.odooVersion,
                    size: specs.iconSize * 100,
                    color: specs.backgroundColor,
                    iconPath: specs.iconPathData,
                    iconNameSanitized: specs.iconIconifyName,
                }
                setIconSpec(iconSpec => {return {...iconSpec, ...newSpecs}})
            } else {
                const iconPath = getCombinedPathFromSvg(svgContent);
                setIconSpec(iconSpec => {return {...iconSpec, iconPath}});
            }
        }
        reader.readAsText(file);
    }, []);

    const onChangeIconPicker = useCallback(iconDetails => {
        setIconSpec(iconSpec => {return {...iconSpec, ...iconDetails}});
    }, []);

    const {getRootProps} = useDropzone({
        onDrop,
        noClick: true,
        noKeyboard: true,
    })

    useEffect(() => {
        const {version, iconPath, name, color, size} = iconSpec;
        setLoading(true);
        setIcon(new OdooIcons[version]({
            iconPathData: iconPath,
            iconIconifyName: name,
            backgroundColor: color,
            iconSize: size / 100,
        }));
        setLoading(false);
    }, [iconSpec]);

    return (
        <main className="container" {...getRootProps()}>
            <h1>Hello, friend!</h1>
            <p>
                You can use this tool to create your Odoo app icon. Simply play with the settings
                to achieve the desired result.
            </p>
            <p>
                The icons are taken from <a target="_new" href="https://icon-sets.iconify.design/">Iconify</a>,
                you can use their icon browser to find the icon name you want.<br/>
                Alternatively, you can drag and drop an SVG icon file onto the browser.
            </p>
            <p>
                This is an experimental version. If you find any bugs, please <a target="_new" className="secondary" href="https://github.com/ivantodorovich/odoo-icon/issues/new">submit a new issue</a>.
            </p>
            <ColorPicker value={iconSpec.color} onChange={color => setIconSpec({...iconSpec, color})} />
            <article className="grid" aria-label="Generator">
                <div id="left">
                    <label htmlFor="version">Odoo Version</label>
                    <select
                        name="version"
                        required="required"
                        value={iconSpec.version}
                        onChange={e => setIconSpec({...iconSpec, version: e.target.value})}
                    >
                        {VERSIONS.map(version => <option key={version} value={version}>{version}</option>)}
                    </select>
                    <label htmlFor="icon">
                        Iconify Icon Name
                        <IconifyIconPicker
                            name="icon"
                            required="required"
                            defaultValue="mdi:home"
                            onChange={onChangeIconPicker}
                        />
                    </label>
                    <details>
                        <summary>Advanced</summary>
                        <label htmlFor="size">
                            Size
                            <input
                                type="range"
                                name="size"
                                min="40"
                                max="90"
                                value={iconSpec.size}
                                onChange={e => setIconSpec({...iconSpec, size: e.target.value})}
                            />
                        </label>
                        <label htmlFor="color">
                            Color
                            <input
                                type="color"
                                name="color"
                                value={iconSpec.color}
                                onInput={e => setIconSpec({...iconSpec, color: e.target.value})}
                            />
                        </label>
                    </details>
                </div>
                <div id="right">
                    <div id="result" className={loading ? "loading" : null} dangerouslySetInnerHTML={{__html: icon && icon.exportSVG({asString: true})}}></div>
                    <hr />
                    <div className="grid">
                        <button className="secondary" onClick={async () => downloadObjectURL(await icon.getPNGDataURL(140), "icon.png")}>PNG</button>
                        <button className="contrast" onClick={async () => downloadObjectURL(await icon.getSVGDataURL(), "icon.svg")}>SVG</button>
                    </div>
                </div>
            </article>
            <footer>
                Created with ♥ by <a href="https://github.com/ivantodorovich" className="secondary">@ivantodorovich</a>
                <a href="https://github.com/ivantodorovich/odoo-icon" className="secondary" title="View source code">
                    <img src={github} style={{float: 'right'}} className="github-logo" alt="github" width="16" height="16" />
                </a>
            </footer>
        </main>
    );
}

export default App;
