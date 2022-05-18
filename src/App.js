import './App.css';
import React, { useState, useEffect } from 'react';
import github from './github.svg';
import ColorPicker, { DEFAULT_COLORS } from './components/ColorPicker';
import {makeOdooIconSVG} from './icon/icon.js';
import {getCombinedPathFromSvg} from './icon/svg.js';
import {iconExists, loadIcon, renderSVG} from '@iconify/iconify';


const App = () => {

    const VERSIONS = ["15.0"];

    const [iconSpec, setIconSpec] = useState({
        version: VERSIONS[VERSIONS.length -1],
        iconPath: null,
        color: DEFAULT_COLORS[Math.floor(Math.random()*DEFAULT_COLORS.length)],
        size: 65,
    });

    const [iconName, setIconName] = useState("mdi:home");
    const [loading, setLoading] = useState();
    const [iconSvg, setIconSvg] = useState();

    function getSvgObjectURL() {
        const svgBlob = new Blob([iconSvg], {type: "image/svg+xml;charset=utf-8"});
        return URL.createObjectURL(svgBlob);
    }

    function getPNGObjectURL() {
        return new Promise((resolve, reject) => {
            const img = document.createElement("img");
            img.onload = () => {
                // Get dimensions
                document.body.appendChild(img);
                const ratio = (img.clientWidth / img.clientHeight) || 1;
                const width = img.clientWidth;
                const height = img.clientWidth / ratio;
                document.body.removeChild(img);
                // Create canvas
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const canvasCtx = canvas.getContext("2d");
                canvasCtx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/png"));
            }
            img.src = getSvgObjectURL();
        });
    }

    function downloadObjectURL(url, filename) {
        const anchor = document.createElement("a");
        anchor.download = filename;
        anchor.href = url;
        anchor.click();
    }

    function downloadAsSVG() {
        return downloadObjectURL(getSvgObjectURL(), "icon.svg");
    }

    async function downloadAsPNG() {
        return downloadObjectURL(await getPNGObjectURL(), "icon.png");
    }

    useEffect(() => {
        (async () => {
            const {iconPath, color, size} = iconSpec;
            if (!iconPath) return;
            setLoading(true);
            const result = await makeOdooIconSVG(iconPath, color, size / 100);
            setIconSvg(result);
            setLoading(false);
        })().catch(console.error);
    }, [iconSpec]);

    useEffect(() => {
        (async () => {
            if (!iconExists(iconName)) await loadIcon(iconName);
            const iconSvg = renderSVG(iconName).outerHTML;
            const iconPath = getCombinedPathFromSvg(iconSvg);
            setIconSpec(iconSpec => {return {...iconSpec, iconPath}});
        })().catch(console.error);
    }, [iconName]);

    return (
        <main className="container">
            <h1>Hello, friend!</h1>
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
                        <a style={{float: 'right'}} href="https://icon-sets.iconify.design/">browse</a>
                        <input
                            type="text"
                            name="icon"
                            placeholder="fa fa-address"
                            required="required"
                            value={iconName}
                            onChange={e => setIconName(e.target.value)}
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
                    <div id="result" className={loading ? "loading" : null} dangerouslySetInnerHTML={{__html: iconSvg}}></div>
                    <hr />
                    <div className="grid">
                        <button className="secondary" onClick={downloadAsPNG}>PNG</button>
                        <button className="contrast" onClick={downloadAsSVG}>SVG</button>
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
