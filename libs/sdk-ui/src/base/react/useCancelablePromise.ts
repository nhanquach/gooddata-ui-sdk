// (C) 2019-2021 GoodData Corporation
import { DependencyList, useEffect, useState } from "react";
import { makeCancelable } from "./CancelablePromise";
import noop from "lodash/noop";
import { UnexpectedSdkError } from "../errors/GoodDataSdkError";
import { safeSerialize } from "./safeSerialize";

/**
 * Indicates the current state of the promise inside {@link useCancelablePromise} hook
 * @beta
 */
export type UseCancelablePromiseStatus = "success" | "error" | "loading" | "pending";

/**
 * Indicates pending state for {@link useCancelablePromise} hook
 * @beta
 */
export type UseCancelablePromisePendingState = {
    result: undefined;
    error: undefined;
    status: "pending";
};

/**
 * Indicates loading state for {@link useCancelablePromise} hook
 * @beta
 */
export type UseCancelablePromiseLoadingState = {
    result: undefined;
    error: undefined;
    status: "loading";
};

/**
 * Indicates error state for {@link useCancelablePromise} hook
 * @beta
 */
export type UseCancelablePromiseErrorState<TError> = {
    result: undefined;
    error: TError;
    status: "error";
};

/**
 * Indicates success state for {@link useCancelablePromise} hook
 * @beta
 */
export type UseCancelablePromiseSuccessState<TResult> = {
    result: TResult;
    error: undefined;
    status: "success";
};

/**
 * Indicates the current state of {@link useCancelablePromise} hook
 * @beta
 */
export type UseCancelablePromiseState<TResult, TError> =
    | UseCancelablePromisePendingState
    | UseCancelablePromiseLoadingState
    | UseCancelablePromiseErrorState<TError>
    | UseCancelablePromiseSuccessState<TResult>;

/**
 * Callbacks for {@link useCancelablePromise} hook
 * @beta
 */
export type UseCancelablePromiseCallbacks<TResult, TError> = {
    /**
     * onLoading is fired whenever the promise loading starts
     */
    onLoading?: () => void;
    /**
     * onPending is fired whenever the promise is not provided
     */
    onPending?: () => void;
    /**
     * onCancel is fired whenever the dependency list changes before the promise resolution
     */
    onCancel?: () => void;
    /**
     * onPending is fired whenever the promise is fulfilled
     */
    onSuccess?: (result: TResult) => void;
    /**
     * onError is fired whenever the promise is rejected
     */
    onError?: (err: TError) => void;
};

/**
 * This hook provides easy way to work with Promise.
 * You can:
 * - watch it's status (pending/loading/success/error)
 * - get it's result/error when the Promise is resolved/rejected,
 * - attach convenient callbacks to it
 * - be sure, that when the dependency list changes, result will be still relevant (if previous Promise is still running, it's "canceled").
 *
 * @beta
 */
export function useCancelablePromise<TResult, TError = any>(
    {
        promise,
        onLoading = noop,
        onPending = noop,
        onCancel = noop,
        onSuccess = noop,
        onError = noop,
    }: {
        promise: (() => Promise<TResult>) | undefined | null;
    } & UseCancelablePromiseCallbacks<TResult, TError>,
    deps?: DependencyList,
): UseCancelablePromiseState<TResult, TError> {
    const getInitialState = (): UseCancelablePromiseState<TResult, TError> => ({
        result: undefined,
        error: undefined,
        status: promise ? "loading" : "pending",
    });
    const [state, setState] = useState(getInitialState());

    useEffect(() => {
        if (!promise) {
            setState({
                status: "pending",
                result: undefined,
                error: undefined,
            });
            onPending();
            return;
        } else {
            setState({
                status: "loading",
                result: undefined,
                error: undefined,
            });
            onLoading();
        }

        const cancelablePromise = makeCancelable(promise());

        cancelablePromise.promise
            .then((result) => {
                // Because promises have their own lifecycle independent on react lifecycle,
                // we need to check if cancelable promise was not canceled before it's resolution
                // and our results are still relevant.
                if (!cancelablePromise.getHasCanceled()) {
                    setState({
                        status: "success",
                        result,
                        error: undefined,
                    });
                    onSuccess(result);
                }
            })
            .catch((error) => {
                // Because promises have their own lifecycle independent on react lifecycle,
                // we need to check if cancelable promise was not canceled before it's resolution
                // and our results are still relevant.
                if (!cancelablePromise.getHasCanceled()) {
                    setState({
                        status: "error",
                        result: undefined,
                        error,
                    });
                    onError(error);
                }
            });

        return () => {
            // If promise was not fulfilled before dependencies change, cancel it.
            // Important notice - request itself is not canceled - we just don't care about unrelevant results anymore.
            if (!cancelablePromise.getHasFulfilled()) {
                cancelablePromise.cancel();
                onCancel();
            }
        };
    }, deps);

    // We want to avoid the return of the old state when some dependency has changed,
    // before another useEffect hook round starts.
    const [prevDeps, setDeps] = useState(deps);
    if (prevDeps?.length !== deps?.length) {
        throw new UnexpectedSdkError(
            `The final argument passed to useCancelablePromise changed size between renders. The order and size of this array must remain constant.

Previous: ${safeSerialize(prevDeps)}
Incoming: ${safeSerialize(deps)}`,
        );
    }

    if (deps?.some((dep, i) => dep !== prevDeps?.[i])) {
        setDeps(deps);
        const currentState = getInitialState();
        setState(currentState);
        return currentState;
    }

    return state;
}
