import { formatDuration } from "../helpers/formatDuration";
import { ChatsStore } from "../store/ChatsStore";
import { MessageHandlersParams } from "./messageHandlers";
import { sendSubscriptions } from "./sendSubscriptions";

const BOT_ALIVE_ALERT_ITERATION_TIMEOUT_MC = 1000 * 60 * 60 * 24

interface AlertBotIsAliveParams extends MessageHandlersParams {
	startTimestamp: number
}


export const alertBotIsAlive = (params: AlertBotIsAliveParams) => {
	const {
		bot,
		chatsStore,
		startTimestamp,
		parkingDataStore,
		subscribesStore
	} = params

	const sendBotIsAliveAlertByChatId = async (chatId: number) => {
		const durationMc = Date.now() - startTimestamp

		const durationString = formatDuration(durationMc)

		await bot.sendMessage(chatId, `Бот активен: время в работе ${durationString}`);
	}

	const sendBotIsAliveAlertToAllChat = async () => {
		const chatsList = chatsStore.getAllChats()

		for (const chatId of chatsList) {
			await sendBotIsAliveAlertByChatId(chatId)
			await sendSubscriptions({
				bot,
				chatId,
				parkingDataStore,
				subscribesStore
			})
		}
	}

	bot.onText(/\/lifetime/, async (msg) => {
		const chatId = msg.chat.id;
		try {
			await sendBotIsAliveAlertByChatId(chatId)
		} catch (e: any) {
			console.log("error while handling Время работы бота: error", e);
		}
	})

	sendBotIsAliveAlertToAllChat()

	setInterval(sendBotIsAliveAlertToAllChat, BOT_ALIVE_ALERT_ITERATION_TIMEOUT_MC)
}