import { jest } from "@jest/globals";
import mockDidDoc from "../mock/did_document.json";
import fetchResolveDid from "./fetchResolveDid";
describe("fetchResolveDid", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch resolve did successfully", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDidDoc),
      })
    ) as unknown as jest.Mock;

    const data = await fetchResolveDid("123");
    expect(data).toEqual(mockDidDoc);
  });

  it("should handle fetch resolve did failures", async () => {
    const errValue = new Error(
      'Could not fetch from "http://localhost:5000/1.0/identifiers/123"'
    );
    global.fetch = jest.fn().mockRejectedValue(errValue) as any;

    try {
      await fetchResolveDid("123");
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(JSON.stringify(error)).toBe(JSON.stringify(errValue));
    }
  });
});
