import { jest } from "@jest/globals";
import { handlePollPresentationResponseRequest } from "./handlePollPresentationResponseRequest";

describe("handlePollPresentationResponseRequest", () => {
  // importing "NetworkType" from "AppProvider.tsx" cause ESM error, have to case to any to avoid the error
  const network = "testnet" as any;
  it("should return the presentation response message when it exists", async () => {
    // Mock the getTopicMessages function to return a presentation response message
    const topicMessage = {
      operation: "presentation-response",
      request_id: "12877199-db53-44d7-8337-02574513c1f1",
      recipient_did: "did:key:z6Mks2X1aKs8PvepaGbhUghRY3pTBsjQificC4ybNnriSBSM",
      response_file_cid:
        "bafybeihfss3ck4tvlencttvzjecylnmem4nzvueoowdq6p6rlvjuktwaa4/did-document.json",
      response_file_encrypted_key_id:
        "did:key:z6MkhcPeozxbmYopWVJYGEr7JFpyNPDynBKSpSRwqBZEgr5u#z6MkhcPeozxbmYopWVJYGEr7JFpyNPDynBKSpSRwqBZEgr5u",
    };

    const decryptedResponseMessage = {
      message:
        "eyJvcGVyYXRpb24iOiJwcmVzZW50YXRpb24tcmVzcG9uc2UiLCJyZXF1ZXN0X2lkIjoiMTI4NzcxOTktZGI1My00NGQ3LTgzMzctMDI1NzQ1MTNjMWYxIiwicmVjaXBpZW50X2RpZCI6ImRpZDprZXk6ejZNa3MyWDFhS3M4UHZlcGFHYmhVZ2hSWTNwVEJzalFpZmljQzR5Yk5ucmlTQlNNIiwicmVzcG9uc2VfZmlsZV9jaWQiOiJiYWZ5YmVpaGZzczNjazR0dmxlbmN0dHZ6amVjeWxubWVtNG56dnVlb293ZHE2cDZybHZqdWt0d2FhNC9kaWQtZG9jdW1lbnQuanNvbiIsInJlc3BvbnNlX2ZpbGVfZW5jcnlwdGVkX2tleV9pZCI6ImRpZDprZXk6ejZNa2hjUGVvenhibVlvcFdWSllHRXI3SkZweU5QRHluQktTcFNSd3FCWkVncjV1I3o2TWtoY1Blb3p4Ym1Zb3BXVkpZR0VyN0pGcHlOUER5bkJLU3BTUndxQlpFZ3I1dSJ9",
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({ messages: [decryptedResponseMessage] }),
        status: 200,
        ok: true,
      })
    ) as unknown as jest.Mock;

    const timeStamp = 12345;

    const result = await handlePollPresentationResponseRequest({
      requestId: topicMessage.request_id,
      timeStamp,
      network,
    });

    expect(JSON.stringify(result)).toEqual(JSON.stringify(topicMessage));
  });
});
