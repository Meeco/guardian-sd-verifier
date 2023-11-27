import { Ed25519VerificationKey2020 } from "@digitalbazaar/ed25519-verification-key-2020";
import { Cipher } from "@digitalbazaar/minimal-cipher";
import { X25519KeyAgreementKey2020 } from "@digitalbazaar/x25519-key-agreement-key-2020";
import { jest } from "@jest/globals";
import decryptPresentationResponseMessage from "./decryptPresentationResponseMessage";

import { Buffer } from "buffer";
import { Responder } from "../AppProvider";

global.Buffer = Buffer;

describe("decryptPresentationResponseMessage", () => {
  it("should decrypt encrypted response successfully", async () => {
    const sharedEdKey = await Ed25519VerificationKey2020.from({
      type: "Ed25519VerificationKey2020",
      id: "did:hedera:testnet:z6MkmELdkLPDgwzwXSm166M2ut4i2M9GHALUiYvZBz15YzWG_0.0.1136547#did-root-key",
      controller:
        "did:hedera:testnet:z6MkmELdkLPDgwzwXSm166M2ut4i2M9GHALUiYvZBz15YzWG_0.0.1136547",
      publicKeyMultibase: "z6MkmELdkLPDgwzwXSm166M2ut4i2M9GHALUiYvZBz15YzWG",
      privateKeyMultibase:
        "zrv1ZCXBBXsFAVF6gHkor79DhZ3fx3Nbo8GcgskR8DKHR1UyfKYe5gJubQQpNtRTA18HMsoPW1RW2LVKy8AB6SKFM9n",
    });

    const keyAgreementKeyShared =
      X25519KeyAgreementKey2020.fromEd25519VerificationKey2020({
        keyPair: sharedEdKey,
      });

    const cipher = new Cipher();

    const data = { test: "abc" };

    const recipient = {
      header: {
        kid: keyAgreementKeyShared.id,
        alg: "ECDH-ES+A256KW",
      },
    };

    const keyResolver = async () => keyAgreementKeyShared;

    const recipients = [recipient];

    const encrypted = await cipher.encryptObject({
      obj: data,
      recipients,
      keyResolver,
    });

    const mockSetResponders = jest.fn();
    const mockAddLoader = jest.fn();
    const mockRemoveLoader = jest.fn();

    global.fetch = jest.fn(() =>
      Promise.resolve({ json: () => encrypted, status: 200, ok: true })
    ) as unknown as jest.Mock;

    const responders: Responder[] = [
      { did: "did:key:123", accountId: "123", encryptedKeyId: "123" },
    ];

    const decrypted = await decryptPresentationResponseMessage({
      cipher,
      credentialVerificationKey: sharedEdKey,
      fileCid: "cid567",
      responders,
      setResponders: mockSetResponders,
      loaderId: "decryptPresentationResponseMessage",
      addLoader: mockAddLoader,
      removeLoader: mockRemoveLoader,
      responderDid: "did:key:123",
    });

    expect(JSON.stringify(decrypted)).toBe(JSON.stringify(data));
  });
});
