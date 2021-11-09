// (C) 2021 GoodData Corporation
import * as fs from "fs";
import path from "path";
import snakeCase from "lodash/snakeCase";
import { InputValidationError, TargetBackendType } from "./types";
import { logInfo } from "./terminal/loggers";

export function toJsonString(obj: any): string {
    // note: using json-stable-stringify is likely not a good idea in this project:
    // the toolkit works with package.json files; stable stringify will reshuffle contents of package.json
    return JSON.stringify(obj, null, 4);
}

export function writeAsJsonSync(file: string, obj: object): void {
    fs.writeFileSync(file, toJsonString(obj), { encoding: "utf-8" });
}

export function readJsonSync(file: string): any {
    return JSON.parse(fs.readFileSync(file, { encoding: "utf-8" }));
}

/**
 * Safely joins two path parts together.
 *
 * Path on windows will contain backslashes which can cause problems with Globby. This function makes sure
 * only forward slashes are used so that Globby and node fs works properly on all platforms.
 *
 * @param initialPath - the first part
 * @param relativePath - the second part
 * @returns joined path
 */
export function safeJoin(initialPath: string, relativePath: string): string {
    return path.posix.join(initialPath, relativePath).replace(/\\/g, "/");
}

/**
 * Converts plug name to an identifier that can be used for module federation identifier, directory names,
 * asset file names etc.
 *
 * @param name - plugin name as entered by the user
 */
export function convertToPluginIdentifier(name: string): string {
    return `dp_${snakeCase(name)}`;
}

/**
 * Given package JSON contents, this function tries to discover the backend type that action should
 * target. The idea is.. if the person develops plugin against particular backend then its likely
 * that they will also want to deploy it there.
 *
 * @param packageJson - package json object
 */
export function discoverBackendType(packageJson: Record<string, any>): TargetBackendType {
    const { peerDependencies = {} } = packageJson;

    if (peerDependencies["@gooddata/sdk-backend-bear"] !== undefined) {
        logInfo("Plugin project depends on @gooddata/sdk-backend-bear. Assuming backend type 'bear'.");

        return "bear";
    } else if (peerDependencies["@gooddata/sdk-backend-tiger"] !== undefined) {
        logInfo("Plugin project depends on @gooddata/sdk-backend-tiger. Assuming backend type 'tiger'.");

        return "tiger";
    }

    throw new InputValidationError(
        "backend",
        "?",
        "Unable to discover target backend type. Please specify --backend option on the command line.",
    );
}

export function extractRootCause(error: any): any {
    if (error.cause === undefined) {
        return error;
    }

    return extractRootCause(error.cause);
}
