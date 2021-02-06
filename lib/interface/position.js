'use babel';

export default class Position {
	line: Number;
	column: Number;

	constructor(line: Number, column: Number) {
		this.line = line;
		this.column = column;
	}
}
