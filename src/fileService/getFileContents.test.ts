import { FileContentsQuery } from "@hashgraph/sdk";
import { jest } from "@jest/globals";
import { HashConnect } from "hashconnect/dist/cjs/main";
import { appMetadata } from "../hashConnectService";
import { createMockInitData } from "../mock/mockInitData";
import getFileContents from "./getFileContents";

describe("getFileContents", () => {
  const hashConnect = new HashConnect();
  const accountId = "0.0.1234";
  const topicId = "0.0.1730327";
  const fileId = "0.0.123";

  const mockInitData = createMockInitData("testnet", topicId, accountId);

  jest
    .spyOn(HashConnect.prototype, "init")
    .mockImplementation(() => mockInitData);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should get file contents successfully", async () => {
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
    const contents = Buffer.from('{"x":5,"y":6}');
    const mockQuery = (jest.fn() as any).mockResolvedValue(contents);

    const setFileId = jest.spyOn(FileContentsQuery.prototype, "setFileId");
    jest
      .spyOn(FileContentsQuery.prototype, "executeWithSigner")
      .mockImplementation(mockQuery);

    const result = await getFileContents({
      hcSigner: signer as any,
      fileId,
    });

    expect(setFileId).toHaveBeenCalledWith(fileId);

    expect(mockQuery).toHaveBeenCalledWith(signer);
    expect(result).toEqual(contents);
  });
});
