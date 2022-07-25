import type { LoaderArgs } from "@remix-run/node";
import type { AnyRouter } from "@trpc/server";

const createTRPCLoader =
	<TRouter extends AnyRouter>(
		router: TRouter
	): ((args: LoaderArgs) => ReturnType<TRouter["createCaller"]>) =>
	({ request: req }) => {
		return router.createCaller({ req }) as ReturnType<TRouter["createCaller"]>;
	};

export { createTRPCLoader };
