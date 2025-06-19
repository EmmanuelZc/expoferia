import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import AuthRoutes from "./src/routes/AuthRoutes.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use("/api/auth", AuthRoutes);

export default app;
