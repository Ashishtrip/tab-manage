import mongoose from "mongoose";

const pendingHandoffSchema = new mongoose.Schema({
	targetDeviceId: { type: String, required: true },
	tabId: { type: mongoose.Schema.Types.ObjectId, ref: 'tabs-info', required: true },
	createdAt: { type: Date, default: Date.now }
});

const PendingHandoff = mongoose.model('pending-handoffs', pendingHandoffSchema);
export default PendingHandoff;
