import { chromium } from 'playwright'
import { ParkingData } from '../types/types';

export async function getParkingDataList(): Promise<ParkingData[]> {
	try {
		const browser = await chromium.launch({ headless: true }); // headless: true — без UI
		const page = await browser.newPage();

		await page.goto('https://parking.mos.ru/parking/barrier/subscribe/');

		// Клик по элементу по тексту
		const districtSelect = page.getByText('Выберите адрес парковки');
		await districtSelect.nth(0).click();

		const districtText = "Западный административный округ"

		const targetDistrictElement = page.getByText(districtText);

		await targetDistrictElement.nth(1).click({
			force: true,
		});


		const addressSelect = page.getByText('Выберите адрес парковки');
		await addressSelect.click({
			force: true,
		});

		const options = await page.$$eval('div[data-name="address"]', els => {
			const listElement = els[0]

			const values: ParkingData[] = []

			listElement.childNodes.forEach((el) => {
				const node = el as Element

				const value: ParkingData = {
					id: Number(node.getAttribute('data-value')|| 0),
					text: node.textContent?.trim() || "",
					enable: !node.classList.contains("disabledVar")
				}

				values.push(value)
			})

			return values
		});

		await browser.close();

		return options
	} catch (e: any) {
		throw new Error("Ошибка получения списка доступных парковочных зон: error" + e.message)
	}
}