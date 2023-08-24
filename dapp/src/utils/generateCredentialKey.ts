import { Ed25519Signature2020 } from "@digitalbazaar/ed25519-signature-2020";
import { Ed25519VerificationKey2020 } from "@digitalbazaar/ed25519-verification-key-2020";
import { Ed25519KeyPair } from "@transmute/did-key-ed25519";
import { CredentialKey } from "../components/AppProvider";

export const generateCredentialKey = async ({
  privateKeyHex,
}: {
  privateKeyHex: string;
}) => {
  const keyPair = await Ed25519KeyPair.generate({
    secureRandom: () => {
      return Buffer.from(privateKeyHex, "hex");
    },
  });

  const keyPair2018 = await keyPair.export({
    type: "Ed25519VerificationKey2018",
    privateKey: true,
  });

  const verificationKey = await Ed25519VerificationKey2020.from({
    ...keyPair2018,
    keyPair: keyPair2018,
  });

  const suite = new Ed25519Signature2020({
    key: verificationKey,
  });

  const credentialKey: CredentialKey = { keyPair, verificationKey, suite };

  return credentialKey;
};
