'use babel';

import IConfig from '../interface/iconfig';

export default class Config extends IConfig {
	static instance: Config;
	base: String;

	constructor(base: String) {
		if (!Config.instance) {
			super();
			this.base = base;
			Config.instance = this;
		}
		return Config.instance;
	}

	static getInstance(base: String): Config {
		if (!Config.instance) {
			Config.instance = new Config(base);
		}
		return Config.instance;
	}

	reload(): void {}

	get(key: String): Object {
		return atom.config.get(this.base + '.' + key);
	}

	set(key: String, value: Object): Boolean {
		return atom.config.set(key, value);
	}
}
