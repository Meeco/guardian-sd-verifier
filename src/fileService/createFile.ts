import { FileCreateTransaction, Hbar } from "@hashgraph/sdk";
import { Signer } from "@hashgraph/sdk/lib/Signer";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";

const createFile = async (
  hcSigner: HashConnectSigner,
  provider: any,
  contents: string | Uint8Array
) => {
  try {
    const signer = hcSigner as unknown as Signer;

    //Create the transaction
    const transaction = await new FileCreateTransaction()
      .setContents(contents)
      .setMaxTransactionFee(new Hbar(2))
      .freezeWithSigner(signer);

    const { transactionId } = await transaction.executeWithSigner(signer);

    return transactionId;
  } catch (error) {
    console.log("Create file transaction failed:", error);
  }
};

export default createFile;
