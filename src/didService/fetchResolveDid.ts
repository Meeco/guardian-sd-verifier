import { fetchJson } from "../utils";
import { promiseWithTimeout } from "../utils/promiseWithTimeout";

const DID_RESOLVER_URL =
  process.env.REACT_APP_DID_UNIVERSAL_RESOLVER_URL ?? `https://dev.uniresolver.io/1.0/identifiers`;

/**
 * Placeholder did resolver.
 * Since universal resolvers don't yet typically support Hedera DIDs, assumes a
 * universal did resolver running at localhost:5000 that will resolve Hedera DIDs and other DIDs
 */
const fetchResolveDid = async (did: string) =>
  await promiseWithTimeout({
    promise: fetchJson({ url: `${DID_RESOLVER_URL}/${did}` }),
    time: 3000,
  });

export default fetchResolveDid;
