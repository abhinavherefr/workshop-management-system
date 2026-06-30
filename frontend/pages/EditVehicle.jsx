import { useContext, useRef, useState } from 'react'
import axios from "axios"
import { AuthContext } from '../src/context/AuthContext'
import { toast } from 'react-toastify'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'

const inputClass = "bg-[#0a0d12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200 w-full"
const labelClass = "text-xs text-gray-500 uppercase tracking-wider mb-1.5 block"
const lockedClass = "bg-[#0a0d12]/40 text-gray-500 cursor-not-allowed border-white/5"

const EditVehicle = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const { token, backendurl } = useContext(AuthContext)
    const [customerName, setCustomerName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [vehicleType, setVehicleType] = useState('Car')
    const [problemDesc, setProblemDesc] = useState('')
    const [serviceType, setServiceType] = useState('Basic')
    const [odometerReading, setOdometerReading] = useState("")
    const [vehicleModel, setVehicleModel] = useState('')
    const [submitting, setsubmitting] = useState(false)
    const [image, setImage] = useState(null)
    const [vehicleNumber, setVehicleNumber] = useState("")
    const [loading, setLoading] = useState(true)

    const fileInputRef = useRef(null)

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                setLoading(true)
                const response = await axios.get(`${backendurl}/api/vehicle/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                const v = response.data.vehicle

                setCustomerName(v.ownerName)
                setPhoneNumber(v.phone)
                setVehicleNumber(v.vehicleNumber)
                setVehicleType(v.vehicleType)
                setProblemDesc(v.problemDescription)
                setServiceType(v.serviceType)
                setOdometerReading(v.odometerReading)
                setVehicleModel(v.vehicleModel)

            } catch (error) {
                toast.error("Vehicle not found")
                navigate("/all")
            } finally {
                setLoading(false)
            }
        }

        fetchVehicle();

    }, [id, backendurl, token, navigate])

    const submitHandler = async (e) => {
        e.preventDefault();

        try {
            setsubmitting(true)

            const formData = new FormData()

            formData.append("ownerName", customerName);
            formData.append("phone", phoneNumber);
            formData.append("vehicleNumber", vehicleNumber);
            formData.append("vehicleType", vehicleType);
            formData.append("problemDescription", problemDesc);
            formData.append("serviceType", serviceType);
            formData.append("odometerReading", odometerReading);
            formData.append("vehicleModel", vehicleModel);

            if (image) {
                formData.append("image", image);
            }

            const response = await axios.put(
                `${backendurl}/api/vehicle/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            )

            if (response.data.success) {
                toast.success("Vehicle updated successfully.")
                navigate(`/vehicle/${id}`)
            }
            else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update vehicle")
        } finally {
            setsubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0d12] flex items-center justify-center gap-3 text-gray-400">
                <div className="w-5 h-5 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                Loading vehicle...
            </div>
        )
    }

    return (
        <form onSubmit={submitHandler} className='min-h-full px-4 py-6 sm:py-10 flex flex-col items-center gap-6 bg-[#0a0d12]'>

            <div className="w-full max-w-4xl flex items-center gap-4">
                <button
                    type='button'
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0"
                >
                    ←
                </button>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                        Edit Vehicle
                    </h1>
                    <div className="bg-gradient-to-r from-blue-500 to-transparent h-[2px] w-12 hidden sm:block"></div>
                </div>
            </div>

            <div className="w-full max-w-4xl">
                <div className="bg-[#11151c] border border-white/5 p-6 sm:p-8 rounded-2xl flex flex-col gap-8">

                    {/* Vehicle number - locked */}
                    <div>
                        <label className={labelClass}>Vehicle Number</label>
                        <input
                            type="text"
                            value={vehicleNumber}
                            readOnly
                            className={`${inputClass} ${lockedClass} font-mono tracking-wider`}
                        />
                        <p className="text-xs text-gray-600 mt-1.5">Vehicle number can't be changed after creation</p>
                    </div>

                    <div className="h-px bg-white/5"></div>

                    {/* Customer + vehicle details */}
                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClass}>Customer Name</label>
                            <input
                                value={customerName}
                                onChange={(e) => { setCustomerName(e.target.value) }}
                                type="text"
                                required
                                className={inputClass}
                                placeholder='Full name'
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Phone Number</label>
                            <input
                                value={phoneNumber}
                                onChange={(e) => { setPhoneNumber(e.target.value) }}
                                type="text"
                                required
                                className={inputClass}
                                placeholder='10-digit number'
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Vehicle Type</label>
                            <select
                                value={vehicleType}
                                onChange={(e) => { setVehicleType(e.target.value) }}
                                className={`${inputClass} cursor-pointer`}
                            >
                                <option value="Car">Car</option>
                                <option value="Bike">Motorcycle</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Vehicle Model</label>
                            <input
                                type="text"
                                value={vehicleModel}
                                onChange={(e) => { setVehicleModel(e.target.value) }}
                                placeholder='Swift, Baleno...'
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Odometer Reading</label>
                            <input
                                type="text"
                                value={odometerReading}
                                onChange={(e) => { setOdometerReading(e.target.value) }}
                                placeholder='in km'
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Service Type</label>
                            <select
                                value={serviceType}
                                onChange={(e) => { setServiceType(e.target.value) }}
                                className={`${inputClass} cursor-pointer`}
                            >
                                <option value="Basic">Basic Service</option>
                                <option value="Full">Full Service</option>
                                <option value="Engine">Engine Service</option>
                                <option value="Electrical">Electrical Service</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Vehicle Image</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept='image/*'
                            onChange={(e) => setImage(e.target.files[0])}
                            className='hidden'
                        />
                        <button
                            type='button'
                            onClick={() => fileInputRef.current.click()}
                            className='cursor-pointer bg-[#0a0d12] border border-white/10 hover:border-white/20 px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/5 transition-all duration-200 w-full sm:w-auto'
                        >
                            📷 Replace Vehicle Image
                        </button>
                        {image && (
                            <p className="text-xs text-green-400 mt-2">
                                Selected: {image.name}
                            </p>
                        )}
                    </div>

                    <div className="h-px bg-white/5"></div>

                    <div>
                        <label className={labelClass}>Problem Description</label>
                        <textarea
                            value={problemDesc}
                            onChange={(e) => { setProblemDesc(e.target.value) }}
                            rows={5}
                            required
                            className={`${inputClass} resize-none`}
                            placeholder='Describe the issue in detail...'
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type='button'
                            onClick={() => navigate(-1)}
                            className='flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 text-sm font-medium p-3.5 transition-all duration-200'
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            disabled={submitting}
                            className='flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-sm font-medium p-3.5 transition-colors duration-200 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2'
                        >
                            {submitting && (
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                            )}
                            {submitting ? "Saving..." : "Update Vehicle"}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default EditVehicle