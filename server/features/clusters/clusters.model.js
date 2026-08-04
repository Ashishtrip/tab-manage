import mongoose from "mongoose";

const clusterSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users-info', required: true },
	title: { type: String, required: true },
	tabIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tabs-info' }],
	generatedAt: { type: Date, default: Date.now }
});

const Cluster = mongoose.model('clusters-info', clusterSchema);
export default Cluster;
