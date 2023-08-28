import { Ed25519VerificationKey2020 } from "@digitalbazaar/ed25519-verification-key-2020";
import { X25519KeyAgreementKey2020 } from "@digitalbazaar/x25519-key-agreement-key-2020";

const deriveKeyAgreementKey = async ({
  did,
  didKeyId,
  privateKeyStr,
  publicKeyStr,
  edVerificationKey,
  type,
}: {
  did?: string;
  didKeyId?: string;
  privateKeyStr?: string;
  publicKeyStr?: any;
  edVerificationKey?: any;
  type: string;
}) => {
  let edKey;
  if (type === "Ed25519VerificationKey2018") {
    edKey = await Ed25519VerificationKey2020.fromEd25519VerificationKey2018({
      keyPair: {
        id: `${did}#${didKeyId}`,
        controller: did,
        type: "Ed25519VerificationKey2018",
        privateKeyBase58: privateKeyStr,
        publicKeyBase58: publicKeyStr,
      },
    });
  } else {
    edKey = await Ed25519VerificationKey2020.from(edVerificationKey);
  }

  const keyAgreementKey =
    X25519KeyAgreementKey2020.fromEd25519VerificationKey2020({
      keyPair: edKey,
    });

  return keyAgreementKey;
};

export default deriveKeyAgreementKey;
