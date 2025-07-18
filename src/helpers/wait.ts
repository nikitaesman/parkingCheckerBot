export function wait(mc: number) {
	return new Promise((resolve) => {
		setTimeout(() => resolve(null), mc);
	});
}