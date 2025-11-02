/**
 * Creates a deeply reactive object using Proxy.
 * @param {object} target
 * @param {function} callback
 * @returns {Proxy}
 */
export function createReactive(target, callback) {
	const reactiveCache = new WeakMap()

	function createProxy(obj) {
		if (typeof obj !== 'object' || obj === null) {
			return obj
		}

		if (reactiveCache.has(obj)) {
			return reactiveCache.get(obj)
		}

		const proxy = new Proxy(obj, {
			get(target, key, receiver) {
				const result = Reflect.get(target, key, receiver)
				return createProxy(result)
			},
			set(target, key, value, receiver) {
				const success = Reflect.set(target, key, value, receiver)
				if (success) {
					callback()
				}
				return success
			},
		})

		reactiveCache.set(obj, proxy)
		return proxy
	}

	return createProxy(target)
}
