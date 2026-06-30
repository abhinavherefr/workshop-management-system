import express from "express"
import { createVehicle, getVehicles, updateVehicleStatus, deleteVehicle, getVehicleHistory, searchVehicles, getVehicleById, assignMechanic, updateVehicle, updateCost } from "../controllers/vehicleController.js";
import auth from "../middleware/auth.js"
import upload from "../middleware/multer.js";

const vehicleRouter = express.Router();

vehicleRouter.post("/create", auth, upload.single("image"), createVehicle)

vehicleRouter.get("/all", auth, getVehicles);

vehicleRouter.patch("/status/:id", auth, (req, res, next) => {
    next()
}, updateVehicleStatus)

vehicleRouter.delete("/:id", auth, deleteVehicle)

vehicleRouter.get("/history/", auth, getVehicleHistory)

vehicleRouter.get("/search", searchVehicles)

vehicleRouter.get("/:id", auth, getVehicleById)

vehicleRouter.put("/:id/assign-mechanic", auth, assignMechanic)

vehicleRouter.put("/:id", upload.single("image"), auth, updateVehicle)

vehicleRouter.patch("/cost/:id", auth, updateCost)
export default vehicleRouter;
