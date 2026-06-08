import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "workshopDB"
        })
        console.log("Database connected successfully")
    } catch (error) {
        console.log("Database connection error: ", error)
    }
}

export default connectDB