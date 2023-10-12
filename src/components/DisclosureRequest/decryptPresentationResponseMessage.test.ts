import { Ed25519VerificationKey2020 } from "@digitalbazaar/ed25519-verification-key-2020";
import { Cipher } from "@digitalbazaar/minimal-cipher";
import { X25519KeyAgreementKey2020 } from "@digitalbazaar/x25519-key-agreement-key-2020";
import { jest } from "@jest/globals";
import decryptPresentationResponseMessage from "./decryptPresentationResponseMessage";

import { Buffer } from "buffer";
import { MessageType } from "../../types";

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

    global.fetch = jest.fn(() =>
      Promise.resolve({ json: () => encrypted, status: 200, ok: true })
    ) as unknown as jest.Mock;

    const decrypted = await decryptPresentationResponseMessage({
      // Cast to any to fix esm/cjs issue
      cipher,
      presentationResponseMessage: {
        operation: MessageType.PRESENTATION_RESPONSE,
        request_id: "123",
        recipient_did: "123",
        response_file_cid: "123",
      },
      credentialVerificationKey: sharedEdKey,
    });

    expect(JSON.stringify(decrypted)).toBe(JSON.stringify(data));
  });
});
