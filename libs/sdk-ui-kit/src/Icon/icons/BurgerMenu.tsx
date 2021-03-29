// (C) 2021 GoodData Corporation
import React from "react";

import { IIconProps } from "../typings";

/**
 * @internal
 */
export const BurgerMenu: React.FC<IIconProps> = ({ color }) => {
    return (
        <svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(4 3)">
                <path d="M0 0h8v2H0V0zm0 4h8v2H0V4zm0 4h8v2H0V8z" fill={color ?? "currentColor"} />
            </g>
        </svg>
    );
};