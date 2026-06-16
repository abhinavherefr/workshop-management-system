import mongoose from "mongoose";

const mechanicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    specialization: {
        type: String,
        default: "General"
    },
    active: {
        type: Boolean,
        default: true
    },
},
    {
        timestamps: true
    }
)

const Mechanic = mongoose.model("Mechanic", mechanicSchema)

export default Mechanic;

