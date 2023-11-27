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
  publicKeyJwk,
}: {
  did?: string;
  id?: string;
  privateKeyHex?: string;
  publicKeyHex?: any;
  edVerificationKey?: any;
  type: string;
  publicKeyJwk?: any;
}) => {
  switch (type) {
    case "Ed25519VerificationKey2018":
    case "JsonWebKey2020":
      /**
       * Universal resolver can return `Ed25519VerificationKey2018` type with only
       * a `publicKeyJwk` which the DigitalBazaar 2018 key constructor doesn't handle.
       */
      const privateKeyBase58 = privateKeyHex
        ? bs58.encode(Buffer.from(privateKeyHex, "hex"))
        : undefined;
      const publicKeyBase58 = bs58.encode(Buffer.from(publicKeyHex, "hex"));
      return await Ed25519VerificationKey2020.fromEd25519VerificationKey2018({
        keyPair: {
          id,
          controller: did,
          type: publicKeyJwk ? "JsonWebKey2020" : type,
          privateKeyBase58,
          publicKeyBase58,
        },
      });

    case "Ed25519VerificationKey2020":
      if (edVerificationKey) {
        return await Ed25519VerificationKey2020.from(edVerificationKey);
      } else {
        return await Ed25519VerificationKey2020.from({
          id,
          controller: did,
          type,
          privateKeyMultibase: privateKeyHex
            ? base58btc.encode(Buffer.from(privateKeyHex, "hex"))
            : undefined,
          publicKeyMultibase: base58btc.encode(
            Buffer.from(publicKeyHex, "hex")
          ),
        });
      }

    default:
      return;
  }
};

export default deriveEdVerificationKey;
