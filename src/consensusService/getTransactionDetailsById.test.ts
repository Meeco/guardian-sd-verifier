import { jest } from "@jest/globals";
import getTransactionDetailsById from "./getTransactionDetailsById";

describe("getTransactionDetailsById", () => {
  it("should get transaction details successfully", async () => {
    const mockTransactionId = "0.0.123";
    const mockFileId = "0.0.456";
    const network = "testnet" as any;

    global.fetch = jest.fn().mockImplementationOnce(async () => {
      return {
        json: () => ({
          transactions: [{ entity_id: mockFileId }],
        }),
        status: 200,
        ok: true,
      } as any;
    }) as unknown as jest.Mock;

    const transcation = await getTransactionDetailsById({
      transactionId: mockTransactionId,
      network,
    });

    expect(transcation.entity_id).toBe(mockFileId);
  });
});
