import Mechanic from "../models/mechanicModel.js";

export const addMechanic = async (req, res) => {

    try {
        const { name, phone, specialization } = req.body;

        
        if(!name?.trim()){
            return res.status(400).json({
                success: false,
                message: "Mechanic name is required"
            })
        }
        
        const existing = await Mechanic.findOne({ phone })

        if(existing){
            return res.status(409).json({
                success: false,
                message: "Phone number already registered"
            })
        }

        if(!/^\d{10}$/.test(phone)){
            return res.status(400).json({
                success: false,
                message: "Please enter a valid phone number"
            })
        }

        const mechanic = await Mechanic.create({
            name,
            phone,
            specialization,
        })

        res.status(201).json({
            success: true,
            mechanic
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getMechanics = async (req, res) => {
    try {
        const mechanics = await Mechanic.find().sort({ createdAt: -1 });

        return res.json({
            success: true,
            mechanics
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const deleteMechanic = async (req, res) => {
    try {
        const { id } = req.params;

        const mechanic = await Mechanic.findById(id);

        if(!mechanic) {
            return res.status(404).json({
                success: false,
                message: "Mechanic not found"
            })
        }

        await Mechanic.findByIdAndDelete(id)

        return res.json({
            success: true,
            message: "Mechanic deleted"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

