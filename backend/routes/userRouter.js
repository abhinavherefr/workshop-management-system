import express from "express"
import { getUsers, loginUser, registerUser, } from "../controllers/userController.js";
import { addMechanic, deleteMechanic } from "../controllers/mechanicController.js"
import auth from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";


const userRouter = express.Router();


userRouter.post("/register", auth, adminAuth, registerUser)
userRouter.post("/login", loginUser)
userRouter.get("/me", auth, (req, res) => {
    res.json({
        success: true,
        message: "Auth working",
        user: req.user
    })
})
userRouter.get(
    "/all",
    auth,
    adminAuth,
    getUsers
);


export default userRouter;