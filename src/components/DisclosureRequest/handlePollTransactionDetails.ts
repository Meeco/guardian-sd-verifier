import { getTransactionDetailsById } from "../../consensusService";
import { pollRequest } from "../../utils";
import { NetworkType } from "../AppProvider";

export const handlePollTransactionDetails = async ({
  transactionId,
  network,
  pollTimeout = 12000,
  pollInterval,
}: {
  transactionId: string;
  network: NetworkType;
  pollTimeout?: number;
  pollInterval?: number;
}) => {
  const transactionDetails = await pollRequest(
    async () => {
      // Get transaction details response from mirror node
      return await getTransactionDetailsById({
        transactionId,
        network,
      });
    },
    pollTimeout,
    pollInterval
  );

  return transactionDetails;
};
