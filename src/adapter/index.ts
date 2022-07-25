import { LoaderArgs } from "@remix-run/node";
import { type AnyRouter, TRPCError, inferRouterContext, Router } from "@trpc/server";
import { FetchHandlerRequestOptions, fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { AnyRouterDef } from "@trpc/server/dist/core/router";

export type RemixCreateContextFnOptions = LoaderArgs;

const json = (data: unknown, status = 200) =>
	new Response(JSON.stringify(data), {
		headers: {
			"Content-Type": "application/json",
		},
		status,
	});

export type RemixCreateContextFn<TRouter extends AnyRouter> = (
	opts: RemixCreateContextFnOptions
) => inferRouterContext<TRouter> | Promise<inferRouterContext<TRouter>>;

export type RemixCreateContextOption<TRouter extends AnyRouter> =
	unknown extends inferRouterContext<TRouter>
		? {
				/**
				 * @link https://trpc.io/docs/context
				 **/
				createContext?: RemixCreateContextFn<TRouter>;
		  }
		: {
				/**
				 * @link https://trpc.io/docs/context
				 **/
				createContext: RemixCreateContextFn<TRouter>;
		  };

export function remixHTTPRequestHandler<TRouter extends Router<AnyRouterDef>>({
	createContext,
	...opts
}: Omit<FetchHandlerRequestOptions<TRouter>, "req" | "endpoint" | "createContext"> &
	RemixCreateContextOption<TRouter>) {
	const handler = async (args: LoaderArgs) => {
		function getPath(): string | null {
			if (typeof args.params.trpc === "string") {
				return args.params.trpc;
			}
			return null;
		}
		const path = getPath();

		if (path === null) {
			const error = opts.router.getErrorShape({
				error: new TRPCError({
					message: 'Query "trpc" not found - is the file named `$trpc.ts`?',
					code: "INTERNAL_SERVER_ERROR",
				}),
				type: "unknown",
				ctx: undefined,
				path: undefined,
				input: undefined,
			});

			return json({ error }, 500);
		}

		const endpoint = new URL(args.request.url).pathname.replace(path, "");

		console.log(endpoint);

		return fetchRequestHandler({
			...opts,
			createContext() {
				return createContext?.(args);
			},
			endpoint,
			req: args.request,
		});
	};

	return { loader: handler, action: handler };
}
