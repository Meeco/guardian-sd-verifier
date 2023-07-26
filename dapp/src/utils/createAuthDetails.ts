import * as vc from "@digitalbazaar/vc";
import {
  Ed25519Signature2018,
  Ed25519VerificationKey2018,
} from "@transmute/ed25519-signature-2018";
import { v4 } from "uuid";

/**
 * Create a verifiable presentation of the given credential.
 *
 * - `verifiableCredential` - the imported verifiable credential with proof
 * - `challenge` - the challenge string
 * - `documentLoader` that will need to be able to load DIDs and context URLs
 * - `key` - e.g.
 *  ```
 *    await Ed25519VerificationKey2018.from({
 *      id: 'did:key:abcd#1234',
 *      controller: 'did:key:abcd,
 *      type: 'Ed25519VerificationKey2018',
 *      publicKeyBase58: 'z6m...',
 *      privateKeyBase58: '7vt...',
 *    })
 *  ```
 */
export const createAuthDetails = async ({
  verifiableCredential,
  challenge,
  documentLoader,
  keyData,
  suite,
}: {
  verifiableCredential: any;
  challenge: string;
  documentLoader: any;
  keyData: Ed25519VerificationKey2018;
  suite: Ed25519Signature2018;
}) => {
  const presentation = vc.createPresentation({
    verifiableCredential,
    id: `urn:uuid:${v4()}`,
    holder: keyData.controller,
  });

  console.log({ presentation });

  const vp = await vc.signPresentation({
    presentation,
    suite,
    challenge,
    documentLoader,
  });

  console.log({ vp });

  const authDetails = {
    verifiablePresentation: {
      ...vp,
    },
  };

  // Optionally assert that the credential verifies
  // const resultVp = await vc.verify({
  //   presentation: vp,
  //   challenge,
  //   suite,
  //   documentLoader,
  // });

  // console.log({ resultVp });

  return authDetails;
};
