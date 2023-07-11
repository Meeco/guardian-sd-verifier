import { Ed25519VerificationKey2018 } from "@digitalbazaar/ed25519-verification-key-2018";
import { Ed25519Signature2018 } from "@digitalbazaar/ed25519-signature-2018";

export const generateKeyPair = async (id: string) => {
  const keyPair = await Ed25519VerificationKey2018.generate({
    controller: id,
  });
  return keyPair;
};

export const getSuite = (keyPair: any) => {
  return new Ed25519Signature2018({
    key: keyPair,
  });
};
