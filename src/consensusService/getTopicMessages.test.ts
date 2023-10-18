import { jest } from "@jest/globals";
import getTopicMessages from "./getTopicMessages";

describe("getTopicMessages", () => {
  const topicId = "0.0.123";
  const encodedStr =
    "ewogICJvcGVyYXRpb24iOiAicXVlcnktcmVzcG9uc2UiLAogICJyZXNwb25kZXJfZGlkIjogIjAuMC4xMjMiLAogICJvZmZlcl9oYmFyIjogMQp9Cg==";
  const timeStamp = 123456789;
  // importing "NetworkType" from "AppProvider.tsx" cause ESM error, have to case to any to avoid the error
  const network = "testnet" as any;
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should get topic messages successfully", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            messages: [{ message: encodedStr }],
          }),
      })
    ) as unknown as jest.Mock;

    const messages = await getTopicMessages({ topicId, timeStamp, network });

    expect(messages).toEqual([
      {
        operation: "query-response",
        responder_did: "0.0.123",
        offer_hbar: 1,
      },
    ]);
  });

  it("should handle getting topic messages failures", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error("Failed to get topic messages")) as any;

    const logSpy = jest.spyOn(console, "log");

    const messages = await getTopicMessages({ topicId, timeStamp, network });

    expect(messages).toBe(undefined);
    expect(logSpy).toHaveBeenCalledWith(
      "Get topic messages failed:",
      new Error("Failed to get topic messages")
    );
  });
});
