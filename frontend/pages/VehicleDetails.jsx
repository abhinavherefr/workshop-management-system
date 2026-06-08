import axios from "axios"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../src/context/AuthContext"
import { useParams } from "react-router"


const VehicleDetails = () => {

    const [vehicle, setVehicle] = useState(null)
    const [history, setHistory] = useState([])
    const { backendurl, token } = useContext(AuthContext)
    const { id } = useParams();
    const prevHistory = history.slice(1)

    useEffect(() => {
        const fetchVehicle = async () => {
            const response = await axios.get(`${backendurl}/api/vehicle/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setVehicle(response.data.vehicle)
            setHistory(response.data.history)
            console.log(response.data);
        }
        fetchVehicle(id)
    }, [])

    return (
        <div className="min-h-screen bg-[#0f1117] text-white p-6">
            <div className="max-w-5xl mx-auto space-y-6 bg-[#1a1f2b] rounded-2xl p-6 grid md:grid-cols-2 gap-6">
                <div className="space-y-5">
                    <div className="">
                        <h1 className="text-2xl font-bold tracking-wide">
                            {vehicle?.ownerName}
                        </h1>
                        <p className="text-gray-400">{vehicle?.vehicleNumber}</p>
                    </div>

                    <div className="bg-[#111522] p-4 rounded-xl text-sm space-y-2">
                        <p><span className="text-gray-500">Phone: </span>{vehicle?.phone}</p>
                        <p><span className="text-gray-500">Model: </span>{vehicle?.vehicleModel}</p>
                        <p><span className="text-gray-500">Type: </span>{vehicle?.vehicleType}</p>
                        <p><span className="text-gray-500">Services: </span>{vehicle?.serviceType} service</p>
                        <p><span className="text-gray-500">Status: </span>{vehicle?.status}</p>
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