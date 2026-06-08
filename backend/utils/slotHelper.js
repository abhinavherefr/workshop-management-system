import Vehicle from "../models/vehicleModel.js";

export const findFreeSlot = (vehicles) => {

    const usedSlots = vehicles.filter(v => v.status !== "Completed" && v.slotNumber)
        .map(v => v.slotNumber)

    for(let i = 1; i <= 10; i++){
        if(!usedSlots.includes(i))
            return i;
    }

    return null;

}

export const processQueue = async (freedSlot) => {
    const queuedVehicle = await Vehicle.findOne({
        status: "Pending"
    }).sort({ createdAt: 1 });

    if(!queuedVehicle) return;

    queuedVehicle.status = "In Progress"
    queuedVehicle.slotNumber = freedSlot

    await queuedVehicle.save();

}
