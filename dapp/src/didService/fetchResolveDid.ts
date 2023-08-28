import { fetchJson } from "../utils";

const UNIVERSAL_RESOLVER_HOST =
  process.env.UNIVERSAL_RESOLVER_HOST ??
  `https://dev.uniresolver.io/1.0/identifiers`;
const HEDERA_RESOLVER_HOST =
  process.env.HEDERA_RESOLVER_HOST ?? `http://localhost:5000/1.0/identifiers`;

/**
 * Placeholder did resolver.
 * Since universal resolvers don't yet typically support Hedera DIDs, assumes a
 * universal did resolver running at localhost:5000 that will resolve Hedera DIDs
 */
const fetchResolveDid = (did: string) =>
  fetchJson(
    `${
      did.startsWith("did:hedera")
        ? HEDERA_RESOLVER_HOST
        : UNIVERSAL_RESOLVER_HOST
    }/${did}`
  );

export default fetchResolveDid;
