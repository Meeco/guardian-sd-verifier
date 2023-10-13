import * as ed25519 from "@transmute/did-key-ed25519";
import fetchJson from "./fetchJson";

const resolveDid = async (didUrl: string) => {
  const { didDocument } = await ed25519.resolve(didUrl, {
    accept: "application/did+json",
  });

  return didDocument;
};

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
const resolveDidDocument = (did: string) => {
  if (did.startsWith("did:key")) {
    return resolveDid(did);
  } else
    return fetchJson({
      url: `${
        did.startsWith("did:hedera")
          ? HEDERA_RESOLVER_HOST
          : UNIVERSAL_RESOLVER_HOST
      }/${did}`,
    });
};

export default resolveDidDocument;
