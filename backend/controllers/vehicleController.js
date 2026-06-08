import Vehicle from "../models/vehicleModel.js";
import { findFreeSlot } from "../utils/slotHelper.js";
import cloudinary from "../config/cloudinary.js"
import streamifier from "streamifier"


const streamUpload = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "Workshop Management System" },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        )
        streamifier.createReadStream(fileBuffer).pipe(stream)
    })
}

export const createVehicle = async (req, res) => {


    const vehicleRegex = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$|^\d{2}BH\d{4}[A-Z]{1,2}$/;

    try {
        // console.log('req.body', req.body)
        // console.log('req.file present?', !!req.file)
        const { ownerName, phone, vehicleNumber, vehicleType, problemDescription, serviceType, odometerReading, vehicleModel } = req.body;

        const normalizedVehicleNumber = (vehicleNumber || "")
            .trim()
            .toUpperCase();

        if (!normalizedVehicleNumber) {
            return res.json({
                success: false,
                message: "Vehicle number missing"
            })
        }

        if (!vehicleRegex.test(normalizedVehicleNumber)) {
            return res.json({
                success: false,
                message: "Please enter a valid vehicle number"
            })
        }

        const activeVehicles = await Vehicle.find({
            status: { $ne: "Completed" }
        })

        const slot = findFreeSlot(activeVehicles)

        let status;
        let slotNumber;

        if (slot) {
            status = "In Progress"
            slotNumber = slot;
        }
        else {
            status = "Pending"
            slotNumber = null;
        }

        if (!/^\d{10}$/.test(phone)) {
            return res.json({
                success: false,
                message: "Please enter a valid phone number"
            })
        }

        let vehicleImage = "";

        if (req.file) {
            const result = await streamUpload(req.file.buffer);

            if(!result || !result.secure_url){
                return res.json({
                    success: false,
                    message: "Image upload failed"
                })
            }
            vehicleImage = result.secure_url
        }

        const vehicle = await Vehicle.create({
            ownerName,
            phone,
            vehicleNumber,
            vehicleType,
            problemDescription,
            createdBy: req.user.id,
            status,
            slotNumber,
            serviceType,
            odometerReading,
            vehicleModel,
            vehicleImage
        })


        res.json({
            success: true,
            vehicle,
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

export const getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find();

        res.json({
            success: true,
            vehicles,
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message,
        });
    }
};

export const updateVehicleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const vehicle = await Vehicle.findById(id);

        if (!vehicle) {
            return res.json({ success: false, message: "Vehicle not und" });
        }

        const freedSlot = vehicle.slotNumber;

        vehicle.status = status;

        if (status === "Completed") {
            vehicle.slotNumber = null;
        }

        await vehicle.save();

        // PROCESS QUEUE ONLY WHEN SLOT FREES
        if (status === "Completed" && freedSlot) {

            await Vehicle.findOneAndUpdate(
                { status: "Pending", slotNumber: null },
                {
                    status: "In Progress",
                    slotNumber: freedSlot
                },
                {
                    sort: { createdAt: 1 },
                    new: true
                }
            );
        }

        return res.json({
            success: true,
            message: "Status updated",
            vehicle
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

export const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        const vehicle = await Vehicle.findById(id);

        if (!vehicle) {
            return res.json({ success: false, message: "Vehicle not found" })
        }

        if (vehicle.status !== "Completed") {
            return res.json({
                success: false,
                message: "Only completed vehicles can be deleted"
            })
        }

        await Vehicle.findByIdAndDelete(id)

        res.json({
            success: true,
            message: "Vehicle deleted"
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

// export const getVehicleHistory = async (req, res) => {
//     try {
//         const { vehicleNumber } = req.params;

//         const history = await Vehicle.find({
//             vehicleNumber: vehicleNumber
//         }).sort({ createdAt: -1 })


//         if (history.length === 0) {
//             return res.json({
//                 success: false,
//                 message: "No history found"
//             })
//         }

//         const latestVisit = history[0];

//         return res.json({
//             success: true,
//             customer: {
//                 ownerName: latestVisit.ownerName,
//                 phone: latestVisit.phone,
//                 vehicleNumber: latestVisit.vehicleNumber,
//                 vehicleModel: latestVisit.vehicleModel,
//                 totalVisits: history.length
//             },
//             history
//         })

//     } catch (error) {
//         return res.json({
//             success: false,
//             message: error.message
//         })
//     }
// }

export const searchVehicles = async (req, res) => {
    try {

        const query = req.query.query;

        if (!query) {
            return res.json({
                success: false,
                message: "Query required"
            })
        }


        const results = await Vehicle.aggregate([

            {
                $match: {
                    $or: [
                        { ownerName: { $regex: query, $options: "i" } },
                        { vehicleNumber: { $regex: query, $options: "i" } },
                        { phone: { $regex: query, $options: "i" } }
                    ]
                }
            },
            {
                $group: {
                    _id: "$vehicleNumber",
                    ownerName: { $first: "$ownerName" },
                    vehicleNumber: { $first: "$vehicleNumber" },
                    vehicleModel: { $first: "$vehicleModel" },
                    phone: { $first: "$phone" },
                    totalVisits: { $sum: 1 }
                }
            }
        ])

        if (results.length === 0) {
            return res.json({
                success: true,
                results: []
            })
        }

        return res.json({
            success: true,
            results
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

export const getVehicleHistory = async (req, res) => {

    try {
        const query = req.query.query;
        if (!query) {
            return res.json({
                success: false,
                message: "Query required"
            })
        }

        let records = await Vehicle.find({
            $or: [
                { vehicleNumber: query },
                { ownerName: { $regex: query, $options: "i" } }
            ]
        }).sort({ createdAt: -1 })

        if (records.length === 0) {
            return res.json({
                success: false,
                message: "No vehicle found"
            })
        }

        const latest = records[0];

        return res.json({
            success: true,
            customer: {
                ownerName: latest.ownerName,
                phone: latest.phone,
                vehicleNumber: latest.vehicleNumber,
                vehicleModel: latest.vehicleModel,
                totalVisits: records.length
            },
            history: records
        })

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

export const getVehicleById = async (req, res) => {

    const vehicle = await Vehicle.findById(req.params.id)

    const history = await Vehicle.find({
        vehicleNumber: vehicle.vehicleNumber
    }).sort({ createdAt : -1 })

    if(!vehicle){
        return res.json({
            success: false,
            message: "Vehicle does not exist"
        })
    }

    res.json({
        success: true,
        vehicle,
        history
    })
}