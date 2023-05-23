import algoliasearch from "algoliasearch";

import { env } from "@acme/env-config";

export const client = algoliasearch(
  env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? "",
  env.ALGOLIA_SECRET_KEY ?? "",
);

export const algoliaIndex = client.initIndex(
  env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? "",
);
