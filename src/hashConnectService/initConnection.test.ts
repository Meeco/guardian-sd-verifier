import { jest } from "@jest/globals";
import { HashConnect, HashConnectTypes } from "hashconnect/dist/cjs/main";
import { initConnection } from "./initConnection";

enum NetworkType {
  testnet = "testnet",
  mainnet = "mainnet",
}

describe("initConnection", () => {
  const hashConnect = new HashConnect();

  const accountId = "0.0.1234";
  const topicId = "0.0.1730327";

  const mockInitData = (
    metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata,
    network: "testnet" | "mainnet" | "previewnet",
    singleAccount?: boolean
  ) =>
    new Promise<any>((resolve) => {
      resolve({
        topic: topicId,
        pairingString: "abc123",
        encryptionKey: "key123",
        savedPairings: [{ metadata, network, accountIds: [accountId] } as any],
      });
    });

  it("should init the conection", async () => {
    jest.spyOn(HashConnect.prototype, "init").mockImplementation(mockInitData);

    const mockSetAccountId = jest.fn();
    const mockSetHashconnect = jest.fn();
    const mockSetHashconnectData = jest.fn();
    const mockSetProvider = jest.fn();
    const mockSetSigner = jest.fn();

    await initConnection({
      hcInstance: hashConnect as any,
      network: NetworkType.testnet,
      setAccountId: mockSetAccountId,
      setHashconnect: mockSetHashconnect,
      setHashConnectData: mockSetHashconnectData,
      setProvider: mockSetProvider,
      setSigner: mockSetSigner,
    });

    expect(mockSetAccountId).toBeCalledWith(accountId);
    expect(mockSetHashconnect).toBeCalledWith(hashConnect);
    expect(mockSetHashconnectData).toBeCalled();
    expect(mockSetProvider).toBeCalled();
    expect(mockSetSigner).toBeCalled();
  });
});
