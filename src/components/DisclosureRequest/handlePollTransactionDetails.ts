import { getTransactionDetailsById } from "../../consensusService";
import { pollRequest } from "../../utils";
import { NetworkType } from "../AppProvider";

export const handlePollTransactionDetails = async ({
  transactionId,
  network,
}: {
  transactionId: string;
  network: NetworkType;
}) => {
  const transactionDetails = await pollRequest(async () => {
    // Get transaction details response from mirror node
    return await getTransactionDetailsById({
      transactionId,
      network,
    });
  }, 12000);

  return transactionDetails;
};
