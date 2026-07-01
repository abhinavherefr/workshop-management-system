import axios from "axios"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../src/context/AuthContext"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify"
import jsPDF from "jspdf"
import logo from "../public/msil_logo.png"

const statusBadge = (status) => {
    switch (status) {
        case "Pending":
            return "bg-red-500/10 text-red-400 border-red-500/30"
        case "In Progress":
            return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
        default:
            return "bg-green-500/10 text-green-400 border-green-500/30"
    }
}

const VehicleDetails = () => {

    const [vehicle, setVehicle] = useState(null)
    const [history, setHistory] = useState([])
    const [mechanics, setMechanics] = useState([])
    const [selectedMechanic, setSelectedMechanic] = useState("")
    const [savingCost, setSavingCost] = useState(false)
    const [laborCost, setLaborCost] = useState("")
    const [partsCost, setPartsCost] = useState("")

    const { backendurl, token, role } = useContext(AuthContext)
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
        <div className="min-h-screen bg-[#0a0d12] text-white flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-400">Loading...</p>
        </div>
    )

    const markCompleted = async () => {

        if (!vehicle.assignedTo) {
            return toast.error("Assign a mechanic before completing the job")
        }

        try {
            const response = await axios.patch(
                `${backendurl}/api/vehicle/status/${vehicle._id}`,
                { status: "Completed" },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            if (response.data.success) {
                setVehicle(response.data.vehicle)
                toast.success("Vehicle marked as completed")
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
                { mechanicId: selectedMechanic },
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
        const pageWidth = doc.internal.pageSize.getWidth();

        const primary = [234, 88, 12];
        const dark = [26, 31, 43];
        const gray = [110, 110, 110];
        const lightGray = [245, 246, 248];
        const borderGray = [220, 220, 220];

        doc.setFillColor(...dark);
        doc.rect(0, 0, pageWidth, 38, "F");

        const logoProps = doc.getImageProperties(logo);
        const logoMaxH = 16;
        const logoMaxW = 38;
        let logoW = (logoProps.width / logoProps.height) * logoMaxH;
        let logoH = logoMaxH;
        if (logoW > logoMaxW) {
            logoW = logoMaxW;
            logoH = (logoProps.height / logoProps.width) * logoMaxW;
        }
        const logoY = 19 - logoH / 2;
        doc.addImage(logo, "PNG", 15, logoY, logoW, logoH);

        const textStartX = 15 + logoW + 8;

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("MSIL Workshop Services", textStartX, 18);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(220, 220, 220);
        doc.text("Vehicle Service & Repair Invoice", textStartX, 25);

        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text(`INVOICE #INV-${vehicle._id.slice(-6).toUpperCase()}`, pageWidth - 15, 16, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(220, 220, 220);
        doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, pageWidth - 15, 23, { align: "right" });

        const statusColor =
            vehicle.status === "Completed" ? [22, 163, 74] :
                vehicle.status === "Pending" ? [202, 138, 4] :
                    [37, 99, 235];

        doc.setFillColor(...statusColor);
        doc.roundedRect(pageWidth - 55, 28, 40, 7, 1.5, 1.5, "F");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text(vehicle.status.toUpperCase(), pageWidth - 35, 33, { align: "center" });

        let y = 52;
        const leftX = 15;
        const rightX = pageWidth / 2 + 5;

        doc.setTextColor(...primary);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("CUSTOMER & VEHICLE DETAILS", leftX, y);
        doc.setDrawColor(...primary);
        doc.setLineWidth(0.6);
        doc.line(leftX, y + 2, leftX + 65, y + 2);
        y += 10;

        const infoRow = (label, value, x, rowY) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(...gray);
            doc.text(label, x, rowY);

            doc.setFont("helvetica", "normal");
            doc.setTextColor(20, 20, 20);
            doc.text(String(value || "—"), x, rowY + 5.5);
        };

        infoRow("CUSTOMER NAME", vehicle.ownerName, leftX, y);
        infoRow("PHONE", vehicle.phone, rightX, y);
        y += 16;

        infoRow("VEHICLE NUMBER", vehicle.vehicleNumber, leftX, y);
        infoRow("VEHICLE MODEL", vehicle.vehicleModel, rightX, y);
        y += 16;

        infoRow("SERVICE TYPE", vehicle.serviceType, leftX, y);
        infoRow("MECHANIC", vehicle.assignedTo?.name || "Not Assigned", rightX, y);
        y += 18;

        doc.setFillColor(...lightGray);
        doc.setDrawColor(...borderGray);
        const problem = doc.splitTextToSize(vehicle.problemDescription || "—", pageWidth - 2 * leftX - 10);
        const problemBoxHeight = problem.length * 5 + 14;

        doc.roundedRect(leftX, y, pageWidth - 2 * leftX, problemBoxHeight, 2, 2, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...gray);
        doc.text("REPORTED ISSUE", leftX + 5, y + 8);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(20, 20, 20);
        doc.text(problem, leftX + 5, y + 15);

        y += problemBoxHeight + 14;

        doc.setTextColor(...primary);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("COST BREAKDOWN", leftX, y);
        doc.setDrawColor(...primary);
        doc.line(leftX, y + 2, leftX + 45, y + 2);
        y += 8;

        const tableX = leftX;
        const tableW = pageWidth - 2 * leftX;

        doc.setFillColor(...dark);
        doc.rect(tableX, y, tableW, 9, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.text("DESCRIPTION", tableX + 4, y + 6);
        doc.text("AMOUNT (Rs.)", tableX + tableW - 4, y + 6, { align: "right" });
        y += 9;

        const tableRow = (label, amount, shaded) => {
            if (shaded) {
                doc.setFillColor(...lightGray);
                doc.rect(tableX, y, tableW, 10, "F");
            }
            doc.setDrawColor(...borderGray);
            doc.line(tableX, y + 10, tableX + tableW, y + 10);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(30, 30, 30);
            doc.text(label, tableX + 4, y + 7);
            doc.text(Number(amount || 0).toLocaleString("en-IN"), tableX + tableW - 4, y + 7, { align: "right" });

            y += 10;
        };

        // FIX: was vehicle.labourCost (typo) — your model/state uses laborCost
        tableRow("Labor Cost", vehicle.laborCost, true);
        tableRow("Parts Cost", vehicle.partsCost, false);

        doc.setFillColor(...primary);
        doc.rect(tableX, y, tableW, 12, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("TOTAL", tableX + 4, y + 8);
        doc.text(
            `Rs. ${Number(vehicle.totalCost || 0).toLocaleString("en-IN")}`,
            tableX + tableW - 4,
            y + 8,
            { align: "right" }
        );
        y += 26;

        const pageHeight = doc.internal.pageSize.getHeight();
        const footerLineY = pageHeight - 22;

        const sigY = footerLineY - 18;
        doc.setDrawColor(...borderGray);
        doc.line(pageWidth - 70, sigY, pageWidth - 15, sigY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...gray);
        doc.text("Authorized Signature", pageWidth - 42.5, sigY + 6, { align: "center" });

        doc.setDrawColor(...borderGray);
        doc.line(leftX, footerLineY, pageWidth - leftX, footerLineY);

        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(...gray);
        doc.text("Thank you for choosing our workshop!", pageWidth / 2, pageHeight - 15, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.text(
            "This is a computer-generated invoice and does not require a physical signature.",
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
        );

        doc.save(`${vehicle.vehicleNumber}-invoice.pdf`);
    };

    console.log("Role: ", role)
    return (
        <div className="min-h-screen bg-[#0a0d12] text-white p-6 sm:p-10">
            <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 mb-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center cursor-pointer transition-all duration-200"
            >
                ←
            </button>

            <div className="max-w-5xl mx-auto bg-[#11151c] border border-white/5 rounded-2xl p-6 grid md:grid-cols-2 gap-6">
                <div className="space-y-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {vehicle?.ownerName}
                            </h1>
                            <p className="text-gray-500 font-mono tracking-wide mt-1">
                                {vehicle?.vehicleNumber}
                            </p>
                        </div>

                        {vehicle.status !== "Completed" && (
                            <button
                                onClick={() => navigate(`/edit/${vehicle._id}`)}
                                className="cursor-pointer bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                <div className="flex gap-3 justify-center items-center">
                                    <img src="/edit.png" className='invert w-[15px] h-[15px]' alt="" />
                                    Edit
                                </div>
                            </button>
                        )}
                    </div>

                    <div className="bg-[#0a0d12] border border-white/5 p-4 rounded-xl text-sm space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <p><span className="text-gray-500">Phone: </span><span className="text-gray-200">{vehicle?.phone}</span></p>
                            <p><span className="text-gray-500">Model: </span><span className="text-gray-200">{vehicle?.vehicleModel}</span></p>
                            <p><span className="text-gray-500">Type: </span><span className="text-gray-200">{vehicle?.vehicleType}</span></p>
                            <p><span className="text-gray-500">Odometer: </span><span className="text-gray-200">{vehicle?.odometerReading} km</span></p>
                            <p className="col-span-2">
                                <span className="text-gray-500">Created:</span>{" "}
                                <span className="text-gray-200">{new Date(vehicle?.createdAt).toLocaleDateString()}</span>
                            </p>
                        </div>

                        <div className="pt-3 border-t border-white/5">
                            {!vehicle?.assignedTo && vehicle.status === "In Progress" ? (
                                <div>
                                    <span className="text-gray-500 text-xs uppercase tracking-wider block mb-2">Assign Mechanic</span>
                                    <div className="flex flex-wrap gap-2">
                                        <select
                                            value={selectedMechanic}
                                            onChange={(e) => setSelectedMechanic(e.target.value)}
                                            className="bg-[#11151c] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/60 transition-colors duration-200"
                                        >
                                            <option value="">Select Mechanic</option>
                                            {mechanics.map((mechanic) => (
                                                <option key={mechanic._id} value={mechanic._id}>
                                                    {mechanic.name}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            onClick={assignMechanic}
                                            className="cursor-pointer bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                                        >
                                            Assign
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm">
                                    <span className="text-gray-500">Mechanic Assigned: </span>
                                    <span className="text-gray-200">{vehicle?.assignedTo?.name || "Yet to assign"}</span>
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge(vehicle?.status)}`}>
                                {vehicle?.status}
                            </span>
                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-medium">
                                {vehicle?.serviceType} Service
                            </span>
                        </div>
                    </div>

                    <div className="bg-[#0a0d12] border border-white/5 p-4 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Problem</p>
                        <p className="text-gray-200 leading-relaxed">{vehicle?.problemDescription}</p>
                    </div>

                    {vehicle.status !== "Pending" && (
                        <div className="bg-[#0a0d12] border border-white/5 p-4 rounded-xl">
                            <h2 className="text-base font-semibold mb-4">
                                Cost Details
                            </h2>

                            <div className="space-y-3">
                                <input
                                    type="number"
                                    value={laborCost}
                                    onChange={(e) => setLaborCost(e.target.value)}
                                    placeholder="Labor Cost (₹)"
                                    className="w-full bg-[#11151c] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10 transition-all duration-200 disabled:opacity-50"
                                    disabled={savingCost || vehicle.status === "Completed"}
                                />

                                <input
                                    type="number"
                                    value={partsCost}
                                    onChange={(e) => setPartsCost(e.target.value)}
                                    placeholder="Parts Cost (₹)"
                                    className="w-full bg-[#11151c] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10 transition-all duration-200 disabled:opacity-50"
                                    disabled={savingCost || vehicle.status === "Completed"}
                                />

                                <button
                                    onClick={updateCost}
                                    disabled={savingCost || vehicle.status === "Completed"}
                                    className="bg-orange-600 hover:bg-orange-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {savingCost && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>}
                                    {savingCost ? "Saving..." : "Save"}
                                </button>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5 space-y-1.5 text-sm">
                                <p className="flex justify-between text-gray-400">
                                    <span>Labor Cost</span><span>₹{vehicle?.laborCost ?? 0}</span>
                                </p>
                                <p className="flex justify-between text-gray-400">
                                    <span>Parts Cost</span><span>₹{vehicle?.partsCost ?? 0}</span>
                                </p>
                                <p className="flex justify-between font-semibold text-base text-green-400 pt-1.5 border-t border-white/5">
                                    <span>Total Cost</span><span>₹{vehicle?.totalCost ?? 0}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {vehicle.status === "Completed" && (
                        <button
                            onClick={generateInvoice}
                            className="w-full bg-green-600 cursor-pointer focus:outline-none hover:bg-green-700 px-4 py-3 rounded-xl font-medium transition-colors duration-200 shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                        >
                            📄 Download Invoice
                        </button>
                    )}

                </div>

                <div className="flex justify-center items-center">
                    {vehicle?.vehicleImage ? (
                        <img
                            src={vehicle?.vehicleImage}
                            className="w-full max-w-md h-72 object-cover rounded-xl border border-white/10"
                            alt={vehicle?.vehicleNumber}
                        />
                    ) : (
                        <div className="w-full h-72 flex items-center justify-center text-gray-500 text-sm border border-dashed border-white/10 rounded-xl">
                            No image
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto mt-10">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    Previous Visits
                    <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">
                        {prevHistory.length}
                    </span>
                </h2>

                {prevHistory.length === 0 ? (
                    <div className="border border-dashed border-white/10 rounded-xl py-8 text-center">
                        <p className="text-gray-500 text-sm">First visit for this vehicle</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {prevHistory.map((item) => (
                            <div
                                className="bg-[#11151c] border border-white/5 hover:border-white/15 p-4 rounded-xl transition-colors duration-200"
                                key={item._id}
                            >
                                <div className="flex justify-between gap-4">
                                    <p className="text-gray-300 text-sm">{item.problemDescription}</p>
                                    <span className="text-gray-500 text-xs shrink-0">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {vehicle.status !== "Completed" && (
                <div className="max-w-5xl mx-auto mt-6">
                    {(role == "technician" || role == "admin") ? (
                        <button
                            onClick={markCompleted}
                            disabled={!vehicle.assignedTo}
                            className="bg-green-600 cursor-pointer hover:bg-green-700 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 shadow-lg shadow-green-600/20 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            Mark Completed
                        </button>
                    ) : (
                        <p className="text-red-500">NO ACCESS</p>
                    )
                }
                </div>
            )}

        </div>
    )
}

export default VehicleDetails