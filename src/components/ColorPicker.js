/*
    Copyright 2022 Iván Todorovich
    @author Iván Todorovich <ivan.todorovich@gmail.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/

import './ColorPicker.css';
import React from 'react';

export const DEFAULT_COLORS = [
    "#e53935",
    "#d81b60",
    "#8e24aa",
    "#5e35b1",
    "#3949ab",
    "#1e88e5",
    "#039be5",
    "#00acc1",
    "#00897b",
    "#43a047",
    "#7cb342",
    "#c0ca33",
    "#fdd835",
    "#ffb300",
    "#fb8c00",
    "#f4511e",
    "#757575",
    "#546e7a",
];


const ColorPicker = ({value, colors, onChange}) => {
    colors ??= DEFAULT_COLORS;

    const buttons = [];
    for (const color of colors) {
        buttons.push(
            <button
                key={color}
                style={{backgroundColor: color}}
                className={color === value ? 'selected' : ''}
                onClick={() => onChange(color)}
            />
        )
    }
    return (
        <figure>
            {buttons}
        </figure>
    );
}

export default ColorPicker;
