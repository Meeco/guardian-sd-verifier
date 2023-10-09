import { TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import { jest } from "@jest/globals";
import { HashConnect } from "hashconnect/dist/cjs/main";
import { appMetadata } from "../../hashConnectService";
import { createMockInitData } from "../../mock/mockInitData";
import sendPresentationRequest from "./sendPresentationRequest";

describe("sendPresentationRequest", () => {
  const hashConnect = new HashConnect();

  const topicId = "0.0.123";
  const accountId = "0.0.456";

  const mockInitData = createMockInitData("testnet", topicId, accountId);

  jest
    .spyOn(HashConnect.prototype, "init")
    .mockImplementation(() => mockInitData);

  it("should send presentation successfully", async () => {
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

    const mockSubmitMessage = (jest.fn() as any).mockResolvedValue(true);

    jest
      .spyOn(TopicMessageSubmitTransaction.prototype, "executeWithSigner")
      .mockImplementation(mockSubmitMessage);

    const { isSuccess } = await sendPresentationRequest({
      fileId: "123",
      responderDid: "123",
      signer,
      topicId: "123",
    });

    expect(isSuccess).toBe(true);
  });

  it("should return isSuccess: false when send presentation failed", async () => {
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
      .spyOn(TopicMessageSubmitTransaction.prototype, "executeWithSigner")
      .mockRejectedValue("Error");

    const { isSuccess } = await sendPresentationRequest({
      fileId: "123",
      responderDid: "123",
      signer,
      topicId: "123",
    });

    expect(isSuccess).toBe(false);
  });
});
