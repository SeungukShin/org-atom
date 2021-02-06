'use babel';

import Position from './position';

export default class IEditor {
	getText(): String {
		throw new Error('not implemented');
	}

	getLine(line: Number): String {
		throw new Error('not implemented:', line);
	}

	offsetToPosition(offset: Number): Position {
		throw new Error('not implemented:', offset);
	}

	getCurrentPosition(): Position {
		throw new Error('not implemented');
	}
}
