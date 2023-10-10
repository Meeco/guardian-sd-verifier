import mockCredential from "../mock/example_credential.json";
import createSuite from "./createSuite";
import createVerifiablePresentation from "./createVerifiablePresentation";
import deriveEdVerificationKey from "./deriveEdVerificationKey";
import { documentLoader } from "./documentLoader";

describe("createVerifiablePresentation", () => {
  it("should create Verifiable Presentation from Verifiable Credential", async () => {
    const verificationKey = await deriveEdVerificationKey({
      id: "did:key:z6MkuGB9nMVsZwJFR3WJwGBPsnjogYM5E4bvx4HFzsooFpRP#z6MkuGB9nMVsZwJFR3WJwGBPsnjogYM5E4bvx4HFzsooFpRP",
      did: "did:key:z6MknDUyDPK834QCtCVesmmacwFGhv8ukqbhoGao5kzzReDG",
      privateKeyHex:
        "2110c05e8650e2c2a0564a472c8429b7b0ff102cf47267da0a96e4c5b825e3817355fa57dcff65fe79b8acee9d6edf7b05b80dc7ce0f34a0afa60985a2eda0ab",
      publicKeyHex:
        "7355fa57dcff65fe79b8acee9d6edf7b05b80dc7ce0f34a0afa60985a2eda0ab",
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
