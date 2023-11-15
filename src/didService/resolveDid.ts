import * as ed25519 from "@transmute/did-key-ed25519";

export const resolveDid = async (didUrl: string) => {
  const { didDocument } = await ed25519.resolve(didUrl, {
    accept: "application/did+json",
  });

  return didDocument;
};

export default resolveDid;
