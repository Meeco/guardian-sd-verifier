import { jest } from "@jest/globals";
import { pairWallet } from "./pairWallet";

describe("pairWallet", () => {
  const mockConnectToLocalWallet = jest.fn();
  // Cast to any to fix esm/cjs issue
  const mockHashconnect = {
    connectToLocalWallet: mockConnectToLocalWallet,
  } as any;

  it("should connect to wallet", () => {
    pairWallet(mockHashconnect);
    expect(mockConnectToLocalWallet).toBeCalled();
  });
});
