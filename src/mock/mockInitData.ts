export const appMetadata = {
  name: "Hedera Guardian Selective Disclosure",
  description: "Hedera Guardian Selective Disclosure",
  // TODO: upload icon for Hedera Guardian Selective Disclosure
  icon: "https://api-sandbox.svx.exchange/blobs/1f345707-447f-4273-96bd-4c135e0286d8",
};

export const createMockInitData = (
  network: "testnet" | "mainnet" | "previewnet",
  topicId: string,
  accountId: string
) =>
  new Promise<any>((resolve) => {
    resolve({
      topic: topicId,
      pairingString: "abc123",
      encryptionKey: "key123",
      savedPairings: [
        { metadata: appMetadata, network, accountIds: [accountId] } as any,
      ],
    });
  });
