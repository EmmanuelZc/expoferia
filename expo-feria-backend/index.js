import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import AuthRoutes from "./src/routes/AuthRoutes.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 7071;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

//RUTAS
app.post("/api/auth", AuthRoutes);

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
