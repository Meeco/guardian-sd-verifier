import { FileCreateTransaction, Hbar } from "@hashgraph/sdk";
import { jest } from "@jest/globals";
import { HashConnect } from "hashconnect/dist/cjs/main";
import { HashConnectProvider } from "hashconnect/dist/cjs/provider/provider";
import { appMetadata } from "../hashConnectService";
import { createMockInitData } from "../mock/mockInitData";
import createFile from "./createFile";

describe("createFile", () => {
  const hashConnect = new HashConnect();
  const accountId = "0.0.1234";
  const topicId = "0.0.1730327";
  const transactionId = "0.0.123";
  const mockFileId = "0.0.123";
  const contents = "Hello, World";

  const mockInitData = createMockInitData("testnet", topicId, accountId);

  jest
    .spyOn(HashConnect.prototype, "init")
    .mockImplementation(() => mockInitData);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should send create file transaction successfully", async () => {
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

    const mockCreateFile = (jest.fn() as any).mockResolvedValue({
      getReceipt: (jest.fn() as any).mockResolvedValue({
        transactionId: transactionId,
      }),
    });

    const mockGetTransactionReceipt = (jest.fn() as any).mockResolvedValue({
      fileId: mockFileId,
    });

    const setContents = jest.spyOn(
      FileCreateTransaction.prototype,
      "setContents"
    );

    const setMaxTransactionFee = jest.spyOn(
      FileCreateTransaction.prototype,
      "setMaxTransactionFee"
    );

    jest
      .spyOn(FileCreateTransaction.prototype, "executeWithSigner")
      .mockImplementation(mockCreateFile);

    jest
      .spyOn(HashConnectProvider.prototype, "getTransactionReceipt")
      .mockImplementation(mockGetTransactionReceipt);

    const fileId = await createFile(signer as any, provider, contents);

    expect(setContents).toHaveBeenCalledWith("Hello, World");
    expect(setMaxTransactionFee).toHaveBeenCalledWith(new Hbar(2));

    expect(mockCreateFile).toHaveBeenCalledWith(signer);
    expect(fileId).toEqual(mockFileId);
  });

  it("should handle creating file transaction failures", async () => {
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

    jest
      .spyOn(FileCreateTransaction.prototype, "executeWithSigner")
      .mockRejectedValueOnce(new Error("Failed to create file transaction"));

    const logSpy = jest.spyOn(console, "log");

    const fileId = await createFile(signer as any, provider, contents);

    expect(fileId).toBe(undefined);
    expect(logSpy).toHaveBeenCalledWith(
      "Create file transaction failed:",
      new Error("Failed to create file transaction")
    );
  });
});
