import { FileCreateTransaction, Hbar } from "@hashgraph/sdk";
import { jest } from "@jest/globals";
import { HashConnect } from "hashconnect/dist/cjs/main";
import { appMetadata } from "../hashConnectService";
import { createMockInitData } from "../mock/mockInitData";
import createFile from "./createFile";

describe("createFile", () => {
  const hashConnect = new HashConnect();
  const accountId = "0.0.1234";
  const topicId = "0.0.1730327";
  const mockTransactionId = "0.0.123";
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
      transactionId: mockTransactionId,
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

    const transactionId = await createFile(signer as any, provider, contents);

    expect(setContents).toHaveBeenCalledWith("Hello, World");
    expect(setMaxTransactionFee).toHaveBeenCalledWith(new Hbar(2));

    expect(mockCreateFile).toHaveBeenCalledWith(signer);
    expect(transactionId).toEqual(mockTransactionId);
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

    const transactionId = await createFile(signer as any, provider, contents);

    expect(transactionId).toBe(undefined);
    expect(logSpy).toHaveBeenCalledWith(
      "Create file transaction failed:",
      new Error("Failed to create file transaction")
    );
  });
});
