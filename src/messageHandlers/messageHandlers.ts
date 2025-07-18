import TelegramBot from "node-telegram-bot-api";
import { ParkingDataStore } from "../store/ParkingDataStore";
import { SubscribesStore } from "../store/SubscribesStore";
import { ChatsStore } from "../store/ChatsStore";

export interface MessageHandlersParams {
	bot: TelegramBot
	parkingDataStore: ParkingDataStore;
	subscribesStore: SubscribesStore;
	chatsStore: ChatsStore
}

export const messageHandlers = (params: MessageHandlersParams) => {
	const {
		bot,
		parkingDataStore,
		subscribesStore,
		chatsStore
	} = params

	bot.onText(/\/start/, async (msg) => {
		const chatId = msg.chat.id;
		const firstName = msg.from?.first_name || 'пользователь';

		chatsStore.addChat(chatId)

		await bot.sendMessage(chatId, `Здравствуйте, ${firstName}! Добро пожаловать в бот проверки парковочных зон. \nВыберите сценарий:`, {
			reply_markup: {
				keyboard: [[{ text: 'Список зон', },{ text: 'Время работы бота', }]],
				resize_keyboard: true,
				one_time_keyboard: true
			}
		});
	});
 
	bot.onText(/Список зон/, async (msg) => {
		const chatId = msg.chat.id;
		try {
			chatsStore.addChat(chatId)

			const responseMes = "Началась загрузка парковочных зон в Западном административном округе, дождитесь ответа:\n"

			await bot.sendMessage(chatId, responseMes)

			await bot.sendMessage(chatId, "Если вы подпишитесь на зону, то в после регулярного опроса (раз в 5 минут) будет проведена проверка доступных зон. В случае если зона на которую вы подписаны активна, вам придёт уведомление.")

			const parkingDataList = parkingDataStore.parkingDataList

			const chatSubscribers = subscribesStore.getSubscribesByChatId(chatId)

			const strings: string[] = parkingDataList.map((parkingData, i) => {
				const isSubscribe = chatSubscribers.find((el) => el.parkingZoneId === parkingData.id)

				const statusMes = parkingData.enable ? "Доступна 🟩" : "Недоступна 🟥"

				const subMes = isSubscribe ? "🟦 Отслеживается:" : ""

				const text = `${i + 1}. ${subMes} ${parkingData.text}: (ID: ${parkingData.id}) ${statusMes}\n`

				return text
			})

			const zonesMes = "Список парковочных зон в Западном административном округе:\n" + strings.join('\n\n')

			await bot.sendMessage(chatId, zonesMes)

			const zoneSubscribeButtonsList = parkingDataList.map((parkingData, i) => {
				const isSubscribe = chatSubscribers.find((el) => el.parkingZoneId === parkingData.id)

				let button: TelegramBot.InlineKeyboardButton

				const text = `${i + 1}.`

				if (isSubscribe) {
					button = {
						text: `🟥Отписаться от зоны ${text}`,
						callback_data: `/unsubscribe ${parkingData.id}`,
					}
				} else {
					button = {
						text: `🟦Подписаться на зону ${text}`,
						callback_data: `/subscribe ${parkingData.id}`,
					}
				}

				return button
			})

			const noFlatButtonsList = zoneSubscribeButtonsList.reduce((acc: [TelegramBot.InlineKeyboardButton][], el) => {
				acc.push([el])

				return acc
			}, [])

			await bot.sendMessage(chatId, "Для подписки на зону нажмите на нужную", {
				reply_markup: {
					inline_keyboard: noFlatButtonsList,
					resize_keyboard: true,
					one_time_keyboard: false
				}
			})
		} catch (e: any) {
			await bot.sendMessage(chatId, `Ошибка обработки сообщения: error: ${e}`)
		}
	})

	bot.on('callback_query', async (query) => {
		const chatId = query?.message?.chat.id;
		const text = query.data; // это "B1" или "B2")

		if (!chatId || !text) {
			await bot.answerCallbackQuery(query.id);

			return
		}

		chatsStore.addChat(chatId)

		if (text?.startsWith('/subscribe')) {
			const parts = text.split(' '); // ['/subscribe', '123']
			const zoneId = Number(parts[1]);

			const isExistZoneId = parkingDataStore.parkingDataList.find((el) => el.id === zoneId)

			if (!isExistZoneId) {
				console.log("isExistZoneId",isExistZoneId);
				await bot.sendMessage(chatId, `Зоны с ID: ${zoneId} не существует`);
				await bot.answerCallbackQuery(query.id);
				return
			}

			await subscribesStore.addSubscribe(chatId, zoneId)

			await bot.sendMessage(chatId, `Вы успешно подписались на уведомления об активности зоны ${isExistZoneId.text}`);
			await bot.answerCallbackQuery(query.id);

			return
		}

		if (text?.startsWith('/unsubscribe')) {
			const parts = text.split(' '); // ['/unsubscribe', '123']
			const zoneId = Number(parts[1]);

			const isExistZoneId = parkingDataStore.parkingDataList.find((el) => el.id === zoneId)

			if (!isExistZoneId) {
				await bot.sendMessage(chatId, `Зоны с ID: ${zoneId} не существует`);
				await bot.answerCallbackQuery(query.id);

				return
			}

			await subscribesStore.removeSubscribe(chatId, zoneId)

			await bot.sendMessage(chatId, `Вы успешно отписались от уведомления об активности зоны ${isExistZoneId.text}`);
			await bot.answerCallbackQuery(query.id);

			return
		}


		await bot.sendMessage(chatId, `Запрос не обработан`)
		await bot.answerCallbackQuery(query.id);
	})

	// bot.on('message', async (msg) => {
	// 	const chatId = msg.chat.id;
	// 	const text = msg.text?.trim();

	// 	console.log("text", text);

	// 	// Отправляем обратно то же сообщение
	// 	await bot.sendMessage(chatId, `Вы написали: ${text}`);
	// });
}