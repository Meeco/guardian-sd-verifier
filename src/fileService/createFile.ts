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

    const res = await transaction.executeWithSigner(signer);

    // TODO: Ideally, should get transaction reciept by
    // `const receipt = await res.getReceiptWithSigner(signer);`
    // But currently got `res.getReceiptWithSigner is not a function` error from "@hashgraph/sdk"
    const receipt = await provider.getTransactionReceipt(res.transactionId);

    const { fileId } = receipt;
    return fileId;
  } catch (error) {
    console.log("Create file transaction failed:", error);
  }
};

export default createFile;
