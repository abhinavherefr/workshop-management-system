import axios from "axios"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../src/context/AuthContext"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify"


const VehicleDetails = () => {

    const [vehicle, setVehicle] = useState(null)
    const [history, setHistory] = useState([])
    const [mechanics, setMechanics] = useState([])
    const [selectedMechanic, setSelectedMechanic] = useState("")

    const { backendurl, token } = useContext(AuthContext)
    const { id } = useParams();


    const prevHistory = history.slice(1)
    const navigate = useNavigate()


    const fetchMechanics = async () => {
        try {
            const response = await axios.get(`${backendurl}/api/mechanic/all`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.data.success) {
                setMechanics(response.data.mechanics)
                console.log('mechanics:', response.data.mechanics)
            }


        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchMechanics()
    }, [backendurl, token])

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const response = await axios.get(`${backendurl}/api/vehicle/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                setVehicle(response.data.vehicle)
                setHistory(response.data.history)
            } catch (error) {
                toast.error("Vehicle not found")
                navigate("/all")
            }
        }

        if (id) fetchVehicle()
    }, [id, backendurl, token, navigate])

    if (!vehicle) return (
        <div className="min-h-screen bg-[#0f1117] text-white items-center justify-center">
            <p className="text-gray-400">Loading...</p>
        </div>
    )

    const assignMechanic = async () => {
        if (!selectedMechanic) {
            return toast.error("Please select a mechanic")
        }

        try {
            const response = await axios.put(
                `${backendurl}/api/vehicle/${id}/assign-mechanic`,
                {
                    mechanicId: selectedMechanic
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            if (response.data.success) {
                setVehicle(response.data.vehicle)
                toast.success("Mechanic assigned successfully")
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || error.message
            )
        }

    }


    return (
        <div className="min-h-screen bg-[#0f1117] text-white p-6">
            <button onClick={() => navigate(-1)} className=" mb-4 text-sm text-gray-400 hover:text-white transition cursor-pointer"> ← Back </button>
            <div className="max-w-5xl mx-auto space-y-6 bg-[#1a1f2b] rounded-2xl p-6 grid md:grid-cols-2 gap-6">
                <div className="space-y-5">
                    <div className="">
                        <h1 className="text-2xl font-bold tracking-wide">
                            {vehicle?.ownerName}
                        </h1>
                        <p className="text-gray-400">{vehicle?.vehicleNumber}</p>
                    </div>

                    <div className="bg-[#111522] p-4 rounded-xl text-sm space-y-3">
                        <p><span className="text-gray-500">Phone: </span>{vehicle?.phone}</p>
                        <p><span className="text-gray-500">Model: </span>{vehicle?.vehicleModel}</p>
                        <p><span className="text-gray-500">Type: </span>{vehicle?.vehicleType}</p>
                        <p className="">
                            <span className="text-gray-500">Created:</span>{" "}
                            {new Date(vehicle?.createdAt).toLocaleDateString()}
                        </p>
                        <p className="">
                            <span className="text-gray-500">Odometer:</span>{" "}
                            {vehicle?.odometerReading} km
                        </p>
                        <div className="mb-3">
                            {
                                !vehicle?.assignedTo && vehicle.status === "In Progress" ? (
                                    <div className="">
                                        <span className="text-gray-500">Assigned Mechanic:</span>{" "}

                                        <select
                                            value={selectedMechanic}
                                            name="" id=""
                                            onChange={(e) => setSelectedMechanic(e.target.value)}
                                            className="ml-2 bg-[#1a1f2b] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                                        >
                                            <option value="">Select Mechanic</option>

                                            {
                                                mechanics.map((mechanic) => (
                                                    <option key={mechanic._id} value={mechanic._id}>
                                                        {mechanic.name}
                                                    </option>
                                                ))
                                            }

                                        </select>

                                        <button
                                            onClick={assignMechanic}
                                            className="cursor-pointer mt-3 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-sm"
                                        >
                                            Assign Mechanic
                                        </button>
                                    </div>
                                ) : (
                                    <div className="">
                                        <span className="text-gray-500">Mechanic Assigned:</span> {vehicle?.assignedTo?.name || "Yet to assign"}
                                    </div>
                                )
                            }





                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${vehicle?.status === "Pending" ? "bg-red-500/20 text-red-400"
                                : vehicle?.status === "In Progress" ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-green-500/20 text-green-400"
                                }`}>
                                {vehicle?.status}
                            </span>
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs">Services: {vehicle?.serviceType} service </span>
                        </div>
                    </div>


                    <div className="bg-[#111522] p-4 rounded-xl">
                        <p className="text-gray-400 text-sm mb-1">Problem:</p>
                        <p className="text-gray-200">{vehicle?.problemDescription}</p>
                    </div>
                </div>


                <div className="flex justify-center items-center">
                    {vehicle?.vehicleImage ? (
                        <img
                            src={vehicle?.vehicleImage}
                            className="w-full max-w-md h-72 object-cover rounded-xl border border-gray-700"
                            alt="" />
                    ) : (
                        <div className="w-full h-72 flex items-center justify-center text-gray-500 border border-gray-700 rounded-xl">
                            No image
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto mt-10">
                <h2 className="text-xl font-semibold mb-4">
                    Previous Visits ({prevHistory.length})
                </h2>

                {
                    prevHistory.length === 0 ? (
                        <p className="text-gray-400">First visit for this vehicle</p>
                    ) : (
                        <div className="space-y-3">
                            {
                                prevHistory.map((item) => (
                                    <div
                                        className="bg-[#1a1f2b] p-4 rounded-xl border border-gray-800 hover:border-gray-600 transition"
                                        key={item._id}
                                    >
                                        <div className="flex justify-between">
                                            <p className="text-gray-200">{item.problemDescription}</p>
                                            <span className="text-gray-500 text-xs">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </span>

                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )
                }

            </div>


        </div>

    )
}

export default VehicleDetails