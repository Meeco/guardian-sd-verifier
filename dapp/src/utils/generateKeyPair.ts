import { Ed25519VerificationKey2018 } from "@digitalbazaar/ed25519-verification-key-2018";
import bs58 from "bs58";
import { Buffer } from "buffer";
// To fix "Buffer is not defined" error from Ed25519Signature2018
global.Buffer = Buffer;

export const generateKeyPair = async ({
  credentialSubject,
  publicKeyHex,
  privateKeyHex,
}: {
  credentialSubject: any;
  publicKeyHex: string;
  privateKeyHex: string;
}) => {
  try {
    const publicKeyBase58 = bs58.encode(Buffer.from(publicKeyHex, "hex"));
    const privateKeyBase58 = bs58.encode(Buffer.from(privateKeyHex, "hex"));

    const { id, controller } = credentialSubject;

    const key = await Ed25519VerificationKey2018.from({
      id,
      type: "Ed25519VerificationKey2018",
      controller,
      publicKeyBase58,
      privateKeyBase58,
    });

    return key;
  } catch (error) {
    console.log("generateKeyPair failed: ", error);
  }
};
