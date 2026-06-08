import jwt from "jsonwebtoken"


const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        if(!authHeader){
            return res.json({
                success: false,
                message: "Invalid token"
            })
        }
        
        const token = authHeader.split(" ")[1];

        if(!token){
            return res.json({
                success: false,
                message: "Invalid token format"
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = { id: decoded.id, role: decoded.role}
        
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Session expired. Please login again."
        })
    }
}


export default auth;
