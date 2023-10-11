import { Ed25519VerificationKey2020 } from "@digitalbazaar/ed25519-verification-key-2020";
import { X25519KeyAgreementKey2020 } from "@digitalbazaar/x25519-key-agreement-key-2020";

const deriveKeyAgreementKey = async (verificationKey: any) => {
  /**
   * Universal resolver can return `Ed25519VerificationKey2018` type with only
   * a `publicKeyJwk` which the DigitalBazaar 2018 key constructor doesn't handle.
   */
  if (
    verificationKey?.type === "Ed25519VerificationKey2018" &&
    verificationKey.publicKeyJwk
  ) {
    verificationKey.type = "JsonWebKey2020";
  }

  const { type } = verificationKey;

  let verificationKey2020;
  if (type === "Ed25519VerificationKey2018") {
    verificationKey2020 =
      await Ed25519VerificationKey2020.fromEd25519VerificationKey2018({
        keyPair: verificationKey,
      });
  } else if (
    type === "Ed25519VerificationKey2020" ||
    type === "JsonWebKey2020"
  ) {
    verificationKey2020 =
      await Ed25519VerificationKey2020.from(verificationKey);
  } else {
    throw new Error(`Unsupported key type "${type}"`);
  }

  const keyAgreementKey =
    X25519KeyAgreementKey2020.fromEd25519VerificationKey2020({
      keyPair: verificationKey2020,
    });

  return keyAgreementKey;
};

export default deriveKeyAgreementKey;
