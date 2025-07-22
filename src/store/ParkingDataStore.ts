import { getParkingDataList } from "../scripts/getParkingDataList";
import { ParkingData } from "../types/types";

const INTERVAL_TIMEOUT_UPDATE_MC = 1000 * 60 * 5 // 5 min

type CustomCb = () => Promise<void>

export class ParkingDataStore {
	private _parkingDataList: ParkingData[] = []
	private interval: NodeJS.Timeout | null = null
	private callbacks: Set<CustomCb> = new Set<CustomCb>()
	private _parkingDataLoading: Promise<void> | null = null

	get parkingDataLoading() {
		return this._parkingDataLoading
	}

	startIntervalUpdateParkingData = () => {
		this.updateWithCustomCallbacks()

		this.interval = setInterval(this.updateWithCustomCallbacks, INTERVAL_TIMEOUT_UPDATE_MC)
	}

	stopIntervalUpdateParkingData = () => {
		if (!this.interval) return

		clearInterval(this.interval)
	}

	onUpdate = (cb: CustomCb): () => boolean => {
		const cbWithHandleError = async () => {
			try {
				await cb()
			} catch (e: any) {
				console.log("error while calling async callback: error:", e, "callback:", cb)
			}
		}

		this.callbacks.add(cbWithHandleError)

		return () => this.callbacks.delete(cbWithHandleError)
	}

	private updateWithCustomCallbacks = async () => {
		const { promise, resolve } = Promise.withResolvers<void>()

		try {
			this._parkingDataLoading = promise

			console.log("updateWithCustomCallbacks iteration start",);

			await this.updateParkingData()

			await Promise.all(this.callbacks.values().map(el => el()))

			console.log("updateWithCustomCallbacks iteration end",);

		} catch (e: any) {
			console.log("error while updateWithCustomCallbacks", e)
		} finally {
			resolve()
			this._parkingDataLoading = null
		}
	}

	private updateParkingData = async () => {
		const parkingDataList = await getParkingDataList()

		this._parkingDataList = parkingDataList
	}

	get parkingDataList() {
		return this._parkingDataList
	}
}