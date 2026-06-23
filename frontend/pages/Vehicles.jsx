import { useContext, useEffect, useState } from 'react'
import axios from "axios"
import { AuthContext } from '../src/context/AuthContext'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import SlotBoard from '../components/SlotBoard';
import { motion } from "framer-motion"

const Vehicles = () => {

    const { backendurl, token, setToken } = useContext(AuthContext);

    const [vehicles, setVehicles] = useState([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("Active")

    const navigate = useNavigate();

    const getStatusStyle = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-500/10 text-yellow-400 border-yellow-500/40";
            case "In Progress":
                return "bg-blue-500/10 text-blue-400 border-blue-500/40";
            case "Completed":
                return "bg-green-500/10 text-green-400 border-green-500/40";
            default:
                return "bg-gray-500/10 text-gray-400 border-gray-500/40";
        }
    }

    const updateStatus = async (vehicleId, newStatus) => {
        try {
            await axios.patch(
                `${backendurl}/api/vehicle/status/${vehicleId}`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            await fetchVehicles();
        } catch (error) {
            console.table(error.message);
        }
    };

    const deleteVehicle = async (id, status) => {
        if (status != "Completed") {
            toast.error("Only completed vehicles can be deleted")
            return;
        }

        try {
            const response = await axios.delete(`${backendurl}/api/vehicle/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (response.data.success) {
                setVehicles(prev => prev.filter(v => v._id !== id))
            }
        } catch (error) {
            toast.error(error.message)
        }

    }

    const fetchVehicles = async () => {
        try {
            setLoading(true);

            const response = await axios.get(`${backendurl}/api/vehicle/all`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (response.data.success) {
                setVehicles(response.data.vehicles)
            }
            else {
                toast.error(response.data.message)
            }
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem("token")
                setToken(null)
                navigate("/login")
                return;
            }
            toast.error(error.message)
        }
        finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchVehicles()
    }, [backendurl, token])

    const filteredVehicles = vehicles
        .filter((item) => {
            if (filter === "Active") return item.status !== "Completed";
            if (filter === "Completed") return item.status === "Completed";
            return true;
        })
        .filter((item) => {
            const q = search.toLowerCase();
            return (
                item.ownerName.toLowerCase().includes(q) ||
                item.vehicleNumber.toLowerCase().includes(q) ||
                item.phone.toString().includes(q)
            );
        });

    const activeCount = vehicles.filter(v => v.status !== "Completed").length;
    const completedCount = vehicles.filter(v => v.status === "Completed").length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0d12] text-gray-400 gap-3">
                <div className="w-5 h-5 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                Loading vehicles...
            </div>
        )
    }

    return (
        <motion.div
            className='min-h-screen p-6 sm:p-10 bg-[#0a0d12]'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >

            <SlotBoard vehicles={vehicles} />

            <div className="flex items-center gap-3 mb-1">
                <h1 className='text-2xl md:text-4xl font-bold tracking-tight text-white'>
                    Vehicle Problems & Status
                </h1>
                <div className="bg-gradient-to-r from-blue-500 to-transparent h-[2px] w-12 hidden sm:block"></div>
            </div>
            <p className="text-gray-500 text-sm mb-8">
                {vehicles.length} total &middot; {activeCount} active &middot; {completedCount} completed
            </p>

            <div className="mb-6 relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 10A7 7 0 113 10a7 7 0 0114 0z" />
                </svg>
                <input type="text"
                    placeholder='Search vehicle number / owner / phone...'
                    value={search}
                    onChange={(e) => { setSearch(e.target.value) }}
                    className='text-base w-full bg-[#11151c] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200'
                />
            </div>

            <div className="flex gap-2 mb-8 flex-wrap bg-[#11151c] p-1.5 rounded-xl border border-white/5 w-fit">
                <button
                    onClick={() => setFilter("Active")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                        filter === "Active"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${filter === "Active" ? "bg-blue-300" : "bg-gray-500"}`} />
                    Active
                    <span className={`text-xs px-1.5 py-0.5 rounded-md ${filter === "Active" ? "bg-white/20" : "bg-white/5"}`}>
                        {activeCount}
                    </span>
                </button>

                <button
                    onClick={() => setFilter("Completed")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                        filter === "Completed"
                            ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${filter === "Completed" ? "bg-green-300" : "bg-gray-500"}`} />
                    Completed
                    <span className={`text-xs px-1.5 py-0.5 rounded-md ${filter === "Completed" ? "bg-white/20" : "bg-white/5"}`}>
                        {completedCount}
                    </span>
                </button>

                <button
                    onClick={() => setFilter("All")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                        filter === "All"
                            ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${filter === "All" ? "bg-orange-300" : "bg-gray-500"}`} />
                    All
                    <span className={`text-xs px-1.5 py-0.5 rounded-md ${filter === "All" ? "bg-white/20" : "bg-white/5"}`}>
                        {vehicles.length}
                    </span>
                </button>
            </div>

            {vehicles.length === 0 && (
                <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center">
                    <h1 className='text-gray-400 text-lg font-light'>
                        No vehicles added yet...
                    </h1>
                </div>
            )}

            {vehicles.length > 0 && filteredVehicles.length === 0 && (
                <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center">
                    <h1 className='text-gray-400 text-lg font-light'>
                        No vehicles match your search/filter.
                    </h1>
                </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {filteredVehicles.map((item) => (
                    <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => navigate(`/vehicle/${item._id}`)}
                        className='bg-[#11151c] rounded-2xl p-5 border border-white/5 hover:border-white/15 hover:shadow-2xl hover:shadow-black/40 cursor-pointer transition-colors duration-200'
                    >
                        <div className='flex justify-between items-start mb-5'>
                            <div>
                                <h2 className='text-lg font-semibold text-white leading-tight'>
                                    {item.ownerName}
                                </h2>

                                <p className="text-gray-500 text-sm mt-1 font-mono tracking-wide">
                                    {item.vehicleNumber}
                                </p>
                            </div>

                            <img
                                src="/delete.png"
                                alt=""
                                className='w-5 h-5 cursor-pointer opacity-50 hover:opacity-100 hover:scale-110 transition-all duration-200'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteVehicle(item._id, item.status);
                                }}
                            />
                        </div>

                        {item.vehicleImage && (
                            <img
                                src={item.vehicleImage}
                                alt={item.vehicleNumber}
                                className='w-full h-48 object-cover rounded-xl mb-4 border border-white/5'
                            />
                        )}

                        <div className='space-y-3 text-sm'>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                                    Phone
                                </p>
                                <p className="text-gray-200">
                                    {item.phone}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                                    Vehicle Type
                                </p>
                                <p className="text-gray-200">
                                    {item.vehicleType}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                                    Issue
                                </p>
                                <p className="text-gray-300 leading-relaxed">
                                    {item.problemDescription}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-white/5 flex justify-end gap-3 items-center">
                            <span
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusStyle(item.status)}`}
                            >
                                {item.status}
                            </span>

                            {item.status === "In Progress" && (
                                <motion.button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        updateStatus(item._id, "Completed");
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className='text-xs font-medium px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 shadow-lg shadow-green-600/20'
                                >
                                    Mark Completed
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}

export default Vehicles