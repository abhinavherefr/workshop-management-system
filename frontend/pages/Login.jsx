import { useContext, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Login = () => {
    const { setToken, backendurl } = useContext(AuthContext);

    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.from?.pathname || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const response = await axios.post(
                `${backendurl}/api/user/login`,
                {
                    email,
                    password,
                }
            );

            if (response.data.success) {
                toast.success("Signed in successfully");

                localStorage.setItem("token", response.data.token);
                setToken(response.data.token);

                setEmail("");
                setPassword("");

                navigate(redirectTo, { replace: true });
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to connect to the server"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.form
            onSubmit={submitHandler}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4"
        >
            <div className="w-full max-w-[390px]">
                <div className="text-white text-center text-3xl font-semibold mb-8">
                    Receptionist Sign In
                </div>

                <motion.div
                    className="bg-[#1a1f2b] p-8 rounded-2xl"
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="flex flex-col gap-6 text-white text-sm">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="border border-gray-700 p-4 focus:outline-none focus:border-orange-500"
                        />

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="border border-gray-700 p-4 focus:outline-none focus:border-orange-500"
                        />
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-orange-600 mt-8 p-3 text-lg rounded-2xl w-full text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </motion.button>

                    <div className="text-sm mt-4 text-gray-400 flex justify-center">
                        <p className="text-right">
                            Contact administrator for an account
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.form>
    );
};

export default Login;