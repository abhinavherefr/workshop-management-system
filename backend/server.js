import express from "express"
import connectDB from "./config/mongodb.js"
import 'dotenv/config'
import { registerUser } from "./controllers/userController.js"
import userRouter from "./routes/userRouter.js"
import cors from "cors"
import vehicleRouter from "./routes/vehicleRouter.js"
import mechanicRouter from "./routes/mechanicRoutes.js"


// App Config 
const app = express()
const port = process.env.PORT || 4000


// Middlewares
app.use(express.json())
app.use(cors({
    origin: true, credentials: true
}))

//  API Endpoints
app.get("/", (req, res) => {
    res.send("API Working ;)")
})

app.use("/api/user", userRouter)
app.use("/api/vehicle", vehicleRouter)
app.use("/api/mechanic", mechanicRouter)
// DB Connection
connectDB();


// Start server
app.listen(port, () => {
    console.log("Server started on port", port)
})










// 