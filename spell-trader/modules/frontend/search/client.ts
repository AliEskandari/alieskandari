// Typesense.Client() has methods for all API operations.
// If you only intend to search through documents (for eg: in the browser),
//    you can also use Typesense.SearchClient().
// This can also help reduce your bundle size by only including the classes you need:

import { SearchClient as TypesenseSearchClient } from "typesense";
let client = new TypesenseSearchClient({
  nodes: [
    {
      host: process.env.NEXT_PUBLIC_TYPESENSE_HOST ?? "", // For Typesense Cloud use xxx.a1.typesense.net
      port: 443, // For Typesense Cloud use 443
      protocol: "https", // For Typesense Cloud use https
    },
  ],
  apiKey: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY ?? "",
  connectionTimeoutSeconds: 2,
});

export default client;
