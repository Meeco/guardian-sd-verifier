import { Ed25519VerificationKey2020 } from "@digitalbazaar/ed25519-verification-key-2020";
import { X25519KeyAgreementKey2020 } from "@digitalbazaar/x25519-key-agreement-key-2020";
import bs58 from "bs58";
import { base58btc } from "multiformats/bases/base58";

const deriveKeyAgreementKey = async ({
  did,
  didKeyId,
  privateKeyStr,
  publicKeyStr,
  verificationKey,
  type,
}: {
  did?: string;
  didKeyId?: string;
  privateKeyStr?: string;
  publicKeyStr?: any;
  verificationKey?: any;
  type?: string;
}) => {
  let verificationKey2020;
  if (type === "Ed25519VerificationKey2018") {
    verificationKey2020 =
      await Ed25519VerificationKey2020.fromEd25519VerificationKey2018({
        keyPair: {
          id: `${did}#${didKeyId}`,
          controller: did,
          type: "Ed25519VerificationKey2018",
          privateKeyBase58: privateKeyStr
            ? bs58.encode(Buffer.from(privateKeyStr, "hex"))
            : undefined,
          publicKeyBase58: bs58.encode(Buffer.from(publicKeyStr, "hex")),
        },
      });
  } else {
    if (verificationKey) {
      verificationKey2020 = await Ed25519VerificationKey2020.from(
        verificationKey
      );
    } else {
      verificationKey2020 = await Ed25519VerificationKey2020.from({
        id: `${did}#${didKeyId}`,
        controller: did,
        type: "Ed25519VerificationKey2020",
        privateKeyMultibase: privateKeyStr
          ? base58btc.encode(Buffer.from(privateKeyStr, "hex"))
          : undefined,
        publicKeyMultibase: base58btc.encode(Buffer.from(publicKeyStr, "hex")),
      });
    }
  }

  const keyAgreementKey =
    X25519KeyAgreementKey2020.fromEd25519VerificationKey2020({
      keyPair: verificationKey2020,
    });

  return keyAgreementKey;
};

export default deriveKeyAgreementKey;
