// (C) 2021 GoodData Corporation

import { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { IInsightWidget } from "@gooddata/sdk-backend-spi";
import { IInsight } from "@gooddata/sdk-model";

import { selectExecutionResultByRef, useDashboardSelector } from "../../../model";

import { isDataError } from "../../../_staging/errors/errorPredicates";
import { useDashboardCustomizationsContext } from "../../dashboardContexts";
import {
    getDefaultInsightMenuItems,
    getDefaultLegacyInsightMenuItems,
    IInsightMenuItem,
} from "../insightMenu";

export const useInsightMenu = (config: {
    insight: IInsight;
    widget: IInsightWidget;
    exportCSVEnabled: boolean;
    exportXLSXEnabled: boolean;
    onExportCSV: () => void;
    onExportXLSX: () => void;
}): { menuItems: IInsightMenuItem[]; isMenuOpen: boolean; openMenu: () => void; closeMenu: () => void } => {
    const { exportCSVEnabled, exportXLSXEnabled, insight, onExportCSV, onExportXLSX, widget } = config;

    const intl = useIntl();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const closeMenu = useCallback(() => setIsMenuOpen(false), []);
    const openMenu = useCallback(() => setIsMenuOpen(true), []);

    const execution = useDashboardSelector(selectExecutionResultByRef(widget.ref));

    const { insightMenuItemsProvider } = useDashboardCustomizationsContext();

    const defaultMenuItems = useMemo<IInsightMenuItem[]>(() => {
        const useLegacyMenu = !insightMenuItemsProvider;

        const bubbleMessageKey = isDataError(execution?.error)
            ? "options.menu.unsupported.error"
            : "options.menu.unsupported.loading";

        const defaultMenuItemsGetter = useLegacyMenu
            ? getDefaultLegacyInsightMenuItems
            : getDefaultInsightMenuItems;

        return defaultMenuItemsGetter(intl, {
            exportCSVDisabled: !exportCSVEnabled,
            exportXLSXDisabled: !exportXLSXEnabled,
            onExportCSV: () => {
                setIsMenuOpen(false);
                onExportCSV();
            },
            onExportXLSX: () => {
                setIsMenuOpen(false);
                onExportXLSX();
            },
            tooltipMessage: intl.formatMessage({ id: bubbleMessageKey }),
        });
    }, [
        insightMenuItemsProvider,
        execution,
        exportCSVEnabled,
        exportXLSXEnabled,
        onExportCSV,
        onExportXLSX,
        intl,
    ]);

    const menuItems = useMemo<IInsightMenuItem[]>(() => {
        return insightMenuItemsProvider
            ? insightMenuItemsProvider(insight, widget, defaultMenuItems, closeMenu)
            : defaultMenuItems;
    }, [insight, widget, defaultMenuItems]);

    return { menuItems, isMenuOpen, openMenu, closeMenu };
};
