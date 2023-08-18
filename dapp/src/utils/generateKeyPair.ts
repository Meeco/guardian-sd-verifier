import { Ed25519Signature2020 } from "@digitalbazaar/ed25519-signature-2020";
import { Ed25519VerificationKey2020 } from "@digitalbazaar/ed25519-verification-key-2020";
import { Ed25519KeyPair } from "@transmute/did-key-ed25519";

export const generateKeyPair = async ({
  privateKeyHex,
}: {
  privateKeyHex: string;
}) => {
  const key = await Ed25519KeyPair.generate({
    secureRandom: () => {
      return Buffer.from(privateKeyHex, "hex");
    },
  });

  const keyPair2018 = await key.export({
    type: "Ed25519VerificationKey2018",
    privateKey: true,
  });

  const keyData = await Ed25519VerificationKey2020.from({
    ...keyPair2018,
    keyPair: keyPair2018,
  });

  // const suite = new JsonWebSignature({
  //   key: await JsonWebKey.from(
  //     await key.export({
  //       type: "JsonWebKey2020",
  //       privateKey: true,
  //     })
  //   ),
  // });

  const suite = new Ed25519Signature2020({
    key: keyData,
  });

  return { keyData, suite };
};
