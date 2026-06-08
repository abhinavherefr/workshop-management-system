import { useContext, useEffect, useState } from 'react'
import axios from "axios"
import { AuthContext } from '../src/context/AuthContext'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import SlotBoard from '../components/SlotBoard';


const Vehicles = () => {
    
    const { backendurl, token, setToken } = useContext(AuthContext);
    
    const [vehicles, setVehicles] = useState([])
    const [search, setSearch] = useState("")
    const navigate = useNavigate();
    
    const getStatusStyle = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-500/20 text-yellow-400 border-yellow-500";
            case "In Progress":
                return "bg-blue-500/20 text-blue-400 border-blue-500";
            case "Completed":
                return "bg-green-500/20 text-green-400 border-green-500";
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-500";
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
    
            fetchVehicles();

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
            console.log(error.message)
        }

    }

    const fetchVehicles = async () => {
        try {
            const response = await axios.get(`${backendurl}/api/vehicle/all`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (response.data.success) {
                setVehicles(response.data.vehicles)
                console.log(response.data.vehicles)
            }
            else {
                console.log(response.data.message)
            }
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem("token")
                setToken(null)
                navigate("/login")
                return;
            }
            console.log(error.message)
        }
    }

    useEffect(() => {
        fetchVehicles()
    }, [backendurl, token])



    return (
        <div className='min-h-screen p-6'>
            <SlotBoard vehicles={vehicles} />
            <div className="mb-6">
                <input type="text"
                    placeholder='Search vehicle number / owner / phone...'
                    value={search}
                    onChange={(e) => { setSearch(e.target.value) }}
                    className='text-lg w-full md:w-[100%] bg-[#1a1f2b] border border-[#2a3142] rounded-xl px-2 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition'
                />
            </div>

            <h1 className='text-3xl md:text-4xl font-bold text-white mb-8'>
                Vehicle Problems & Status
            </h1>

            {
                vehicles.length === 0 && (
                    <h1 className='text-white text-xl font-light'>
                        No vehicles added yet...
                    </h1>)
            }

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>

                {vehicles.filter((item) => {
                    const q = search.toLowerCase()

                    return (
                        item.ownerName.toLowerCase().includes(q) ||
                        item.vehicleNumber.toLowerCase().includes(q) ||
                        item.phone.toString().includes(q)
                    )
                })
                    .map((item) => (
                        <div
                            key={item._id}
                            className='bg-[#1a1f2b] rounded-2xl p-5 shadow-lg hover:bg-[#232a3a] hover:scale-[1.02] hover:shadow-2xl transition duration-400 border border-transparent hover:border-[#2a3142]'
                        >
                            <div className='flex justify-between items-start mb-5'>
                                <div className="">
                                    <h2 className='text-lg font-semibold text-white'>
                                        {item.ownerName}
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {item.vehicleNumber}
                                    </p>
                                </div>

                                <img
                                    src="/delete.png" className='w-5 h-5 cursor-pointer opacity-70 hover:opacity-100 hover:scale-110 transition' alt=""
                                    onClick={() => deleteVehicle(item._id, item.status)}
                                />

                            </div>

                            {item.vehicleImage && (
                                <img src={item.vehicleImage}
                                alt={item.vehicleNumber}
                                className='w-full h-48 object-cover rounded-xl mb-4' />
                            )}

                            <div className='space-y-2 text-sm'>
                                <div className="">
                                    <p className="text-gray-500 mb-1">Phone</p>
                                    <p className="text-gray-200">{item.phone}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500 mb-1">Vehicle Type</p>
                                    <p className="text-gray-200">{item.vehicleType}</p>
                                </div>

                                <div className="">
                                    <p className="text-gray-500 mb-1">Issue</p>
                                    <p className="text-gray-200 leading-relaxed">
                                        {item.problemDescription}
                                    </p>
                                </div>

                            </div>

                            <div className="mt-5 flex justify-end gap-4">
                                <span className={`px-3 py-2 rounded-xl text-sm border ${getStatusStyle(item.status)}`}>
                                    {item.status}
                                </span>

                                {item.status === "In Progress" && (
                                    <button
                                    onClick={() => { updateStatus(item._id, "Completed") }}
                                    className='text-sm px-3 py-1 rounded-xl bg-green-600 hover:bg-green-700 text-white transition'>
                                        Mark Completed
                                    </button>
                                )}

                            </div>

                        </div>
                    ))}
            </div>
        </div>
    )
}

export default Vehicles