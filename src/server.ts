import path from 'path';


import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'
import { ParkingDataStore } from './store/ParkingDataStore';
import { messageHandlers } from './messageHandlers/messageHandlers';
import { SubscribesStore } from './store/SubscribesStore';
import { alertHandle } from './messageHandlers/alertHandle';
import { ChatsStore } from './store/ChatsStore';
import { alertBotIsAlive } from './messageHandlers/alertBotIsAlive';
import { wait } from './helpers/wait';

dotenv.config()

const BOT_TOKEN = process.env.BOT_TOKEN as string;
const STORES_FILE_PATH = path.resolve('./storage')

console.log("STORES_FILE_PATH", STORES_FILE_PATH);


async function main() {
	try {
		const startTimestamp = Date.now()

		const bot = new TelegramBot(BOT_TOKEN, { polling: true });

		const chatsStore = new ChatsStore(STORES_FILE_PATH)

		await chatsStore.readChatsFromFile()

		bot.setChatMenuButton({
			menu_button: {
				type: 'commands'
			}
		});

		const subscribesStore = new SubscribesStore(STORES_FILE_PATH)

		await subscribesStore.readSubscribesFromFile()

		const parkingDataStore = new ParkingDataStore()

		alertHandle({
			bot,
			parkingDataStore,
			subscribesStore,
			chatsStore
		})

		parkingDataStore.startIntervalUpdateParkingData()

		const parkingDataLoadingPromise = parkingDataStore.parkingDataLoading

		if(parkingDataLoadingPromise) {
			await parkingDataLoadingPromise
		}

		alertBotIsAlive({
			bot,
			chatsStore,
			parkingDataStore,
			subscribesStore,
			startTimestamp
		})

		messageHandlers({
			bot,
			parkingDataStore,
			subscribesStore,
			chatsStore
		})

	} catch (e: any) {
		throw new Error("Ошибка при запуске бота", e)
	}
}



main()