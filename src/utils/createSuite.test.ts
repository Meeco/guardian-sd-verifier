import { Ed25519VerificationKey2018 } from "@digitalbazaar/ed25519-verification-key-2018";
import { Ed25519VerificationKey2020 } from "@digitalbazaar/ed25519-verification-key-2020";
import { X25519KeyAgreementKey2020 } from "@digitalbazaar/x25519-key-agreement-key-2020";
import { jest } from "@jest/globals";
import createSuite from "./createSuite";

describe("createSuite", () => {
  it("should create Ed25519Signature2020 suite from Ed25519VerificationKey2018 successfully", async () => {
    const verificationKey = await Ed25519VerificationKey2018.generate();
    const suite = await createSuite({
      type: "Ed25519VerificationKey2018",
      verificationKey,
    });

    expect(suite).not.toBe(undefined);
    expect(suite.type).toBe("Ed25519Signature2020");
  });

  it("should create Ed25519Signature2020 suite from Ed25519VerificationKey2020 successfully", async () => {
    const verificationKey = await Ed25519VerificationKey2020.generate();
    const suite = await createSuite({
      type: "Ed25519VerificationKey2020",
      verificationKey,
    });

    expect(suite).not.toBe(undefined);
    expect(suite.type).toBe("Ed25519Signature2020");
  });

  it("should return undefined if verificationKey is not valid", async () => {
    const verificationKey = jest.mock;
    const suite = await createSuite({
      type: "Ed25519VerificationKey2020",
      verificationKey,
    });

    expect(suite).toBe(undefined);
  });

  it("should return undefined if key type is not Ed25519VerificationKey2018 or Ed25519VerificationKey2020", async () => {
    const keyPair = await X25519KeyAgreementKey2020.generate({
      controller: "did:example:1234",
    });
    const suite = await createSuite({
      type: "X25519KeyAgreementKey2020",
      verificationKey: keyPair,
    });

    expect(suite).toBe(undefined);
  });
});
