import axios from "axios"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../src/context/AuthContext"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify"
import jsPDF from "jspdf"
import logo from "../public/msil_logo.png"


const VehicleDetails = () => {

    const [vehicle, setVehicle] = useState(null)
    const [history, setHistory] = useState([])
    const [mechanics, setMechanics] = useState([])
    const [selectedMechanic, setSelectedMechanic] = useState("")
    const [savingCost, setSavingCost] = useState(false)
    const [laborCost, setLaborCost] = useState("")
    const [partsCost, setPartsCost] = useState("")

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

                setLaborCost(response.data.vehicle.laborCost ?? "")
                setPartsCost(response.data.vehicle.partsCost ?? "")

            } catch (error) {
                toast.error("Vehicle not found")
                navigate("/all")
            }
        }

        if (id) fetchVehicle()
    }, [id, backendurl, token, navigate])

    if (!vehicle) return (
        <div className="min-h-screen bg-[#0f1117] text-white flex items-center justify-center">
            <p className="text-gray-400">Loading...</p>
        </div>
    )

    const markCompleted = async () => {
        try {
            const response = await axios.patch(
                `${backendurl}/api/vehicle/status/${vehicle._id}`,
                {
                    status: "Completed"
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            if (response.data.success) {
                setVehicle(response.data.vehicle)
                toast.success("Vehicle markes as completed")
            }

        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    }

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

    const updateCost = async () => {
        try {
            setSavingCost(true)

            const response = await axios.patch(
                `${backendurl}/api/vehicle/cost/${vehicle._id}`,
                {
                    laborCost: Number(laborCost),
                    partsCost: Number(partsCost)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            if (response.data.success) {
                setVehicle(response.data.vehicle)
                setLaborCost(response.data.vehicle.laborCost ?? "")
                setPartsCost(response.data.vehicle.partsCost ?? "")

                toast.success("Cost updated")
            }


        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
        finally {
            setSavingCost(false)
        }
    }

    const generateInvoice = () => {
        const doc = new jsPDF();

        // Logo
        doc.addImage(logo, "PNG", 55, 10, 100, 30);

        // Company
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("MSIL Workshop Services", 105, 50, { align: "center" });

        doc.setFontSize(22);
        doc.text("WORKSHOP INVOICE", 105, 65, { align: "center" });

        // Divider
        doc.line(20, 72, 190, 72);

        // Left margin
        const x = 20;
        let y = 90;

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        doc.text(`Customer: ${vehicle.ownerName}`, x, y);
        y += 10;

        doc.text(`Phone: ${vehicle.phone}`, x, y);
        y += 10;

        doc.text(`Vehicle Number: ${vehicle.vehicleNumber}`, x, y);
        y += 10;

        doc.text(`Vehicle Model: ${vehicle.vehicleModel}`, x, y);
        y += 10;

        doc.text(
            `Mechanic: ${vehicle.assignedTo?.name || "Not Assigned"}`,
            x,
            y
        );
        y += 10;

        doc.text(`Service: ${vehicle.serviceType}`, x, y);
        y += 10;

        doc.text(`Status: ${vehicle.status}`, x, y);
        y += 10;

        doc.text(
            `Date: ${new Date().toLocaleDateString()}`,
            x,
            y
        );
        y += 15;

        // Problem section
        doc.setFont("helvetica", "bold");
        doc.text("Problem Description:", x, y);

        y += 8;

        doc.setFont("helvetica", "normal");

        const problem = doc.splitTextToSize(
            vehicle.problemDescription,
            160
        );

        doc.text(problem, x, y);

        y += problem.length * 7 + 15;

        // Cost section
        doc.setDrawColor(180);
        doc.rect(20, y, 170, 40);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Cost Breakdown", 25, y + 8);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);

        doc.text(
            `Labor Cost: Rs. ${vehicle.labourCost || 0}`,
            25,
            y + 18
        );

        doc.text(
            `Parts Cost: Rs. ${vehicle.partsCost || 0}`,
            25,
            y + 28
        );

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);

        doc.text(
            `Total: Rs. ${vehicle.totalCost || 0}`,
            185,
            y + 28,
            { align: "right" }
        );

        y += 55;

        // Footer
        doc.line(20, y, 190, y);

        doc.setFontSize(13);
        doc.setFont("helvetica", "italic");

        doc.text(
            "Thank you for choosing our workshop!",
            105,
            y + 12,
            { align: "center" }
        );

        doc.save(`${vehicle.vehicleNumber}-invoice.pdf`);
    };


    return (
        <div className="min-h-screen bg-[#0f1117] text-white p-6">
            <button onClick={() => navigate(-1)} className="mt-[-40px] absolute mb-6 text-sm text-gray-400 hover:text-black transition cursor-pointer bg-gray-600 p-2 rounded-full"> ← </button>
            <div className="max-w-5xl mx-auto space-y-6 bg-[#1a1f2b] rounded-2xl p-6 grid md:grid-cols-2 gap-6 mt-5">
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
                                            className="ml-2 bg-[#1a1f2b] border border-gray-700 rounded-lg px-3 py-2 mr-3 text-white focus:outline-none"
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

                    {
                        vehicle.status !== "Pending" && (
                            <div className="bg-[#111522] p-4 rounded-xl">
                                <h2 className="text-lg font-semibold mb-4">
                                    Cost Details
                                </h2>

                                <div className="space-y-3">

                                    <input
                                        type="number"
                                        value={laborCost}
                                        onChange={(e) => setLaborCost(e.target.value)}
                                        placeholder="Labor Cost (₹)"
                                        className="w-full bg-[#111827] border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-orange-500 disabled:opacity-50"
                                        disabled={savingCost || vehicle.status === "Completed"}
                                    />

                                    <input
                                        type="number"
                                        value={partsCost}
                                        onChange={(e) => setPartsCost(e.target.value)}
                                        placeholder="Parts Cost (₹)"
                                        className="w-full bg-[#111827] border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-orange-500 disabled:opacity-50"
                                        disabled={savingCost || vehicle.status === "Completed"}
                                    />

                                    <button
                                        onClick={updateCost}
                                        disabled={savingCost || vehicle.status === "Completed"}
                                        className="bg-orange-600 hover:bg-orange-700 px-5 py-3 rounded-lg disabled:opacity-60"
                                    >
                                        {savingCost ? "Saving..." : "Save"}
                                    </button>
                                </div>

                                <div className="mt-4 text-green-400 space-y-1">
                                    <p>Labor Cost: ₹{vehicle?.laborCost ?? 0}</p>
                                    <p>Parts Cost: ₹{vehicle?.partsCost ?? 0}</p>
                                    <p className="font-semibold text-lg">
                                        Total Cost: ₹{vehicle?.totalCost ?? 0}
                                    </p>
                                </div>
                            </div>
                        )
                    }

                    {
                        vehicle.status === "Completed" && (
                            <button
                                onClick={generateInvoice}
                                className="bg-green-600 cursor-pointer focus:outline-none hover:bg-green-700 px-4 py-3 rounded-lg font-medium"
                            >
                                Download Invoice
                            </button>
                        )
                    }


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

            {
                vehicle.status !== "Completed" && (
                    <button
                        onClick={markCompleted}
                        className="mt-5 bg-green-600 hover:bg-green-700 px-2 py-1 rounded-lg"
                    >
                        Mark Complete
                    </button>
                )
            }


        </div>

    )
}

export default VehicleDetails