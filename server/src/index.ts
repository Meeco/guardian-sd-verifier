import cors from "cors";
import dotenv from "dotenv";
import express from "express";

const app = express();
dotenv.config();

const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
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
