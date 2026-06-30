import { useContext, useEffect, useState } from 'react'
import axios from "axios"
import { AuthContext } from '../src/context/AuthContext'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import SlotBoard from '../components/SlotBoard';
import { motion, AnimatePresence } from "framer-motion"

const PAGE_SIZE = 9

const Vehicles = () => {

    const { backendurl, token, setToken } = useContext(AuthContext);

    const [vehicles, setVehicles] = useState([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("Active")
    const [page, setPage] = useState(1)

    const navigate = useNavigate();

    const getStatusStyle = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
            case "In Progress":
                return "bg-blue-500/10 text-blue-400 border-blue-500/30";
            case "Completed":
                return "bg-green-500/10 text-green-400 border-green-500/30";
            default:
                return "bg-gray-500/10 text-gray-400 border-gray-500/30";
        }
    }

    const updateStatus = async (vehicleId, newStatus) => {
        try {
            await axios.patch(
                `${backendurl}/api/vehicle/status/${vehicleId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
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
                headers: { Authorization: `Bearer ${token}` }
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
                headers: { Authorization: `Bearer ${token}` }
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

    // Reset to page 1 whenever filter or search changes, so you don't land on an empty page
    useEffect(() => {
        setPage(1)
    }, [filter, search])

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

    const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / PAGE_SIZE))
    const currentPage = Math.min(page, totalPages)
    const paginatedVehicles = filteredVehicles.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    )

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0d12] text-gray-400 gap-3 text-sm">
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

            <h1 className='text-2xl md:text-3xl tracking-tight text-white mb-1'>
                Vehicle problems & status
            </h1>
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
                    className='text-sm w-full bg-[#11151c] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/5 transition-all duration-200'
                />
            </div>

            <div className="flex gap-1.5 mb-8 flex-wrap bg-[#11151c] p-1.5 rounded-xl border border-white/5 w-fit">
                <button
                    onClick={() => setFilter("Active")}
                    className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 ${filter === "Active" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${filter === "Active" ? "bg-blue-400" : "bg-gray-600"}`} />
                    Active
                    <span className="text-xs px-1.5 py-0.5 rounded-md bg-white/5 text-gray-400">{activeCount}</span>
                </button>

                <button
                    onClick={() => setFilter("Completed")}
                    className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 ${filter === "Completed" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${filter === "Completed" ? "bg-green-400" : "bg-gray-600"}`} />
                    Completed
                    <span className="text-xs px-1.5 py-0.5 rounded-md bg-white/5 text-gray-400">{completedCount}</span>
                </button>

                <button
                    onClick={() => setFilter("All")}
                    className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 ${filter === "All" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${filter === "All" ? "bg-orange-400" : "bg-gray-600"}`} />
                    All
                    <span className="text-xs px-1.5 py-0.5 rounded-md bg-white/5 text-gray-400">{vehicles.length}</span>
                </button>
            </div>

            {vehicles.length === 0 && (
                <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center">
                    <p className='text-gray-500 text-sm'>
                        No vehicles added yet...
                    </p>
                </div>
            )}

            {vehicles.length > 0 && filteredVehicles.length === 0 && (
                <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center">
                    <p className='text-gray-500 text-sm'>
                        No vehicles match your search/filter.
                    </p>
                </div>
            )}

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentPage + filter + search}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                >
                    {paginatedVehicles.map((item) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => navigate(`/vehicle/${item._id}`)}
                            className='bg-[#11151c] rounded-2xl p-5 border border-white/5 hover:border-white/15 cursor-pointer transition-colors duration-200'
                        >
                            <div className='flex justify-between items-start mb-5'>
                                <div>
                                    <h2 className='text-base text-white leading-tight'>
                                        {item.ownerName}
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1 font-mono tracking-wide">
                                        {item.vehicleNumber}
                                    </p>
                                </div>

                                <img
                                    src="/delete.png"
                                    alt=""
                                    className='w-4 h-4 cursor-pointer opacity-40 hover:opacity-90 transition-all duration-200'
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
                                    <p className="text-gray-600 text-xs tracking-wide mb-1">Phone</p>
                                    <p className="text-gray-300">{item.phone}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-xs tracking-wide mb-1">Vehicle type</p>
                                    <p className="text-gray-300">{item.vehicleType}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-xs tracking-wide mb-1">Issue</p>
                                    <p className="text-gray-400 leading-relaxed">{item.problemDescription}</p>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-white/5 flex justify-end gap-3 items-center">
                                <span className={`px-3 py-1.5 rounded-lg text-xs border ${getStatusStyle(item.status)}`}>
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
                                        className='text-xs px-3 py-1.5 rounded-lg bg-green-600/15 hover:bg-green-600/25 border border-green-600/30 text-green-400 transition-colors duration-200'
                                    >
                                        Mark completed
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>

            {/* Pagination */}
            {filteredVehicles.length > PAGE_SIZE && (
                <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 rounded-lg text-sm bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        ← Prev
                    </button>

                    <div className="flex items-center gap-1.5 px-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) =>
                                p === 1 ||
                                p === totalPages ||
                                Math.abs(p - currentPage) <= 1
                            )
                            .reduce((acc, p, idx, arr) => {
                                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...")
                                acc.push(p)
                                return acc
                            }, [])
                            .map((p, idx) =>
                                p === "..." ? (
                                    <span key={`dots-${idx}`} className="text-gray-600 text-sm px-1">...</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-8 h-8 rounded-lg text-sm transition-colors duration-200 ${p === currentPage
                                                ? "bg-white/10 text-white"
                                                : "text-gray-500 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}
                    </div>

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 rounded-lg text-sm bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        Next →
                    </button>
                </div>
            )}

            {filteredVehicles.length > 0 && (
                <p className="text-center text-gray-600 text-xs mt-4">
                    Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredVehicles.length)} of {filteredVehicles.length}
                </p>
            )}
        </motion.div>
    )
}

export default Vehicles