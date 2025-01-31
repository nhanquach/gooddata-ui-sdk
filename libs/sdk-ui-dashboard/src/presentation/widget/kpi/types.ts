// (C) 2020-2021 GoodData Corporation
import React, { ComponentType } from "react";
import { FilterContextItem, IAnalyticalBackend, IKpiWidget, IWidgetAlert } from "@gooddata/sdk-backend-spi";
import { IErrorProps, ILoadingProps, OnError } from "@gooddata/sdk-ui";
import { IDashboardFilter, OnFiredDashboardViewDrillEvent } from "../../../types";

///
/// Component props
///

/**
 * KPI Widget props
 *
 * IMPORTANT: this interface is marked as public but not all properties in it are suitable for public consumption
 * yet. Please heed the per-property API maturity annotations; the alpha level APIs may change in a breaking way
 * in the next release.

 * @public
 */
export interface IDashboardKpiProps {
    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the component MUST be rendered within an existing BackendContext.
     *
     * @alpha
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where the KPI exists.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the component MUST be rendered within an existing WorkspaceContext.
     *
     * @alpha
     */
    workspace?: string;

    /**
     * The KPI to execute and display.
     *
     * @public
     */
    kpiWidget: IKpiWidget;

    /**
     * Optionally, specify alert set by the current user to this KPI.
     *
     * @public
     */
    alert?: IWidgetAlert;

    /**
     * Optionally, specify filters to be applied to the KPI.
     *
     * @deprecated Do not use, made part of the public API by accident. Will do nothing.
     * @public
     */
    filters?: FilterContextItem[];

    /**
     * Component to render if embedding fails.
     *
     * @alpha
     */
    ErrorComponent?: React.ComponentType<IErrorProps>;

    /**
     * Component to render while the KPI is loading.
     *
     * @alpha
     */
    LoadingComponent?: React.ComponentType<ILoadingProps>;

    /**
     * Optionally, specify a callback that will be triggered when the filters should be changed.
     * (e.g. to apply filters of a KPI alert to the whole dashboard)
     *
     * @alpha
     */
    onFiltersChange?: (filters: (IDashboardFilter | FilterContextItem)[], resetOthers?: boolean) => void;

    /**
     * Called when user triggers a drill on a visualization.
     *
     * @alpha
     */
    onDrill?: OnFiredDashboardViewDrillEvent;

    /**
     * Called in case of any error, either in the dashboard loading or any of the widgets execution.
     *
     * @alpha
     */
    onError?: OnError;
}

///
/// Custom component types
///

/**
 * @public
 */
export type CustomDashboardKpiComponent = ComponentType<IDashboardKpiProps>;
