import { jest } from "@jest/globals";
import { handlePollTransactionDetails } from "./handlePollTransactionDetails";

describe("handlePollTransactionDetails", () => {
  it("should return transaction details when it exists", async () => {
    const mockTransactionId = "0.0.123";
    const mockFileId = "0.0.456";
    const network = "testnet" as any;

    global.fetch = jest
      .fn()
      .mockImplementationOnce(async () => Promise.reject({ ok: false }))
      .mockImplementationOnce(async () => {
        return {
          json: () => ({
            transactions: [{ entity_id: mockFileId }],
          }),
          status: 200,
          ok: true,
        } as any;
      }) as unknown as jest.Mock;

    const tx = await handlePollTransactionDetails({
      transactionId: mockTransactionId,
      network,
    });
    expect(tx.entity_id).toBe(mockFileId);
  }, 10000);
});
