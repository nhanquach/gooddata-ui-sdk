// (C) 2021 GoodData Corporation

import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures";
import { ChangeInsightWidgetVisProperties, changeInsightWidgetVisProperties } from "../../../commands";
import { DashboardCommandFailed, DashboardInsightWidgetVisPropertiesChanged } from "../../../events";
import { selectAnalyticalWidgetByRef } from "../../../store/layout/layoutSelectors";
import { idRef, uriRef } from "@gooddata/sdk-model";
import { IInsightWidget } from "@gooddata/sdk-backend-spi";
import {
    ComplexDashboardIdentifier,
    ComplexDashboardWidgets,
} from "../../../tests/fixtures/ComplexDashboard.fixtures";

describe("change insight widget vis properties handler", () => {
    describe("for dashboard with KPIs and insights", () => {
        let Tester: DashboardTester;
        beforeEach(
            preloadedTesterFactory((tester) => {
                Tester = tester;
            }, ComplexDashboardIdentifier),
        );

        const TestProperties = { controls: { legend: false } };

        it("should set new properties", async () => {
            const ref = ComplexDashboardWidgets.SecondSection.FirstTable.ref;

            const event: DashboardInsightWidgetVisPropertiesChanged = await Tester.dispatchAndWaitFor(
                changeInsightWidgetVisProperties(ref, TestProperties),
                "GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED",
            );

            expect(event.payload.properties).toEqual(TestProperties);
            const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state()) as IInsightWidget;
            expect(widgetState!.properties).toEqual(TestProperties);
        });

        it("should set new properties for insight widget referenced by id", async () => {
            const identifier = ComplexDashboardWidgets.SecondSection.FirstTable.identifier;
            const ref = idRef(identifier);
            const event: DashboardInsightWidgetVisPropertiesChanged = await Tester.dispatchAndWaitFor(
                changeInsightWidgetVisProperties(ref, TestProperties),
                "GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED",
            );

            expect(event.payload.properties).toEqual(TestProperties);
            const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state()) as IInsightWidget;
            expect(widgetState!.properties).toEqual(TestProperties);
        });

        it("should set new properties for insight widget referenced by uri", async () => {
            const uri = ComplexDashboardWidgets.SecondSection.FirstTable.uri;
            const ref = uriRef(uri);
            const event: DashboardInsightWidgetVisPropertiesChanged = await Tester.dispatchAndWaitFor(
                changeInsightWidgetVisProperties(ref, TestProperties),
                "GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED",
            );

            expect(event.payload.properties).toEqual(TestProperties);
            const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state()) as IInsightWidget;
            expect(widgetState!.properties).toEqual(TestProperties);
        });

        it("should clear properties if undefined", async () => {
            const ref = ComplexDashboardWidgets.SecondSection.FirstTable.ref;

            const event: DashboardInsightWidgetVisPropertiesChanged = await Tester.dispatchAndWaitFor(
                changeInsightWidgetVisProperties(ref, undefined),
                "GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED",
            );

            expect(event.payload.properties).toBeUndefined();
            const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state()) as IInsightWidget;
            expect(widgetState!.properties).toBeUndefined();
        });

        it("should set empty properties", async () => {
            const ref = ComplexDashboardWidgets.SecondSection.FirstTable.ref;

            const event: DashboardInsightWidgetVisPropertiesChanged = await Tester.dispatchAndWaitFor(
                changeInsightWidgetVisProperties(ref, {}),
                "GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED",
            );

            expect(event.payload.properties).toEqual({});
            const widgetState = selectAnalyticalWidgetByRef(ref)(Tester.state()) as IInsightWidget;
            expect(widgetState!.properties).toEqual({});
        });

        it("should fail if trying to change properties of KPI widget", async () => {
            const ref = ComplexDashboardWidgets.FirstSection.FirstKpi.ref;
            const event: DashboardCommandFailed<ChangeInsightWidgetVisProperties> =
                await Tester.dispatchAndWaitFor(
                    changeInsightWidgetVisProperties(ref, TestProperties, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if trying to vis properties of non-existent widget", async () => {
            const event: DashboardCommandFailed<ChangeInsightWidgetVisProperties> =
                await Tester.dispatchAndWaitFor(
                    changeInsightWidgetVisProperties(uriRef("missing"), TestProperties, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should emit correct events", async () => {
            const ref = ComplexDashboardWidgets.SecondSection.FirstTable.ref;

            await Tester.dispatchAndWaitFor(
                changeInsightWidgetVisProperties(ref, TestProperties, TestCorrelation),
                "GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });
});
