import express from "express"
import adminAuth from "../middleware/adminAuth.js";
import { addMechanic, deleteMechanic, getMechanics } from "../controllers/mechanicController.js";
import auth from "../middleware/auth.js";

const mechanicRouter = express.Router();

mechanicRouter.post("/add", auth, adminAuth, addMechanic)

mechanicRouter.get("/all", auth, getMechanics);

mechanicRouter.delete("/:id", auth, adminAuth, deleteMechanic)

export default mechanicRouter;