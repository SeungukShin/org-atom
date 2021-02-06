'use babel';

import IEditor from '../interface/ieditor';

export default class Head {
	static allState;
	static doneState;
	static countRegex;
	startLine: Number;
	endLine: Number;
	level: Number;
	state: String;
	stateColumn: Number;
	count: String;
	countColumn: Number;
	schedule: String;
	scheduleColumn: Number;
	deadline: String;
	deadlineColumn: Number;
	parent: Head;
	prevHead: Head;
	nextHead: Head;
	children: Head[];

	constructor(editor: IEditor, startLine: Number, endLine: Number) {
		this.startLine = startLine;
		this.endLine = endLine;
		const line = editor.getLine(startLine);

		// head - level
		this.level = 0;
		while (line[this.level] == '*') {
			this.level++;
		}

		// head - state
		const lineArray = line.split(/\s+/);
		if ((lineArray.length > 2) && Head.allState.includes(lineArray[1])) {
			this.state = lineArray[1];
			this.stateOffset = line.indexOf(this.state);
		}

		// head - count
		const countMatch = Head.countRegex.exec(line);
		if (countMatch) {
			this.count = countMatch[0];
			this.countOffset = countMatch.index;
		}

		// body
		if (endLine > startLine) {
			const line = editor.getLine(startLine + 1);

			// schedule and deadline
			this.scheduleColumn = line.indexOf('SCHEDULED:');
			if (this.scheduleColumn >= 0) {
				const end = line.indexOf('>', this.scheduleColumn);
				this.schedule = line.slice(this.scheduleColumn, end + 1);
			}
			this.deadlineColumn = line.indexOf('DEADLINE:');
			if (this.deadlineColumn >= 0) {
				const end = line.indexOf('>', this.deadlineColumn);
				this.deadline = line.slice(this.deadlineColumn, end + 1);
			}
		} else {
			this.schedule = '';
			this.scheduleColumn = -1;
			this.deadline = '';
			this.deadlineColumn = -1;
		}

		this.parent = null;
		this.prevHead = null;
		this.nextHead = null;
		this.children = [];
	}

	getCount(): [Number, Number] {
		let done = 0;
		let total = 0;
		for (const child of this.children) {
			if (child.state.length == 0) {
				return;
			}
			if (Head.doneState.includes(child.state)) {
				done++;
			}
			total++;
		}
		return [done, total];
	}
}
