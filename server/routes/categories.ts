import express from "express";
const router = express.Router();
import { isLoggedIn } from "../middleware/auth";

import * as categories from "../controllers/categories";

router.put("/", isLoggedIn, categories.updateV2);

router.get("/", isLoggedIn, categories.find);

module.exports = router;
