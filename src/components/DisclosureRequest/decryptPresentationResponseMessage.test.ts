import { Ed25519VerificationKey2020 } from "@digitalbazaar/ed25519-verification-key-2020";
import { Cipher } from "@digitalbazaar/minimal-cipher";
import { X25519KeyAgreementKey2020 } from "@digitalbazaar/x25519-key-agreement-key-2020";
import { jest } from "@jest/globals";
import { HashConnect } from "hashconnect/dist/cjs/hashconnect";
import { appMetadata, createMockInitData } from "../../mock/mockInitData";
import decryptPresentationResponseMessage from "./decryptPresentationResponseMessage";

import { FileContentsQuery } from "@hashgraph/sdk";
import { Buffer } from "buffer";
import { MessageType } from "../../types";

global.Buffer = Buffer;

describe("decryptPresentationResponseMessage", () => {
  const hashConnect = new HashConnect();

  const topicId = "0.0.123";
  const accountId = "0.0.456";

  const mockInitData = createMockInitData("testnet", topicId, accountId);

  jest
    .spyOn(HashConnect.prototype, "init")
    .mockImplementation(() => mockInitData);

  it("should first", async () => {
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

    const encryptedBytes = new TextEncoder().encode(JSON.stringify(encrypted));

    jest
      .spyOn(FileContentsQuery.prototype, "executeWithSigner")
      .mockImplementation(
        () => new Promise((resolve) => resolve(encryptedBytes))
      );

    const hashConnectData = await hashConnect.init(
      appMetadata,
      "testnet",
      false
    );

    const provider = hashConnect.getProvider(
      "testnet",
      hashConnectData.topic,
      accountId
    );

    const signer = hashConnect.getSigner(provider);

    const decrypted = await decryptPresentationResponseMessage({
      hcSigner: signer,
      cipher,
      presentationResponseMessage: {
        operation: MessageType.PRESENTATION_RESPONSE,
        request_id: "123",
        recipient_did: "123",
        response_file_id: "123",
      },
      credentialVerificationKey: sharedEdKey,
    });

    expect(JSON.stringify(decrypted)).toBe(JSON.stringify(data));
  });
});
