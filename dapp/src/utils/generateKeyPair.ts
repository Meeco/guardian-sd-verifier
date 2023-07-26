import { Ed25519KeyPair } from "@transmute/did-key-ed25519";
import {
  Ed25519Signature2018,
  Ed25519VerificationKey2018,
} from "@transmute/ed25519-signature-2018";
import { Buffer } from "buffer";
// To fix "Buffer is not defined" error from Ed25519Signature2018
global.Buffer = Buffer;

export const generateKeyPair = async ({
  privateKeyHex,
}: {
  privateKeyHex: string;
}) => {
  try {
    const key = await Ed25519KeyPair.generate({
      secureRandom: () => {
        return Buffer.from(privateKeyHex, "hex");
      },
    });

    const keyData = await key.export({
      type: "Ed25519VerificationKey2018",
      privateKey: true,
    });

    const suite = new Ed25519Signature2018({
      key: await Ed25519VerificationKey2018.from(
        await key.export({
          type: "Ed25519VerificationKey2018",
          privateKey: true,
        })
      ),
    });

    return { keyData, suite };
  } catch (error) {
    console.log("generateKeyPair failed: ", error);
  }
};
