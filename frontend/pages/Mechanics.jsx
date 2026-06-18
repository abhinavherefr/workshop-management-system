import { useContext, useEffect, useState } from 'react'
import axios from "axios"
import { AuthContext } from '../src/context/AuthContext'
import { toast } from 'react-toastify'
import { motion } from "framer-motion"

const Mechanics = () => {

    const { token, backendurl } = useContext(AuthContext)

    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [specialization, setSpecialization] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [mechanics, setMechanics] = useState([])
    const [showAddMechanic, setShowAddMechanic] = useState(false)


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
                console.log(response.data)
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
            className="text-gray-200 max-w-7xl mx-auto px-4 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >

            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold">
                        Mechanics Management
                    </h1>

                    <p className="text-gray-400 mt-2">
                        Add, manage and assign workshop mechanics.
                    </p>
                </div>

                {!showAddMechanic && (
                    <button
                        type="button"
                        onClick={() => setShowAddMechanic(true)}
                        className="bg-orange-600 hover:bg-orange-700 px-5 py-2 rounded-lg font-medium transition"
                    >
                        + Add Mechanic
                    </button>
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
                {showAddMechanic && (
                    <motion.div
                        className="bg-[#1a1f2b] p-6 rounded-2xl border border-gray-700/50 h-fit"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}

                    >

                        <div className="flex items-center justify-between mb-6">

                            <h2 className="text-xl font-semibold">
                                Add Mechanic
                            </h2>

                            <button
                                type="button"
                                onClick={() => setShowAddMechanic(false)}
                                className="text-gray-400 hover:text-white text-lg cursor-pointer"
                            >
                                ✕
                            </button>

                        </div>

                        <form
                            onSubmit={submitHandler}
                            className="flex flex-col gap-4"
                        >

                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                type="text"
                                placeholder="Enter full name"
                                className="bg-[#111827] border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-orange-500"
                            />

                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                type="text"
                                placeholder="Enter phone number"
                                className="bg-[#111827] border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-orange-500"
                            />

                            <input
                                value={specialization}
                                onChange={(e) => setSpecialization(e.target.value)}
                                type="text"
                                placeholder="Enter specialization"
                                className="bg-[#111827] border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-orange-500"
                            />

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}

                                disabled={submitting}
                                type="submit"
                                className="mt-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 p-3 rounded-lg font-medium cursor-pointer"
                            >
                                {submitting ? "Adding..." : "Add Mechanic"}
                            </motion.button>

                        </form>

                    </motion.div>
                )}

                {/* Mechanics List */}
                <div className='space-y-6'>

                    <div className="flex items-center justify-between mb-6">

                        <h2 className="text-xl font-semibold">
                            Mechanics ({mechanics.length})
                        </h2>

                    </div>

                    {
                        mechanics.length === 0 ? (
                            <div className="bg-[#1a1f2b] rounded-xl border border-gray-700/50 p-8 text-center">

                                <p className="text-gray-400">
                                    No mechanics added yet
                                </p>

                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">

                                {mechanics.map((mechanic, index) => (
                                    <motion.div
                                        key={mechanic._id}
                                        className="bg-[#1a1f2b] p-5 rounded-xl border border-gray-700/50"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        transition={{ duration: 0.25, delay: index * 0.25 }}
                                    >

                                        <h3 className="font-semibold text-lg">
                                            {mechanic.name}
                                        </h3>

                                        <p className="text-gray-400 text-sm mt-1">
                                            {mechanic.phone}
                                        </p>

                                        <div className="mt-4 flex items-center justify-between">

                                            <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-sm">
                                                {mechanic.specialization}
                                            </span>

                                            <motion.button
                                                whileHover={{ scale: 1.08 }}
                                                whileTap={{ scale: 0.92 }}
                                                onClick={() => handleDelete(mechanic._id)}
                                                className="text-red-400 hover:text-red-500 text-sm font-medium cursor-pointer"
                                            >
                                                Remove
                                            </motion.button>

                                        </div>

                                    </motion.div>
                                ))}

                            </div>
                        )
                    }

                </div>

            </div>

        </motion.div>
    )
}

export default Mechanics