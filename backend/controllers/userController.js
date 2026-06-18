import User from "../models/userModel.js";
import bcrypt from "bcryptjs"
import validator from "validator"
import jwt from "jsonwebtoken"

const getToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "24h" })
}

// API to register user
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!validator.isEmail(email)) {
            return res.json({
                success: false,
                message: "Please enter a valid email"
            })
        }

        const exist = await User.findOne({ email })
        if (exist) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            })
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password too short"
            })
        }

        const salt = await bcrypt.genSalt(11);

        const hashedPass = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPass
        })

        const token = getToken(newUser._id, newUser.role)

        // const user = await newUser.save()
        res.json({
            success: true,
            token
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User does not exist."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid login credentials."
            });
        }

        const token = getToken(user._id, user.role);

        return res.json({
            success: true,
            token
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

