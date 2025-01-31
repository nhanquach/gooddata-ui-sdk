// (C) 2020-2021 GoodData Corporation
import { useCallback, useState } from "react";
import isEqual from "lodash/isEqual";
import {
    useDashboardSelector,
    selectImplicitDrillsByAvailableDrillTargets,
    selectDrillableItemsByAvailableDrillTargets,
} from "../../../../../model";
import { IInsightWidget } from "@gooddata/sdk-backend-spi";
import { OnWidgetDrill } from "../../../../drill/types";
import {
    DataViewFacade,
    IAvailableDrillTargets,
    IDrillEvent,
    IPushData,
    isSomeHeaderPredicateMatched,
} from "@gooddata/sdk-ui";
import { IDashboardDrillEvent } from "../../../../../types";
import { IInsight } from "@gooddata/sdk-model";
/**
 * @internal
 */
export interface UseDashboardInsightDrillsProps {
    widget: IInsightWidget;
    insight: IInsight;
    onDrill?: OnWidgetDrill;
}

/**
 * @internal
 */
export const useDrillDialogInsightDrills = ({
    widget,
    insight,
    onDrill: onDrillFn,
}: UseDashboardInsightDrillsProps) => {
    // Drilling
    const [drillTargets, setDrillTargets] = useState<IAvailableDrillTargets>();
    const onPushData = useCallback(
        (data: IPushData): void => {
            if (data?.availableDrillTargets && !isEqual(drillTargets, data.availableDrillTargets)) {
                setDrillTargets(data.availableDrillTargets);
            }
        },
        [drillTargets],
    );

    const implicitDrillDefinitions = useDashboardSelector(
        selectImplicitDrillsByAvailableDrillTargets(drillTargets),
    );
    const drillableItems = useDashboardSelector(selectDrillableItemsByAvailableDrillTargets(drillTargets));
    const onDrill = onDrillFn
        ? (event: IDrillEvent) => {
              const facade = DataViewFacade.for(event.dataView);

              const matchingImplicitDrillDefinitions = implicitDrillDefinitions.filter((info) => {
                  return event.drillContext.intersection?.some((intersection) =>
                      isSomeHeaderPredicateMatched(info.predicates, intersection.header, facade),
                  );
              });

              const drillEvent: IDashboardDrillEvent = {
                  ...event,
                  widgetRef: widget.ref,
                  drillDefinitions: matchingImplicitDrillDefinitions.map((info) => info.drillDefinition),
              };
              return (
                  typeof onDrillFn === "function" &&
                  onDrillFn(drillEvent, {
                      insight,
                      widget,
                  })
              );
          }
        : undefined;

    return {
        drillableItems,
        onPushData,
        onDrill,
    };
};
