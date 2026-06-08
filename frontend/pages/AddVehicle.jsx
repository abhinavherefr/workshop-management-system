import { useContext, useRef, useState } from 'react'
import axios from "axios"
import { AuthContext } from '../src/context/AuthContext'
import { toast } from 'react-toastify'

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

    const fileInputRef = useRef(null)

    const submitHandler = async (e) => {
        e.preventDefault();

        const formData = new FormData()

        formData.append("ownerName", customerName);
        formData.append("phone", phoneNumber);
        formData.append("vehicleNumber", vehicleNumber);
        formData.append("vehicleType", vehicleType);
        formData.append("problemDescription", problemDesc);
        formData.append("serviceType", serviceType);
        formData.append("odometerReading", odometerReading);
        formData.append("vehicleModel", vehicleModel);

        formData.append("image", image);
        const response = await axios.post(
            `${backendurl}/api/vehicle/create`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        )

        // console.log()

        // const response = await axios.post(`${backendurl}/api/vehicle/create`, {
        //     ownerName: customerName,
        //     phone: phoneNumber,
        //     vehicleNumber,
        //     vehicleType,
        //     problemDescription: problemDesc,
        //     serviceType,
        //     odometerReading,
        //     vehicleModel
        // },
        //     {
        //         headers: {
        //             Authorization: `Bearer ${token}`
        //         }
        //     })

        if (response.data.success) {
            console.log("Vehicle added")

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
                // console.log(response.data)
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
        <form onSubmit={submitHandler} className='min-h-full px-4 py-6 flex flex-col items-center gap-6'>

            <div className="text-gray-300 flex flex-row gap-2 items-center justify-center">
                <h2>Vehicle entry form</h2>
                <div className="h-[2px] bg-white w-10"></div>
            </div>

            <div className="w-full max-w-4xl">
                {/* Card */}
                <div className="bg-[#1a1f2b] p-8 mt-0 rounded-2xl flex flex-col gap-8">
                    <div className="grid md:grid-cols-2 gap-4 text-white text-sm">
                        <div className="md:col-span-2">

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
                                    className='border-gray-700 p-2 focus:outline-none w-full focus:border-orange-600 border'
                                    placeholder='Vehicle Number'
                                />

                                <button
                                    onClick={() => getHistory(vehicleNumber)}
                                    disabled={!(vehicleNumber || "").trim()}
                                    type='button'
                                    className='bg-orange-600 p-2 hover:bg-orange-700 cursor-pointer rounded-lg'
                                >
                                    Search
                                </button>
                            </div>


                            {customerFound && (
                                <p className="text-green-500 text-xs mt-0.5">
                                    Existing customer found. Details auto-filled
                                </p>
                            )}
                        </div>
                        <input value={customerName} readOnly={customerFound} onChange={(e) => { setCustomerName(e.target.value) }} type="text" required className={`border-gray-700 p-2 focus:outline-none w-full focus:border-orange-600 border ${customerFound ? "bg-gray-800 text-gray-400 cursor-not-allowed" : ""}`} placeholder='Customer name' />
                        <input value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value) }} type="text" required className='border-gray-700 p-2 focus:outline-none w-full focus:border-orange-600 border' placeholder='Phone Number' />
                        <select value={vehicleType} disabled={customerFound} onChange={(e) => { setVehicleType(e.target.value) }} className={`cursor-pointer border-gray-700 p-2 focus:outline-none w-full focus:border-orange-600 border text-gray-400'  ${customerFound ? "bg-gray-800 text-gray-400 cursor-not-allowed" : ""}`}>
                            <option className='cursor-pointer' value="Car">Car</option>
                            <option className='cursor-pointer' value="Bike">Motorcycle</option>
                        </select>
                        <input type="text" value={vehicleModel} readOnly={customerFound} onChange={(e) => { setVehicleModel(e.target.value) }} placeholder='Vehicle Model (Swift, Baleno...)' className={`border-gray-700 p-2 focus:outline-none w-full focus:border-orange-600 border ${customerFound ? "bg-gray-800 text-gray-400 cursor-not-allowed" : ""}`}></input>
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
                            className='cursor-pointer bg-gray-800 border border-gray-600 px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700'
                        >
                            Upload Vehicle Image
                        </button>
                        {
                            image && (
                                <p className="text-xs text-green-400 mt-[-15px]">
                                    Selected: {image.name}
                                </p>
                            )
                        }
                        <input type="text" value={odometerReading} onChange={(e) => { setOdometerReading(e.target.value) }} placeholder='Enter odometer reading (km)' className='border-gray-700 p-2 focus:outline-none w-full focus:border-orange-600 border'></input>
                        <select value={serviceType} onChange={(e) => { setServiceType(e.target.value) }} className='cursor-pointer border-gray-700 border p-2 focus:outline-none w-full focus:border-orange-600  text-gray-400'>
                            <option value="Basic">Basic Service</option>
                            <option value="Full">Full Service</option>
                            <option value="Engine">Engine Service</option>
                            <option value="Electrical">Electrical Service</option>
                        </select>
                    </div>
                    <textarea value={problemDesc} onChange={(e) => { setProblemDesc(e.target.value) }} rows={5} required className='text-sm border-gray-700 p-2 focus:outline-none w-full focus:border-orange-600 border mt-[-15px]' placeholder='Problem Description' />
                    <button type='submit' className='bg-orange-600 rounded-2xl text-white cursor-pointer text-lg p-3 focus:outline-none focus:border-white focus:border'>Enter Vehicle</button>
                </div>
            </div>
        </form>
    )
}

export default AddVehicle
