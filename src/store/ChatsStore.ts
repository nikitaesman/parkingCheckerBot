import fs from 'fs/promises'
import path from 'path'

export class ChatsStore {
	private chatsFolderPath: string
	private chatsFilePath: string
	private _chats = new Set<number>()

	constructor(chatsFolderPath: string) {
		this.chatsFolderPath = chatsFolderPath
		this.chatsFilePath = path.join(this.chatsFolderPath, "chats.json")
	}

	private saveChatsToFile = async () => {
		try {
			const chatsList: number[] = []

			this._chats.values().forEach((el) => {
				chatsList.push(el)
			})

			console.log("chatsList",chatsList);

			const fileData = JSON.stringify(chatsList)

			await fs.mkdir(this.chatsFolderPath, { recursive: true })

			await fs.writeFile(this.chatsFilePath, fileData, {})
		} catch (e: any) {
			console.log("error while saveChatsToFile", e)
		}
	}

	readChatsFromFile = async () => {
		try {
			const fileData = await fs.readFile(this.chatsFilePath)

			const preparedData = JSON.parse(fileData.toString())

			preparedData.forEach((el: number) => {
				this._chats.add(el)
			})

			console.log("Chats successful loading from a file",);
		} catch (e: any) {
			console.log("error while readChatsFromFile", e)
		}
	} 

	addChat = async (chatId: number) => {
		const isExist = this._chats.has(chatId)

		if (isExist) return

		this._chats.add(chatId)

		await this.saveChatsToFile()
	}

	removeChat = async (chatId: number) => {
		const isExist = this._chats.has(chatId)

		if (!isExist) return

		this._chats.delete(chatId)

		await this.saveChatsToFile()
	}

	getAllChats = () => this._chats.values()
}