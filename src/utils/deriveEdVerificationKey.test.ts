import { Ed25519VerificationKey2018 } from "@digitalbazaar/ed25519-verification-key-2018";
import { Ed25519VerificationKey2020 } from "@digitalbazaar/ed25519-verification-key-2020";
import bs58 from "bs58";
import { base58btc } from "multiformats/bases/base58";
import deriveEdVerificationKey from "./deriveEdVerificationKey";

describe("deriveEdVerificationKey", () => {
  it("should derive Ed25519VerificationKey2020 from Ed25519VerificationKey2018", async () => {
    const keyPair = await Ed25519VerificationKey2018.generate();
    const edKeyPair = await keyPair.export({
      publicKey: true,
      privateKey: true,
    });

    const verificationKey = await deriveEdVerificationKey({
      id: edKeyPair.id,
      did: edKeyPair.publicKeyBase58,
      privateKeyHex: Buffer.from(
        bs58.decode(edKeyPair.privateKeyBase58)
      ).toString("hex"),
      publicKeyHex: Buffer.from(
        bs58.decode(edKeyPair.publicKeyBase58)
      ).toString("hex"),
      type: edKeyPair.type,
    });

    expect(verificationKey.type).toBe("Ed25519VerificationKey2020");
  });

  it("should derive Ed25519VerificationKey2020 from Ed25519VerificationKey2020", async () => {
    const keyPair = await Ed25519VerificationKey2020.generate();
    const edKeyPair = await keyPair.export({
      publicKey: true,
      privateKey: true,
    });

    const verificationKey = await deriveEdVerificationKey({
      id: edKeyPair.id,
      did: edKeyPair.publicKeyBase58,
      privateKeyHex: Buffer.from(
        base58btc.decode(edKeyPair.privateKeyMultibase)
      ).toString("hex"),
      publicKeyHex: Buffer.from(
        base58btc.decode(edKeyPair.publicKeyMultibase)
      ).toString("hex"),
      type: edKeyPair.type,
    });

    expect(verificationKey.type).toBe("Ed25519VerificationKey2020");
  });

  it("should derive Ed25519VerificationKey2020 from serialized key pair", async () => {
    const keyPair = await Ed25519VerificationKey2020.generate();
    const edKeyPair = await keyPair.export({
      publicKey: true,
      privateKey: true,
    });

    const edVerificationKey = await deriveEdVerificationKey({
      id: edKeyPair.id,
      did: edKeyPair.publicKeyBase58,
      privateKeyHex: Buffer.from(
        base58btc.decode(edKeyPair.privateKeyMultibase)
      ).toString("hex"),
      publicKeyHex: Buffer.from(
        base58btc.decode(edKeyPair.publicKeyMultibase)
      ).toString("hex"),
      type: edKeyPair.type,
    });

    const verificationKey = await deriveEdVerificationKey({
      edVerificationKey,
      type: "Ed25519VerificationKey2020",
    });

    expect(JSON.stringify(verificationKey)).toBe(
      JSON.stringify(edVerificationKey)
    );
  });
});
