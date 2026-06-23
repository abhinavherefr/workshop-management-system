import { useContext, useEffect, useState } from 'react'
import axios from "axios"
import { AuthContext } from '../src/context/AuthContext'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from "framer-motion"

const Mechanics = () => {

    const { token, backendurl } = useContext(AuthContext)

    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [specialization, setSpecialization] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [mechanics, setMechanics] = useState([])
    const [showAddMechanic, setShowAddMechanic] = useState(false)
    const [loading, setLoading] = useState(true)

    const submitHandler = async (e) => {
        setSubmitting(true)
        e.preventDefault();

        try {
            const response = await axios.post(`${backendurl}/api/mechanic/add`, {
                name, phone, specialization
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (response.data.success) {
                toast.success("Mechanic Created Successfully")
                setName('')
                setPhone('')
                setSpecialization('')
                fetchMechanics()
            }

        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }

        finally {
            setSubmitting(false)
        }
    }

    const fetchMechanics = async () => {
        try {
            setLoading(true)
            const response = await axios.get(
                `${backendurl}/api/mechanic/all`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            if (response.data.success) {
                setMechanics(response.data.mechanics)
            }

        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(
                `${backendurl}/api/mechanic/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            if (response.data.success) {
                toast.success(response.data.message)
                fetchMechanics()
            }
            else {
                toast.error(response.data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchMechanics()
    }, [token])

    return (
        <motion.div
            className="text-gray-200 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 min-h-screen bg-[#0a0d12]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >

            {/* Header */}
            <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            Mechanics Management
                        </h1>
                        <div className="bg-gradient-to-r from-orange-500 to-transparent h-[2px] w-12 hidden sm:block"></div>
                    </div>
                    <p className="text-gray-500 mt-1.5 text-sm">
                        Add, manage and assign workshop mechanics.
                    </p>
                </div>

                {!showAddMechanic && (
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() => setShowAddMechanic(true)}
                        className="bg-orange-600 hover:bg-orange-700 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors duration-200 shadow-lg shadow-orange-600/20 flex items-center gap-2"
                    >
                        <span className="text-lg leading-none">+</span> Add Mechanic
                    </motion.button>
                )}
            </div>

            {/* Content */}
            <div
                className={`grid gap-8 ${showAddMechanic
                    ? "lg:grid-cols-[380px_1fr]"
                    : "grid-cols-1"
                    }`}
            >

                {/* Add Mechanic Form */}
                <AnimatePresence>
                    {showAddMechanic && (
                        <motion.div
                            className="bg-[#11151c] p-6 rounded-2xl border border-white/5 h-fit"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                        >

                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">
                                    Add Mechanic
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => setShowAddMechanic(false)}
                                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm cursor-pointer transition-all duration-200 flex items-center justify-center"
                                >
                                    ✕
                                </button>
                            </div>

                            <form
                                onSubmit={submitHandler}
                                className="flex flex-col gap-4"
                            >
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        type="text"
                                        required
                                        placeholder="Enter full name"
                                        className="w-full bg-[#0a0d12] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10 transition-all duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Phone Number</label>
                                    <input
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        type="text"
                                        required
                                        placeholder="Enter phone number"
                                        className="w-full bg-[#0a0d12] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10 transition-all duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Specialization</label>
                                    <input
                                        value={specialization}
                                        onChange={(e) => setSpecialization(e.target.value)}
                                        type="text"
                                        required
                                        placeholder="e.g. Engine, Electrical"
                                        className="w-full bg-[#0a0d12] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10 transition-all duration-200"
                                    />
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={submitting}
                                    type="submit"
                                    className="mt-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-xl font-medium text-sm cursor-pointer transition-colors duration-200 shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
                                >
                                    {submitting && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>}
                                    {submitting ? "Adding..." : "Add Mechanic"}
                                </motion.button>
                            </form>

                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mechanics List */}
                <div className='space-y-6'>

                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        Mechanics
                        <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">
                            {mechanics.length}
                        </span>
                    </h2>

                    {loading ? (
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-[#11151c] border border-white/5 rounded-xl p-5 h-[110px] animate-pulse" />
                            ))}
                        </div>
                    ) : mechanics.length === 0 ? (
                        <div className="bg-[#11151c] rounded-2xl border border-dashed border-white/10 p-10 text-center">
                            <p className="text-gray-500 text-sm">
                                No mechanics added yet
                            </p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {mechanics.map((mechanic, index) => (
                                <motion.div
                                    key={mechanic._id}
                                    className="bg-[#11151c] p-5 rounded-xl border border-white/5 hover:border-white/15 transition-colors duration-200"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -4 }}
                                    transition={{ duration: 0.25, delay: Math.min(index * 0.06, 0.3) }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-semibold text-sm shrink-0">
                                            {mechanic.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base leading-tight">
                                                {mechanic.name}
                                            </h3>
                                            <p className="text-gray-500 text-sm mt-0.5">
                                                {mechanic.phone}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                        <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-md text-xs font-medium">
                                            {mechanic.specialization}
                                        </span>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleDelete(mechanic._id)}
                                            className="text-red-400/80 hover:text-red-400 text-xs font-medium cursor-pointer transition-colors duration-200"
                                        >
                                            Remove
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                </div>

            </div>

        </motion.div>
    )
}

export default Mechanics