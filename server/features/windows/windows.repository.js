import Windows from "./windows.model.js"

export const readWindows = async (query) => {
	try {
		return await Windows.find(query)
	} catch (error) {
		console.log(error)
		return null
	}
}

export const upsertWindow = async (windowId, category) => {
	try {
		return await Windows.findOneAndUpdate(
			{ windowId },
			{ category },
			{ upsert: true, new: true }
		)
	} catch (error) {
		console.log(error)
		return null
	}
}
