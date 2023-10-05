import { HashConnect, HashConnectTypes } from "hashconnect";
import { NetworkType } from "../components/AppProvider";
import { initConnection } from "./initConnection";

describe("initConnection", () => {
  const hashConnect = new HashConnect();
  const mockInitData = (
    metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata,
    network: "testnet" | "mainnet" | "previewnet",
    singleAccount?: boolean
  ) =>
    new Promise<any>((resolve) => {
      resolve({
        topic: "0.0.1234",
        pairingString: "abc123",
        encryptionKey: "key123",
        savedPairings: [{ metadata, network } as any],
      });
    });

  const mockSetAccountId = jest.fn();
  const mockSetHashconnect = jest.fn();
  const mockSetHashconnectData = jest.fn();
  const mockSetProvider = jest.fn();
  const mockSetSigner = jest.fn();

  it("should init the conection", async () => {
    jest.spyOn(HashConnect.prototype, "init").mockImplementation(mockInitData);

    const hashConnectData = await initConnection({
      hcInstance: hashConnect,
      network: NetworkType.testnet,
      setAccountId: mockSetAccountId,
      setHashconnect: mockSetHashconnect,
      setHashConnectData: mockSetHashconnectData,
      setProvider: mockSetProvider,
      setSigner: mockSetSigner,
    });

    console.log({ hashConnectData });
  });
});
