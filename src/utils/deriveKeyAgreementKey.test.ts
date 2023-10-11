import { Ed25519VerificationKey2018 } from "@digitalbazaar/ed25519-verification-key-2018";
import { Ed25519VerificationKey2020 } from "@digitalbazaar/ed25519-verification-key-2020";
import { X25519KeyAgreementKey2020 } from "@digitalbazaar/x25519-key-agreement-key-2020";
import deriveKeyAgreementKey from "./deriveKeyAgreementKey";

describe("deriveKeyAgreementKey", () => {
  it("should derive KeyAgreementKey from Ed25519VerificationKey2018", async () => {
    const verificationKey = await Ed25519VerificationKey2018.generate();
    const keyAgreementKey = await deriveKeyAgreementKey(verificationKey);
    expect(keyAgreementKey.type).toBe("X25519KeyAgreementKey2020");
  });

  it("should derive KeyAgreementKey from Ed25519VerificationKey2018 with publicKeyJwk", async () => {
    const verificationKey = {
      id: "did:key:z6Mkr5wVSomgoJBCUT1ugrR6r5ZdJsfj4f2Vc2MSsqyWRHd9#z6Mkr5wVSomgoJBCUT1ugrR6r5ZdJsfj4f2Vc2MSsqyWRHd9",
      type: "Ed25519VerificationKey2018",
      controller: "did:key:z6Mkr5wVSomgoJBCUT1ugrR6r5ZdJsfj4f2Vc2MSsqyWRHd9",
      publicKeyJwk: {
        kty: "OKP",
        crv: "Ed25519",
        x: "rNYRGP-Q8BeuyzxXxm87E4KPR_JseAW3Elmi3ZU_2gA",
      },
    };
    const keyAgreementKey = await deriveKeyAgreementKey(verificationKey);
    console.log({ keyAgreementKey });
    expect(keyAgreementKey.type).toBe("X25519KeyAgreementKey2020");
  });

  it("should derive KeyAgreementKey from Ed25519VerificationKey2020", async () => {
    const verificationKey = await Ed25519VerificationKey2020.generate();
    const keyAgreementKey = await deriveKeyAgreementKey(verificationKey);
    expect(keyAgreementKey.type).toBe("X25519KeyAgreementKey2020");
  });

  it("should throw an error if verificationKey's type is not from Ed25519VerificationKey2018 or Ed25519VerificationKey2020", async () => {
    try {
      const verificationKey = await Ed25519VerificationKey2020.generate();
      const keyAgreementKey =
        X25519KeyAgreementKey2020.fromEd25519VerificationKey2020({
          keyPair: verificationKey,
        });
      await deriveKeyAgreementKey(keyAgreementKey);
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect((error as any).message).toBe(
        'Unsupported key type "X25519KeyAgreementKey2020"'
      );
    }
  });
});
