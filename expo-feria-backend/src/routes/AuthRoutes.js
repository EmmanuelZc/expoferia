import express from "express";
import {
  registerFunction,
  loginFunction,
} from "../functions/auth/AuthFunctions.js";
const router = express.Router();

router.post("/login", registerFunction);
router.post("/register", loginFunction);

export default router;
