import { NetworkType } from "../components/AppProvider";

const getTransactionDetailsById = async ({
  transactionId,
  network,
}: {
  transactionId: string;
  network: NetworkType;
}) => {
  let formatedId = transactionId.replace("@", "-");
  const strArr = formatedId.split(".");
  formatedId = `${strArr[0]}.${strArr[1]}.${strArr[2]}-${strArr[3]}`;

  const url = `https://${network}.mirrornode.hedera.com/api/v1/transactions/${formatedId}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    const { transactions } = await res.json();

    if (transactions.length > 0) return transactions[0];
  } catch (error) {
    console.log("Get transaction details failed:", error);
  }
};

export default getTransactionDetailsById;
