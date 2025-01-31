// (C) 2020-2021 GoodData Corporation
import React from "react";
import { RankingFilterOperator } from "@gooddata/sdk-model";
import { FormattedMessage } from "react-intl";

import { IMeasureDropdownItem, IAttributeDropdownItem } from "./types";

interface IPreviewProps {
    measure: IMeasureDropdownItem;
    attribute?: IAttributeDropdownItem;
    operator: RankingFilterOperator;
    value: number;
}

const getPreviewTemplate = (operator: RankingFilterOperator, attribute?: IAttributeDropdownItem) => {
    switch (operator) {
        case "TOP":
            return attribute
                ? "rankingFilter.preview.top_with_attribute"
                : "rankingFilter.preview.top_without_attribute";
        case "BOTTOM":
            return attribute
                ? "rankingFilter.preview.bottom_with_attribute"
                : "rankingFilter.preview.bottom_without_attribute";
        default:
            throw new Error(`Operator '${operator}' is not supported!`);
    }
};

export const Preview: React.FC<IPreviewProps> = ({ operator, value, measure, attribute }) => (
    <div className="gd-rf-preview s-rf-preview">
        <FormattedMessage
            id={getPreviewTemplate(operator, attribute)}
            tagName="span"
            values={{
                measure: measure.title,
                attribute: attribute?.title,
                operator,
                value,
                strong: (chunks: string) => <strong>{chunks}</strong>,
            }}
        />
    </div>
);
