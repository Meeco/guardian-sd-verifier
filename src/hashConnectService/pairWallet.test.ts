import { jest } from "@jest/globals";
import { HashConnect } from "hashconnect/dist/cjs/main";
import { pairWallet } from "./pairWallet";

describe("pairWallet", () => {
  const mockConnectToLocalWallet = jest.fn();
  const mockHashconnect = {
    connectToLocalWallet: mockConnectToLocalWallet,
  } as unknown as HashConnect;

  it("should connect to wallet", () => {
    pairWallet(mockHashconnect);
    expect(mockConnectToLocalWallet).toBeCalled();
  });
});
