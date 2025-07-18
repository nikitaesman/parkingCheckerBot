import { ParkingData } from "../types/types";
import { MessageHandlersParams } from "./messageHandlers";

export const alertHandle = (params: MessageHandlersParams) => {
	const {
		bot,
		parkingDataStore,
		subscribesStore
	} = params

	const sendParkingZoneEnableAlert = async (chatId: number, parkingData: ParkingData) => {
		await bot.sendMessage(chatId, `Парковочная зона: ${parkingData.text} доступна`);
	}

	parkingDataStore.onUpdate(async () => {
		for (const parkingData of parkingDataStore.parkingDataList) {
			if (!parkingData.enable) continue

			const subscribes = subscribesStore.getAllSubscribes()

			const neededAlertSubscribes = subscribes.filter((el) => el.parkingZoneId === parkingData.id)

			const promises = neededAlertSubscribes.map((subscribe) => {
				return () => sendParkingZoneEnableAlert(subscribe.chatId, parkingData)
			})

			await Promise.all(promises.map(el => el()))
		}
	})
}

