import express from "express";
import router from "./routes/route.js";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", router);



app.listen(process.env.PORT || 3000, () => {
    console.log(`Node-Server is live.....`);
});
