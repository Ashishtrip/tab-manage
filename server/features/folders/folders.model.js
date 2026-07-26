import mongoose from "mongoose"
const folderSchema = new mongoose.Schema({
	name: { type: String, required: true },
	windowId: { type: Number, required: true },
	parentFolderId: { type: mongoose.Schema.Types.ObjectId, ref: 'folders-info', default: null },
	// Manual arrangement order — same role as tabs.order.
	order: { type: Number, default: 0 },
}, { timestamps: true })
const Folders = mongoose.model('folders-info', folderSchema)
export default Folders
