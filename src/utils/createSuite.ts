import { Ed25519Signature2020 } from "@digitalbazaar/ed25519-signature-2020";
import { Ed25519VerificationKey2020 } from "@digitalbazaar/ed25519-verification-key-2020";

const createSuite = async ({
  type,
  verificationKey,
}: {
  type: string;
  verificationKey: any;
}) => {
  try {
    switch (type) {
      case "Ed25519VerificationKey2018":
        const ed25519VerificationKey2020 =
          await Ed25519VerificationKey2020.from({
            ...verificationKey,
            keyPair: verificationKey,
          });

        return new Ed25519Signature2020({
          key: ed25519VerificationKey2020,
        });
      case "Ed25519VerificationKey2020":
      case "JsonWebKey2020":
        return new Ed25519Signature2020({
          key: verificationKey,
        });
      default:
        console.error(`Unsupported key type ${type}`);
        return;
    }
  } catch (error) {
    console.log({ error });
  }
};

export default createSuite;
