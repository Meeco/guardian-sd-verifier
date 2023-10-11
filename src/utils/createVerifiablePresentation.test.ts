import mockCredential from "../mock/example_credential.json";
import {
  mockDid,
  mockId,
  mockPrivateKeyHex,
  mockPublicKeyHex,
} from "../mock/mockCredentials";
import createSuite from "./createSuite";
import createVerifiablePresentation from "./createVerifiablePresentation";
import deriveEdVerificationKey from "./deriveEdVerificationKey";
import { documentLoader } from "./documentLoader";

describe("createVerifiablePresentation", () => {
  it("should create Verifiable Presentation from Verifiable Credential", async () => {
    const verificationKey = await deriveEdVerificationKey({
      id: mockId,
      did: mockDid,
      privateKeyHex: mockPrivateKeyHex,
      publicKeyHex: mockPublicKeyHex,
      type: "Ed25519VerificationKey2018",
    });

    const suite = await createSuite({
      type: "Ed25519VerificationKey2018",
      verificationKey,
    });

    const vp = await createVerifiablePresentation({
      verifiableCredential: mockCredential,
      challenge: "challenge",
      documentLoader: documentLoader,
      verificationKey,
      suite,
    });

    expect(vp.type).toContain("VerifiablePresentation");
  }, 20000);
});
