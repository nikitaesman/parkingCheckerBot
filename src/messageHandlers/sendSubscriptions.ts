import TelegramBot from "node-telegram-bot-api"
import { MessageHandlersParams } from "./messageHandlers"

interface SendSubscriptionsParams extends Omit<MessageHandlersParams, "chatsStore"> {
	chatId: number
}

export const sendSubscriptions = async (params: SendSubscriptionsParams) => {
	const {
		bot,
		chatId,
		parkingDataStore,
		subscribesStore
	} = params

	const parkingDataList = parkingDataStore.parkingDataList

	const chatSubscribers = subscribesStore.getSubscribesByChatId(chatId)

	const subscriptionsZoneButtonsList = chatSubscribers.map((subscribeItem, i) => {
		const parkingData = parkingDataList.find((el) => el.id === subscribeItem.parkingZoneId)

		let button: TelegramBot.InlineKeyboardButton

		if (parkingData) {
			const text = `${i + 1}. ${parkingData.text}`

			button = {
				text: text,
				callback_data: `noop`,
			}
		} else {
			const text = `${i + 1}. Неизвестное имя зоны`

			button = {
				text: text,
				callback_data: `noop`,
			}
		}

		return button
	})

	const noFlatButtonsList = subscriptionsZoneButtonsList.reduce((acc: [TelegramBot.InlineKeyboardButton][], el) => {
		acc.push([el])

		return acc
	}, [])

	bot.sendMessage(chatId, 'Список отслеживаемых зон:', {
		reply_markup: {
			inline_keyboard: noFlatButtonsList
		}
	});
}