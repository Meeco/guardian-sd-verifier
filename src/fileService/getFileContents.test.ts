import { FileContentsQuery } from "@hashgraph/sdk";
import getFileContents from "./getFileContents";

describe("getFileContents", () => {
  const hcSigner = {} as any;
  const fileId = "0.0.123";

  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should get file contents successfully", async () => {
    const contents = Buffer.from('{"x":5,"y":6}');
    const mockQuery = jest.fn().mockResolvedValue(contents);

    const setFileId = jest.spyOn(FileContentsQuery.prototype, "setFileId");
    jest
      .spyOn(FileContentsQuery.prototype, "execute")
      .mockImplementation(mockQuery);

    const result = await getFileContents({
      hcSigner,
      fileId,
    });

    expect(setFileId).toHaveBeenCalledWith(fileId);

    expect(mockQuery).toHaveBeenCalledWith(hcSigner);
    expect(result).toEqual(contents);
  });

  it("should handle getting file contents failures", async () => {
    jest
      .spyOn(FileContentsQuery.prototype, "execute")
      .mockRejectedValue(new Error("Failed to get file contents"));

    const logSpy = jest.spyOn(console, "log");

    const result = await getFileContents({
      hcSigner,
      fileId,
    });

    expect(result).toBe(undefined);
    expect(logSpy).toHaveBeenCalledWith("Unable to get file contents");
  });
});
