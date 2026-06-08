import { useContext, useState } from 'react'
import { AuthContext } from '../src/context/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const VehicleHistory = () => {

    const [vehicleNumber, setVehicleNumber] = useState('')
    const [vehicles, setVehicles] = useState([])
    const [customerHistory, setCustomerHistory] = useState(null)
    // const [selectedVehicle, setSelectedVehicle] = useState(null)
    const [loading, setLoading] = useState(false)
    const { token, backendurl } = useContext(AuthContext)

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
            console.log(response.data)
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

        <div className=''>
            <div className="flex items-center justify-center mb-10">
                <h2 className='text-3xl font-bold text-gray-400'>
                    Vehicle History
                </h2>
            </div>
            <div className="flex items-center justify-center">

                <div className="flex flex-col items-center w-[90%] md:w-[70%] rounded-xl p-6">
                    <div className="flex items-center gap-4 text-2xl w-full max-w-3xl">
                        <input
                            className='border rounded-xl border-gray-700 focus:outline-none w-full text-sm p-3'
                            type="text"
                            placeholder='Search by vehicle number or owner name'
                            onChange={(e) => { setVehicleNumber(e.target.value) }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    searchVehicles()
                                }
                            }}
                        />
                        <button
                            disabled={loading}
                            onClick={
                                searchVehicles
                            }
                            className='bg-orange-600 cursor-pointer hover:bg-orange-700 px-5 py-3 text-sm rounded-lg font-medium'
                        >
                            {loading ? "Searching..." : "Search"}
                        </button>
                    </div>
                </div>
            </div>

            {
                !loading &&
                vehicles.length === 0 &&
                vehicleNumber && 
                !customerHistory && (
                    <p className="text-center text-gray-500 mt-10">
                        No vehicles found
                    </p>
                )
            }

            {
                customerHistory && (
                    <div className="flex justify-center mt-6">
                        <div className="w-[90%] md:w-[70%]  bg-[#1a1f2b] rounded-xl p-6">
                            <h2 className="text-2xl font-bold mb-2">
                                {customerHistory.customer.ownerName}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                <p className='text-lg'>
                                    <span className="text-gray-400">Phone:</span>
                                    {" "}
                                    {customerHistory.customer.phone}
                                </p>
                                <p className='text-lg'>
                                    <span className="text-gray-400">Vehicle Number:</span>
                                    {" "}
                                    {customerHistory.customer.vehicleNumber}
                                </p>
                                <p className='text-lg'>
                                    <span className="text-gray-400">Vehicle Model:</span>
                                    {" "}
                                    {customerHistory.customer.vehicleModel}
                                </p>
                                <p className='text-lg'>
                                    <span className="text-gray-400">Total Visits: </span>
                                    {customerHistory.customer.totalVisits}
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                vehicles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 w-[90%] md:w-[70%] mx-auto">
                        {vehicles.map((item) => (
                            <div
                                className="cursor-pointer bg-[#1a1f2b] p-5 rounded-xl hover:scale-[1.02] transition"
                                key={item.vehicleNumber}
                                onClick={() => getVehicleHistory(item.vehicleNumber)}
                            >
                                <h2 className='text-lg font-semibold'>
                                    {item.ownerName}
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    {item.vehicleNumber}
                                </p>
                                <p className="text-sm mt-2">
                                    {item.phone}
                                </p>
                                <p className="text-blue-400 text-sm mt-2">
                                    {item.totalVisits} visits
                                </p>
                                <p className="text-xs text-gray-500 mt-3">
                                    Click to view history
                                </p>
                            </div>
                        ))}
                    </div>
                )
            }

            {
                customerHistory && (
                    <div className="w-[90%] md:w-[70%] mx-auto mt-6 flex flex-col gap-4">
                        <h2 className='text-xl font-semibold'>Service History</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {customerHistory.history.map((visit, index) => (
                                <div className="bg-[#1a1f2b] p-4 rounded-xl" key={visit._id}>
                                    <div className="flex flex-col gap-2 mb-3">
                                        <p className='text-sm text-gray-400'>Visit #{customerHistory.history.length - index}</p>
                                        <h3 className="font-semibold text-lg">
                                            {visit.serviceType} Service
                                        </h3>
                                        <span className={visit.status === "Completed" ? "bg-green-900 text-green-500 px-2 py-1 rounded-md text-sm w-fit" : visit.status === "Pending" ? "text-yellow-500 bg-yellow-900 w-fit px-2 py-1 rounded-md text-sm" : "text-blue-500 bg-blue-900 w-fit px-2 py-1 rounded-md text-sm"}>
                                            {visit.status}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <p>
                                            <span className="text-gray-400">
                                                Date: {" "}
                                            </span>
                                            {new Date(visit.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="">
                                            <span className="text-gray-400">
                                                Odometer: {" "}
                                            </span>
                                            {visit.odometerReading} km
                                        </p>
                                        <p className="">
                                            <span className="text-gray-400">
                                                Problem: {" "}
                                            </span>
                                            {visit.problemDescription || "No description provided"}
                                        </p>
                                        <p className="">
                                            <span className="text-gray-400">
                                                Slot: {" "}
                                            </span>
                                            {visit.slotNumber ?? "Not Assigned"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

        </div>
    )
}

export default VehicleHistory