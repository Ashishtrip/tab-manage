import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users-info', required: true },
	deviceId: { type: String, required: true },
	deviceName: { type: String, required: true },
	os: { type: String },
	browser: { type: String },
	lastActive: { type: Date, default: Date.now },
	isOnline: { type: Boolean, default: false },
	socketId: { type: String }
});

const Device = mongoose.model('devices-info', deviceSchema);
export default Device;
