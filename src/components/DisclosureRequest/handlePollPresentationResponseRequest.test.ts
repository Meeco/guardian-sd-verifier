import { jest } from "@jest/globals";
import { getTopicMessages } from "../../consensusService";
import { MessageType } from "../../types";
import { handlePollPresentationResponseRequest } from "./handlePollPresentationResponseRequest";

describe("handlePollPresentationResponseRequest", () => {
  jest.mock("getTopicMessages");

  it("should return the presentation response message when it exists", async () => {
    // Mock the getTopicMessages function to return a presentation response message
    const presentationResponseMessage = {
      request_id: "sampleRequestId",
      operation: MessageType.PRESENTATION_RESPONSE,
      // Add other necessary properties
    };
    (getTopicMessages as any).mockResolvedValue([presentationResponseMessage]);

    const requestId = "sampleRequestId";
    const timeStamp = 12345;

    const result = await handlePollPresentationResponseRequest({
      requestId,
      timeStamp,
    });

    expect(result).toEqual(presentationResponseMessage);
  });

  it("should return null when the presentation response message does not exist", async () => {
    // Mock the getTopicMessages function to return an empty array
    (getTopicMessages as any).mockResolvedValue([]);

    const requestId = "nonExistentRequestId";
    const timeStamp = 54321;

    const result = await handlePollPresentationResponseRequest({
      requestId,
      timeStamp,
    });

    expect(result).toBeNull();
  });
});
