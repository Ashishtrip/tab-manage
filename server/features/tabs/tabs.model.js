import mongoose from "mongoose"
const tabsSchema = new mongoose.Schema({
	id: { type: Number, required: true },
	index: { type: Number, required: true },
	windowId: { type: Number, required: true },
	groupId: { type: Number, required: true },
	url: { type: String, required: true },
	title: { type: String, required: true },
	openerTabId: { type: Number },
	status: { type: String },
	folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'folders-info', default: null },
	// Manual arrangement order, distinct from `index` (which mirrors the
	// browser's own tab-strip position and gets overwritten on every sync).
	// Only drag-and-drop reordering touches this field.
	order: { type: Number, default: 0 },
	// AI Features & Archiving
	embedding: { type: [Number] },
	isArchived: { type: Boolean, default: false },
	archivedAt: { type: Date },
	contentSummary: { type: String },
})
const Tabs = mongoose.model('tabs-info', tabsSchema)
export default Tabs
