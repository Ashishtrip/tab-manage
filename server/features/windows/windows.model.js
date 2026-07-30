import mongoose from "mongoose"

const windowSchema = new mongoose.Schema({
	windowId: { type: Number, required: true, unique: true },
	category: { type: String, enum: ['Work', 'Personal', 'Dev', 'Research'], required: true }
}, { timestamps: true })

const Windows = mongoose.model('windows-info', windowSchema)
export default Windows
