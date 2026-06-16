import express from "express"
import { loginUser, registerUser,  } from "../controllers/userController.js";
import { addMechanic, deleteMechanic } from "../controllers/mechanicController.js"
import auth from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";


const userRouter = express.Router();


userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.get("/me", auth, (req, res) => {
    res.json({
        success: true,
        message: "Auth working",
        user: req.user
    })
})


export default userRouter;