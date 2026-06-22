import mongoose from "mongoose";

const VehicleModel = new mongoose.Schema({
    ownerName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
    },
    vehicleNumber: {
        type: String,
        required: true,
    },
    vehicleType: {
        type: String,
        enum: ["Car", "Bike"],
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "In Progress", "Completed"],
        default: "Pending",
        required: true
    },
    problemDescription: {
        type: String,

    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    slotNumber: {
        type: Number,
        default: null
    },
    serviceType: {
        type: String,
        enum: ["Basic", "Full", "Engine", "Electrical"],
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mechanic",
        default: null
    },
    estimatedTime: {
        type: Number,
        default: null,
    },
    odometerReading: {
        type: Number,
        default: null,
        required: true
    },
    vehicleModel: {
        type: String,
        required: true
    },
    vehicleImage: {
        type: String
    },
    laborCost: {
        type: Number, 
        default: 0
    },
    partsCost: {
        type: Number,
        default: 0
    },
    totalCost: {
        type: Number,
        default: 0
    }
},
    {
        timestamps: true
    }
)

const Vehicle = mongoose.model("Vehicle", VehicleModel)

export default Vehicle