// (C) 2021 GoodData Corporation
import { createWorkspaceTargetConfig, WorkspaceTargetConfig } from "../_base/workspaceTargetConfig";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ActionOptions } from "../_base/types";
import { createBackend } from "../_base/backend";
import ora from "ora";
import { asyncValidOrDie, createWorkspaceValidator } from "../_base/inputHandling/validators";

export type InspectCmdActionConfig = WorkspaceTargetConfig & {
    identifier: string;
    backendInstance: IAnalyticalBackend;
};

async function doAsyncValidations(config: InspectCmdActionConfig) {
    const { backendInstance, workspace } = config;

    const asyncValidationProgress = ora({
        text: "Authenticating and checking workspace.",
    });
    try {
        asyncValidationProgress.start();

        await backendInstance.authenticate(true);
        await asyncValidOrDie("workspace", workspace, createWorkspaceValidator(backendInstance));
    } finally {
        asyncValidationProgress.stop();
    }
}

export async function getInspectCmdActionConfig(
    identifier: string,
    options: ActionOptions,
): Promise<InspectCmdActionConfig> {
    const workspaceTargetConfig = createWorkspaceTargetConfig(options);
    const { hostname, backend, credentials } = workspaceTargetConfig;

    const backendInstance = createBackend({
        hostname,
        backend,
        credentials,
    });

    const config: InspectCmdActionConfig = {
        ...workspaceTargetConfig,
        identifier,
        backendInstance,
    };

    await doAsyncValidations(config);

    return config;
}
