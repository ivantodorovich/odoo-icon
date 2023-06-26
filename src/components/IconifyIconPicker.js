/*
    Copyright 2022 Iván Todorovich
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

import { useState, useEffect } from 'react';
import { getCombinedPathFromSvg } from '../icon/svg.js';
import Iconify from '@iconify/iconify'

const DEFAULT_ICON_NAME = "mdi:home";


const IconifyIconPicker = ({ name, required, placeholder, defaultValue, onChange }) => {

    const [iconName, setIconName] = useState(defaultValue || DEFAULT_ICON_NAME);

    useEffect(() => {
        (async () => {
            const iconNameSanitized = iconName.toLowerCase().trim();
            try {
                if (!Iconify.iconExists(iconNameSanitized)) {
                    await Iconify.loadIcon(iconNameSanitized);
                }
            } catch (e) {
                return;
            }
            const iconSVG = Iconify.renderSVG(iconNameSanitized).outerHTML;
            const iconPath = getCombinedPathFromSvg(iconSVG);
            onChange && onChange({ iconPath: iconPath, name: iconNameSanitized });
        })();
    }, [iconName, onChange]);

    return (
        <input
            type="text"
            name={name}
            placeholder={placeholder}
            required={required}
            value={iconName}
            onChange={e => setIconName(e.target.value)}
        />
    );
}

export default IconifyIconPicker;
