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
}) 

const Tabs = mongoose.model('tabs-info', tabsSchema)
export default Tabs
