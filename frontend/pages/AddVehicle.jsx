import { useContext, useRef, useState } from 'react'
import axios from "axios"
import { AuthContext } from '../src/context/AuthContext'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import imageCompression from "browser-image-compression";

const inputClass = "bg-[#0a0d12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10 transition-all duration-200 w-full"
const labelClass = "text-xs text-gray-500 uppercase tracking-wider mb-1.5 block"
const disabledClass = "bg-[#0a0d12]/40 text-gray-500 cursor-not-allowed border-white/5"

const AddVehicle = () => {

    const { token, backendurl } = useContext(AuthContext)

    const [customerName, setCustomerName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [vehicleNumber, setvehicleNumber] = useState('')
    const [vehicleType, setVehicleType] = useState('Car')
    const [problemDesc, setProblemDesc] = useState('')
    const [serviceType, setServiceType] = useState('Basic')
    const [odometerReading, setOdometerReading] = useState("")
    const [vehicleModel, setVehicleModel] = useState('')
    const [customerFound, setCustomerFound] = useState(false)
    const [image, setImage] = useState(null)
    const [submitting, setsubmitting] = useState(false)

    const fileInputRef = useRef(null)

    const navigate = useNavigate()

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

            const response = await axios.post(
                `${backendurl}/api/vehicle/create`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            )

            if (response.data.success) {
                setCustomerName('')
                setPhoneNumber('')
                setvehicleNumber('')
                setVehicleType('Car')
                setProblemDesc('')
                setServiceType('Basic')
                setOdometerReading('')
                setVehicleModel('')
                toast.success("Entry created successfully.")
                setCustomerFound(false)
                setImage(null)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                }
            }
            else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add vehicle")
        } finally {
            setsubmitting(false)
        }
    }

    const getHistory = async (vehicleNumber) => {
        try {
            const response = await axios.get(`${backendurl}/api/vehicle/history?query=${vehicleNumber.toUpperCase()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            if (response.data.success) {
                setCustomerFound(true)
                setCustomerName(response.data.customer.ownerName)
                setPhoneNumber(response.data.customer.phone)
                setVehicleModel(response.data.customer.vehicleModel)
                setVehicleType(response.data.history[0].vehicleType)
                toast.success("Existing customer found")
            }
            else {
                setCustomerFound(false)
                toast.info("New customer")
                setCustomerName("")
                setPhoneNumber("")
                setVehicleModel("")
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <motion.form
            onSubmit={submitHandler}
            className='relative min-h-full px-4 py-6 sm:py-10 flex flex-col items-center gap-6 bg-[#0a0d12]'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div className="w-full max-w-4xl grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3 sm:flex sm:gap-4">
                <button type='button' onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0"> ← </button>
                <div className="flex items-center gap-3 justify-center sm:flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                        Vehicle Entry Form
                    </h1>
                    <div className="bg-gradient-to-r from-orange-500 to-transparent h-[2px] w-12 hidden sm:block"></div>
                </div>
                <div className="sm:hidden"></div>
            </div>

            <div className="w-full max-w-4xl">
                <div className="bg-[#11151c] border border-white/5 p-6 sm:p-8 rounded-2xl flex flex-col gap-8">

                    {/* Vehicle lookup */}
                    <div>
                        <label className={labelClass}>Vehicle Number</label>
                        <div className="flex gap-3">
                            <input
                                value={vehicleNumber}
                                onChange={(e) => { setvehicleNumber(e.target.value.toUpperCase().replace(/\s/g, "")) }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        getHistory(vehicleNumber)
                                    }
                                }}
                                type="text"
                                required
                                className={`${inputClass} font-mono tracking-wider`}
                                placeholder='e.g. RJ14AB1234'
                            />

                            <motion.button
                                onClick={() => getHistory(vehicleNumber)}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                disabled={!(vehicleNumber || "").trim()}
                                type='button'
                                className='bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-5 rounded-xl cursor-pointer transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0'
                            >
                                Search
                            </motion.button>
                        </div>

                        {customerFound && (
                            <p className="text-green-400 text-xs mt-2 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]"></span>
                                Existing customer found — details auto-filled
                            </p>
                        )}
                    </div>

                    <div className="h-px bg-white/5"></div>

                    {/* Customer + vehicle details */}
                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClass}>Customer Name</label>
                            <input
                                value={customerName}
                                readOnly={customerFound}
                                onChange={(e) => { setCustomerName(e.target.value) }}
                                type="text"
                                required
                                className={`${inputClass} ${customerFound ? disabledClass : ""}`}
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
                                disabled={customerFound}
                                onChange={(e) => { setVehicleType(e.target.value) }}
                                className={`${inputClass} cursor-pointer ${customerFound ? disabledClass : ""}`}
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
                                readOnly={customerFound}
                                onChange={(e) => { setVehicleModel(e.target.value) }}
                                placeholder='Swift, Baleno...'
                                className={`${inputClass} ${customerFound ? disabledClass : ""}`}
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
                            📷 Upload Vehicle Image
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

                    <motion.button
                        type='submit'
                        disabled={submitting}
                        className='bg-orange-600 hover:bg-orange-700 rounded-xl text-white cursor-pointer text-base font-medium p-3.5 transition-colors duration-200 shadow-lg shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {submitting && (
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                        )}
                        {submitting ? "Submitting..." : "Enter Vehicle"}
                    </motion.button>
                </div>
            </div>
        </motion.form>
    )
}

export default AddVehicle