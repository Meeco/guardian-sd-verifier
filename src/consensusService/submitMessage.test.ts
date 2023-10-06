import { TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import { jest } from "@jest/globals";
import { HashConnect } from "hashconnect/dist/cjs/main";
import { appMetadata } from "../hashConnectService";
import { createMockInitData } from "../mock/mockInitData";
import submitMessage from "./submitMessage";

describe("submitMessage", () => {
  const hashConnect = new HashConnect();

  const message = "Hello, world";
  const topicId = "0.0.123";
  const accountId = "0.0.456";

  const mockInitData = createMockInitData("testnet", topicId, accountId);

  jest
    .spyOn(HashConnect.prototype, "init")
    .mockImplementation(() => mockInitData);

  it("should submit message successfully", async () => {
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

    const res = await submitMessage({
      message,
      topicId,
      hcSigner: signer as any,
    });
    expect(res).toBe(true);
  });
});
