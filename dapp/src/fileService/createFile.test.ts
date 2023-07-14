import {
  FileCreateTransaction,
  Hbar,
  PrivateKey,
  PublicKey,
} from "@hashgraph/sdk";
import createFile from "./createFile";

describe("createFile", () => {
  const client = {} as any;
  const key =
    "0000000000000000000000000000000000000000000000000000000000000000";

  const contents = "Hello, World";

  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should send create file transaction successfully", async () => {
    const mockFileId = "0.0.123";

    const mockCreateFile = jest.fn().mockResolvedValue({
      getReceipt: jest.fn().mockResolvedValue({
        fileId: mockFileId,
      }),
    });

    const setKeys = jest.spyOn(FileCreateTransaction.prototype, "setKeys");
    const setContents = jest.spyOn(
      FileCreateTransaction.prototype,
      "setContents"
    );
    const setMaxTransactionFee = jest.spyOn(
      FileCreateTransaction.prototype,
      "setMaxTransactionFee"
    );
    const freezeWith = jest
      .spyOn(FileCreateTransaction.prototype, "freezeWith")
      .mockReturnThis();

    const sign = jest
      .spyOn(FileCreateTransaction.prototype, "sign")
      .mockReturnThis();

    jest
      .spyOn(FileCreateTransaction.prototype, "execute")
      .mockImplementation(mockCreateFile);

    const fileId = await createFile(client, key, key, contents);

    expect(setKeys).toHaveBeenCalledWith([PublicKey.fromString(key)]);
    expect(setContents).toHaveBeenCalledWith("Hello, World");
    expect(setMaxTransactionFee).toHaveBeenCalledWith(new Hbar(2));
    expect(freezeWith).toHaveBeenCalledWith(client);

    expect(sign).toHaveBeenCalledWith(PrivateKey.fromString(key));

    expect(mockCreateFile).toHaveBeenCalledWith(client);
    expect(fileId).toEqual("0.0.123");
  });

  it("should handle creating file transaction failures", async () => {
    jest
      .spyOn(FileCreateTransaction.prototype, "execute")
      .mockRejectedValueOnce(new Error("Failed to create file transaction"));
    const logSpy = jest.spyOn(console, "log");

    const fileId = await createFile(client, key, key, contents);

    expect(fileId).toBe(undefined);
    expect(logSpy).toHaveBeenCalledWith(
      "Create file transaction failed",
      new Error("Failed to create file transaction")
    );
  });
});
