import * as ed25519 from "@transmute/did-key-ed25519";
import fetchJson from "./fetchJson";

const resolveDid = async (didUrl: string) => {
  const { didDocument } = await ed25519.resolve(didUrl, {
    accept: "application/did+json",
  });

  return didDocument;
};

const UNIVERSAL_RESOLVER_URL =
  process.env.REACT_APP_DID_UNIVERSAL_RESOLVER_URL ?? `https://dev.uniresolver.io/1.0/identifiers`;


/**
 * Construct DID Document local if did:key, else use Universal DID resolver.
 */
const resolveDidDocument = (did: string) => {
  if (did.startsWith("did:key")) {
    return resolveDid(did);
  } else
    return fetchJson({
      url: `${UNIVERSAL_RESOLVER_URL}/${did}`,
    });
};

export default resolveDidDocument;
