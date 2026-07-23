import { createManyTabEntry, deleteAllTabEntries, readTabEntry } from "./tabs.repository.js"

export const constructTree = async () => {
	let queryResult = await readTabEntry({})
	return queryResult
}

export const sync = async (arr) => {
	await deleteAllTabEntries()
	await createManyTabEntry(arr)
}

