import fs from 'fs/promises'
import path from 'path'

interface Subscribe {
	chatId: number
	parkingZoneId: number
}

export class SubscribesStore {
	private subscribesFolderPath: string
	private subscribesFilePath: string
	private _subscribes: Subscribe[] = []

	constructor(subscribesFolderPath: string) {
		this.subscribesFolderPath = subscribesFolderPath
		this.subscribesFilePath = path.join(this.subscribesFolderPath, "subscribes.json")
	}

	private saveSubscribesToFile = async () => {
		try {
			const fileData = JSON.stringify(this._subscribes)

			await fs.mkdir(this.subscribesFolderPath, { recursive: true })

			await fs.writeFile(this.subscribesFilePath, fileData, {})
		} catch (e: any) {
			console.log("error while saveSubscribesToFile", e)
		}
	}

	readSubscribesFromFile = async () => {
		try {
			const fileData = await fs.readFile(this.subscribesFilePath)

			const preparedData = JSON.parse(fileData.toString())

			this._subscribes = preparedData

			console.log("Subscribers successful loading from a file",);
		} catch (e: any) {
			console.log("error while readSubscribesFromFile", e)
		}
	} 

	addSubscribe = async (chatId: number, parkingZoneId: number) => {
		const isAlreadyExist = this._subscribes.find((el) => el.chatId === chatId && el.parkingZoneId === parkingZoneId)

		if (isAlreadyExist) return

		const newSubscribe: Subscribe = {
			chatId,
			parkingZoneId
		}

		this._subscribes.push(newSubscribe)

		await this.saveSubscribesToFile()
	}

	removeSubscribe = async (chatId: number, parkingZoneId: number) => {
		const isAlreadyExist = this._subscribes.find((el) => el.chatId === chatId && el.parkingZoneId === parkingZoneId)

		if (!isAlreadyExist) return

		this._subscribes = this._subscribes.filter((el) => el.chatId !== chatId || el.parkingZoneId !== parkingZoneId)

		await this.saveSubscribesToFile()
	}

	getSubscribesByChatId = (chatId: number) => {
		return this._subscribes.filter((el) => el.chatId === chatId)
	}

	getAllSubscribes = () => this._subscribes
}