import { Ed25519VerificationKey2020 } from "@digitalbazaar/ed25519-verification-key-2020";
import bs58 from "bs58";
import { base58btc } from "multiformats/bases/base58";

const deriveEdVerificationKey = async ({
  did,
  id,
  privateKeyHex,
  publicKeyHex,
  edVerificationKey,
  type,
}: {
  did?: string;
  id?: string;
  privateKeyHex?: string;
  publicKeyHex?: any;
  edVerificationKey?: any;
  type: string;
}) => {
  let edKey;
  if (type === "Ed25519VerificationKey2018") {
    const privateKeyBase58 = privateKeyHex
      ? bs58.encode(Buffer.from(privateKeyHex, "hex"))
      : undefined;
    const publicKeyBase58 = bs58.encode(Buffer.from(publicKeyHex, "hex"));
    edKey = await Ed25519VerificationKey2020.fromEd25519VerificationKey2018({
      keyPair: {
        id,
        controller: did,
        type: "Ed25519VerificationKey2018",
        privateKeyBase58,
        publicKeyBase58,
      },
    });
  } else {
    if (edVerificationKey) {
      edKey = await Ed25519VerificationKey2020.from(edVerificationKey);
    } else {
      edKey = await Ed25519VerificationKey2020.from({
        id,
        controller: did,
        type: "Ed25519VerificationKey2020",
        privateKeyMultibase: privateKeyHex
          ? base58btc.encode(Buffer.from(privateKeyHex, "hex"))
          : undefined,
        publicKeyMultibase: base58btc.encode(Buffer.from(publicKeyHex, "hex")),
      });
    }
  }

  return edKey;
};

export default deriveEdVerificationKey;
