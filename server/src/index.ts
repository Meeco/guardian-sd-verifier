import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initSigningService, signAndMakeBytes } from "./signingService";

const app = express();
dotenv.config();

const port = process.env.PORT || 8000;
const accountId = process.env.MY_ACCOUNT_ID || "";
const privateKey = process.env.MY_PRIVATE_KEY || "";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});

initSigningService(accountId, privateKey);

app.get("/tx-bytes-string", async (req, res) => {
  const outBytesStr = await signAndMakeBytes(privateKey, accountId);
  res.json({ outBytesStr });
});
