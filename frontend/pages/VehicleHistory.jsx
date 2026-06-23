import { useContext, useState } from 'react'
import { AuthContext } from '../src/context/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion } from "framer-motion"
import { useNavigate } from 'react-router'

const statusStyle = (status) => {
    switch (status) {
        case "Completed":
            return "bg-green-500/10 text-green-400 border-green-500/30"
        case "Pending":
            return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
        default:
            return "bg-blue-500/10 text-blue-400 border-blue-500/30"
    }
}

const VehicleHistory = () => {

    const [vehicleNumber, setVehicleNumber] = useState('')
    const [vehicles, setVehicles] = useState([])
    const [customerHistory, setCustomerHistory] = useState(null)
    const [loading, setLoading] = useState(false)
    const { token, backendurl } = useContext(AuthContext)

    const navigate = useNavigate()

    const searchVehicles = async () => {
        if (!(vehicleNumber || "").trim()) {
            return toast.error("Enter a vehicle number")
        }
        try {
            setLoading(true)
            setCustomerHistory(null)
            setVehicles([])
            const response = await axios.get(
                `${backendurl}/api/vehicle/search?query=${(vehicleNumber || "").trim()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            if (response.data.success) {
                setVehicles(response.data.results)
            }
            else {
                setVehicles([])
                toast.error(response.data.message)
            }
            setLoading(false)

        } catch (error) {
            setLoading(false)
            toast.error(error.message)
        }
    }

    const getVehicleHistory = async (vehicleNumber) => {
        try {
            setLoading(true)

            const response = await axios.get(
                `${backendurl}/api/vehicle/history?query=${vehicleNumber}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            if (response.data.success) {
                setCustomerHistory(response.data);
                setVehicles([])
            }
            else {
                toast.error(response.data.message)
            }

            setLoading(false);

        } catch (error) {
            setLoading(false)
            toast.error(error.message)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className='p-6 sm:p-10 min-h-screen bg-[#0a0d12] text-white'
        >
            <div className="w-full max-w-4xl mx-auto grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3 mb-10 sm:flex sm:gap-4">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0"> ← </button>
                <div className="flex items-center gap-3 justify-center sm:flex-1">
                    <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>
                        Vehicle History
                    </h1>
                    <div className="bg-gradient-to-r from-blue-500 to-transparent h-[2px] w-12 hidden sm:block"></div>
                </div>
                <div className="sm:hidden"></div>
            </div>

            <div className="flex items-center justify-center">
                <div className="flex flex-col items-center w-full max-w-3xl">
                    <div className="flex items-center gap-3 w-full relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 10A7 7 0 113 10a7 7 0 0114 0z" />
                        </svg>
                        <input
                            className='bg-[#11151c] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm w-full text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200'
                            type="text"
                            placeholder='Search by vehicle number or owner name'
                            onChange={(e) => { setVehicleNumber(e.target.value) }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    searchVehicles()
                                }
                            }}
                        />
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            disabled={loading}
                            onClick={searchVehicles}
                            className='bg-orange-600 cursor-pointer hover:bg-orange-700 px-5 py-3 text-sm rounded-xl font-medium shrink-0 transition-colors duration-200 disabled:opacity-50 flex items-center gap-2'
                        >
                            {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>}
                            {loading ? "Searching..." : "Search"}
                        </motion.button>
                    </div>
                </div>
            </div>

            {!loading && vehicles.length === 0 && vehicleNumber && !customerHistory && (
                <div className="max-w-3xl mx-auto border border-dashed border-white/10 rounded-xl py-10 mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        No vehicles found
                    </p>
                </div>
            )}

            {customerHistory && (
                <div className="flex justify-center mt-8">
                    <motion.div
                        className="w-full max-w-3xl bg-[#11151c] border border-white/5 rounded-2xl p-6"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-2xl font-bold">
                                {customerHistory.customer.ownerName}
                            </h2>
                            <span className="text-xs text-gray-500 bg-white/5 px-2.5 py-1 rounded-md">
                                {customerHistory.customer.totalVisits} visits
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                                <p className="text-gray-200">{customerHistory.customer.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Vehicle Number</p>
                                <p className="text-gray-200 font-mono tracking-wide">{customerHistory.customer.vehicleNumber}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Vehicle Model</p>
                                <p className="text-gray-200">{customerHistory.customer.vehicleModel}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Visits</p>
                                <p className="text-gray-200">{customerHistory.customer.totalVisits}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {vehicles.length > 0 && (
                <div className="max-w-3xl mx-auto space-y-3 mt-8">
                    {vehicles.map((item) => (
                        <motion.div
                            className="cursor-pointer bg-[#11151c] border border-white/5 hover:border-white/15 p-5 rounded-xl transition-colors duration-200"
                            key={item.vehicleNumber}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -3 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => getVehicleHistory(item.vehicleNumber)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className='text-lg font-semibold'>
                                        {item.ownerName}
                                    </h2>
                                    <p className="text-gray-500 text-sm font-mono tracking-wide mt-0.5">
                                        {item.vehicleNumber}
                                    </p>
                                </div>
                                <span className="text-blue-400 text-xs bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md">
                                    {item.totalVisits} visits
                                </span>
                            </div>
                            <p className="text-gray-300 text-sm mt-3">
                                {item.phone}
                            </p>
                            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-white/5">
                                Click to view history →
                            </p>
                        </motion.div>
                    ))}
                </div>
            )}

            {customerHistory && (
                <motion.div className="w-full max-w-3xl mx-auto mt-10 flex flex-col gap-5">
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        Service History
                        <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">
                            {customerHistory.history.length}
                        </span>
                    </h2>

                    <div className="space-y-0">
                        {customerHistory.history.map((visit, index) => (
                            <motion.div
                                className="flex gap-4"
                                key={visit._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.06 }}
                            >
                                <div className="flex flex-col items-center pt-2 relative">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] z-10 shrink-0"></div>
                                    {index !== customerHistory.history.length - 1 && (
                                        <div className="w-[2px] flex-1 bg-white/10 mt-1"></div>
                                    )}
                                </div>

                                <div className="bg-[#11151c] border border-white/5 p-5 rounded-xl flex-1 mb-4">
                                    <div className="flex flex-col gap-2 mb-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">
                                            Visit #{customerHistory.history.length - index}
                                        </p>
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <h3 className="font-semibold text-base sm:text-lg">
                                                {visit.serviceType} Service
                                            </h3>
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${statusStyle(visit.status)}`}>
                                                {visit.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-sm space-y-2">
                                        <p>
                                            <span className="text-gray-500">Date: </span>
                                            <span className="text-gray-200">{new Date(visit.createdAt).toLocaleDateString()}</span>
                                        </p>
                                        <p>
                                            <span className="text-gray-500">Odometer: </span>
                                            <span className="text-gray-200">{visit.odometerReading} km</span>
                                        </p>
                                        <p>
                                            <span className="text-gray-500">Problem: </span>
                                            <span className="text-gray-200">{visit.problemDescription || "No description provided"}</span>
                                        </p>
                                        <p>
                                            <span className="text-gray-500">Slot: </span>
                                            <span className="text-gray-200">{visit.slotNumber ?? "Not Assigned"}</span>
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

        </motion.div>
    )
}

export default VehicleHistory