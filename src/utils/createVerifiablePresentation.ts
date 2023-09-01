import * as vc from "@digitalbazaar/vc";
import { Ed25519Signature2020 } from "@transmute/ed25519-signature-2020";
import { v4 } from "uuid";

/**
 * Create a verifiable presentation of the given credential.
 *
 * - `verifiableCredential` - the imported verifiable credential with proof
 * - `challenge` - the challenge string
 * - `documentLoader` that will need to be able to load DIDs and context URLs
 * - `verificationKey` - Ed25519VerificationKey2020 key
 * - `suite` - suite for sign the presentation
 */
const createVerifiablePresentation = async ({
  verifiableCredential,
  challenge,
  documentLoader,
  verificationKey,
  suite,
}: {
  verifiableCredential: any;
  challenge: string;
  documentLoader: any;
  verificationKey: any;
  suite: Ed25519Signature2020;
}) => {
  const presentation = vc.createPresentation({
    verifiableCredential,
    id: `urn:uuid:${v4()}`,
    holder: verificationKey.controller,
  });

  const vp = await vc.signPresentation({
    presentation,
    suite,
    challenge,
    documentLoader,
  });

  return vp;
};

export default createVerifiablePresentation;
