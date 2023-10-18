import { Cipher } from "@digitalbazaar/minimal-cipher";
import { FileCreateTransaction } from "@hashgraph/sdk";
import { jest } from "@jest/globals";
import { HashConnect } from "hashconnect/dist/cjs/hashconnect";
import { appMetadata } from "../../hashConnectService";
import mockDidDocument from "../../mock/did_document.json";
import mockEncryptedMessage from "../../mock/encrypted_message.json";
import { createMockInitData } from "../../mock/mockInitData";
import mockPresentationRequest from "../../mock/presentation_request.json";
import createEncryptedFile from "./createEncryptedFile";

describe("createEncryptedFile", () => {
  const hashConnect = new HashConnect();
  const accountId = "0.0.1234";
  const topicId = "0.0.1730327";
  const mockTransactionId = "0.0.123";
  const mockFileId = "0.0.123";

  const cipher = new Cipher();
  const addLoader = jest.fn() as any;
  const removeLoader = jest.fn() as any;
  const loaderId = "createEncryptedFile";
  const encryptedKeyId =
    "did:key:z6MkhcPeozxbmYopWVJYGEr7JFpyNPDynBKSpSRwqBZEgr5u#z6MkhcPeozxbmYopWVJYGEr7JFpyNPDynBKSpSRwqBZEgr5u";
  const responderDid =
    "did:key:z6MkhcPeozxbmYopWVJYGEr7JFpyNPDynBKSpSRwqBZEgr5u";

  // importing "NetworkType" from "AppProvider.tsx" cause ESM error, have to case to any to avoid the error
  const network = "testnet" as any;

  const mockInitData = createMockInitData("testnet", topicId, accountId);

  jest
    .spyOn(HashConnect.prototype, "init")
    .mockImplementation(() => mockInitData);

  it("should return fileId when create encrypted file successfully", async () => {
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

    const signer = hashConnect.getSigner(provider) as any;

    global.fetch = jest
      .fn()
      .mockImplementationOnce(async () => {
        return { json: () => mockDidDocument, status: 200, ok: true } as any;
      })
      .mockImplementationOnce(async () => {
        return {
          json: () => ({
            transactions: [{ entity_id: mockFileId }],
          }),
          status: 200,
          ok: true,
        } as any;
      }) as unknown as jest.Mock;

    const mockCreateFile = (jest.fn() as any).mockResolvedValue({
      transactionId: mockTransactionId,
    });

    jest
      .spyOn(FileCreateTransaction.prototype, "executeWithSigner")
      .mockImplementation(mockCreateFile);

    jest
      .spyOn(Cipher.prototype, "encryptObject")
      .mockImplementation(() => mockEncryptedMessage);

    const fileId = await createEncryptedFile({
      responderDid,
      encryptedKeyId,
      presentationRequest: mockPresentationRequest,
      cipher,
      loaderId,
      addLoader,
      removeLoader,
      signer,
      provider,
      network,
    });

    expect(fileId).toEqual(mockFileId);
  });
});
