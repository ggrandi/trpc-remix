import { createReactQueryHooks, createReactQueryHooksProxy } from "@trpc/react";
import type { AnyRouter } from "@trpc/server";
import { type WithTRPCNoSSROptions, withTRPC } from "./withTRPC";

export type Hooks<TRouter extends AnyRouter> = ReturnType<typeof createReactQueryHooks<TRouter>>;

export function createTRPCRemix<TRouter extends AnyRouter>(
	opts: WithTRPCNoSSROptions<TRouter>
): {
	proxy: ReturnType<typeof createReactQueryHooksProxy<TRouter>>;
	useContext: Hooks<TRouter>["useContext"];
	useInfiniteQuery: Hooks<TRouter>["useInfiniteQuery"];
	useMutation: Hooks<TRouter>["useMutation"];
	useQuery: Hooks<TRouter>["useQuery"];
	useSubscription: Hooks<TRouter>["useSubscription"];
	withTRPC: ReturnType<typeof withTRPC<TRouter>>;
	queries: Hooks<TRouter>["queries"];
} {
	const hooks = createReactQueryHooks<TRouter>();
	const proxy = createReactQueryHooksProxy<TRouter>(hooks);

	const _withTRPC = withTRPC<TRouter>(opts);

	return {
		proxy,
		useContext: hooks.useContext,
		useInfiniteQuery: hooks.useInfiniteQuery,
		useMutation: hooks.useMutation,
		useQuery: hooks.useQuery,
		useSubscription: hooks.useSubscription,
		withTRPC: _withTRPC,
		queries: hooks.queries,
	};
}
