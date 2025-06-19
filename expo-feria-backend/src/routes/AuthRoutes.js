import express from "express";
import { index as loginFunction } from "../../login/index.js";
import { index as registerFunction } from "../../register/index.js";
const router = express.Router();

router.post("/login", loginFunction);
router.post("/register", registerFunction);

export default router;
