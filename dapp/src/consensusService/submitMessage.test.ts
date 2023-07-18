import { TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import submitMessage from "./submitMessage";

describe("submitMessage", () => {
  const client = {} as any;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("submit a message successfully", async () => {
    const executeMock = jest
      .spyOn(TopicMessageSubmitTransaction.prototype, "execute")
      .mockResolvedValueOnce({
        getReceipt: jest.fn().mockResolvedValueOnce({ status: 0 }),
      } as any);

    const message = "Hello, world!";
    const topicId = "0.0.123";

    const logSpy = jest.spyOn(console, "log");

    await submitMessage(message, client, topicId);
    expect(executeMock).toHaveBeenCalledWith(client);

    expect(logSpy).toHaveBeenNthCalledWith(
      1,
      "The message transaction status: 0"
    );
    expect(logSpy).toHaveBeenNthCalledWith(2, "Complete");
  });

  it("handles message submit failures", async () => {
    jest
      .spyOn(TopicMessageSubmitTransaction.prototype, "execute")
      .mockRejectedValueOnce(new Error("Failed to submit message"));

    const logSpy = jest.spyOn(console, "log");

    const message = "Hello, world!";
    const topicId = "0.0.123";

    await submitMessage(message, client, topicId);

    expect(logSpy).toHaveBeenCalledWith(
      "Submit message failed",
      new Error("Failed to submit message")
    );
  });
});
