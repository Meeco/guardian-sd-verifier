import { describe, expect, it, jest } from "@jest/globals";
import { ResultType, fetchIPFSFile } from "./fetchIPFSFile";

describe("fetchIPFSFile", () => {
  it("fetches an IPFS file as text by default", async () => {
    const text = () => `Hello, World`;

    global.fetch = jest.fn(() =>
      Promise.resolve({ text, status: 200, ok: true })
    ) as unknown as jest.Mock;

    const response = await fetchIPFSFile("EXAMPLECID");

    expect(response).toEqual(`Hello, World`);
  });

  it("fetches an IPFS file as json", async () => {
    const json = () => ({ message: `Hello, World` });

    global.fetch = jest.fn(() =>
      Promise.resolve({ json, status: 200, ok: true })
    ) as unknown as jest.Mock;

    const response = await fetchIPFSFile("EXAMPLECID", {
      resultType: ResultType.JSON,
    });

    expect(response).toEqual({ message: `Hello, World` });
  });

  it("fetches an IPFS file as binary", async () => {
    const buff = new ArrayBuffer(1);
    const arrayBuffer = () => buff;

    global.fetch = jest.fn(() =>
      Promise.resolve({ arrayBuffer, status: 200, ok: true })
    ) as unknown as jest.Mock;

    const response = await fetchIPFSFile("EXAMPLECID", {
      resultType: ResultType.ARRAY_BUFFER,
    });

    expect(response).toEqual(buff);
  });
});
