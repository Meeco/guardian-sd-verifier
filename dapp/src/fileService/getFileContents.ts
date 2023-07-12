import { Client, FileContentsQuery } from "@hashgraph/sdk";
import { Buffer } from 'buffer';

const readFileAsJson = (text: string) => {
    return JSON.parse(text);
};

const readFileAsText = async (contents: Uint8Array) => {
    return Buffer.from(contents).toString('utf-8');
};

const getFileContents = async (client: Client, fileId: string) => {
    try {
        //Create the query
        const query = new FileContentsQuery()
            .setFileId(fileId)
            .setMaxAttempts(2);
        //Sign with client operator private key and submit the query to a Hedera network
        const contents = await query.execute(client);
        return readFileAsJson(await readFileAsText(contents));
    } catch (error) {
        console.log("Get file contents failed", error);
    }
};

export default getFileContents;