# `trpc-remix`

> Connect a [tRPC](https://trpc.io) router to remix.

## Installation

```bash
# npm
npm install trpc-remix @trpc/react react-query

# Yarn
yarn add trpc-remix @trpc/react react-query

# pnpm
pnpm add trpc-remix @trpc/react react-query
```

## Basic Example

Setup the API route in `app/routes/api/$trpc.ts`

```ts
import { remixHTTPRequestHandler } from 'trpc-remix/adapter';
import { createContext } from '~/server/context';
import { appRouter } from '~/server/routers/_app';

export const { loader, action } = remixHTTPRequestHandler({
  createContext,
  router: appRouter,
});
```

Setup tRPC in `app/utils/trpc.ts`.

```ts
import { createTRPCRemix } from 'trpc-remix';
import type { AppRouter } from '<server file location>';

export const trpc = createTRPCRemix<AppRouter>({
  config() {
    return {
      // ...
    };
  },
});
```

Hook up tRPC inside `app/root.tsx`.

```ts
import { trpc } from '~/utils/trpc';

// ...

const App = () => {
  return (
    // ...
  );
};

export default trpc.withTRPC(App);
```

Add createTRPCLoader to your AppRouter file.

```ts
import { createTRPCLoader } from 'trpc-remix';
import { t } from '../trpc';

export const appRouter = t.router({
  // ...
});

export type AppRouter = typeof appRouter;

export const trpcLoader = createTRPCLoader(appRouter);
```

Now you can query your API in any component.

```tsx
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { trpcLoader } from '~/server/routers/_app';
import { trpc } from '~/utils/trpc';

const loader = async (args: LoaderArgs) => {
  const trpc = trpcLoader(args);

  return json({
    greeting: await trpc.greeting(),
  });
};

export function Hello() {
  const { data, error, status } = trpc.proxy.greeting.useQuery({
    name: 'tRPC',
  });

  const loaderData = useLoaderData<typeof loader>();

  if (error) {
    return <p>{error.message}</p>;
  }

  if (status !== 'success') {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div>{data && <p>{data.greeting}</p>}</div>
      <pre>LoaderData: {loaderData}</pre>
    </>
  );
}
```
