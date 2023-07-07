import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initSigningService, createTransactionString } from "./signingService";

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
  const outBytesStr = await createTransactionString(privateKey, accountId);
  res.json({ outBytesStr });
});

app.get("/resolve-did/:id", async (req, res) => {
  const { params } = req;
  const { id } = params;
  const response = await fetch(
    `https://api.godiddy.com/0.1.0/universal-resolver/identifiers/${id}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GODIDDY_APIKEY}`,
      },
    }
  );

  const resJson = await response.json();
  res.json(resJson);
});
