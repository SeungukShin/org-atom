'use babel';

export default class IConfig {
	reload(): void {
		throw new Error('not implemented');
	}

	get(key: String): Object {
		throw new Error('not implemented:', key);
	}

	set(key: String, value: Object): Boolean {
		throw new Error('not implemented:', key, value);
	}
}
