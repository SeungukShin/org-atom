'use babel';

import { Range } from 'atom';

export default class Head {
	static doneState = atom.config.get('org-atom.doneState').split(' ');
	level: Number;
	state: String;
	stateColumn: Number;
	count: String;
	countColumn: Number;
	rangeHead: Range;
	rangeBody: Range;
	schedule: String;
	scheduleColumn: Number;
	deadline: String;
	deadlineColumn: Number;
	parent: Head;
	prevHead: Head;
	nextHead: Head;
	children: Head[];

	constructor(level: Number, range: Range) {
		this.level = level;
		this.state = '';
		this.stateColumn = -1;
		this.count = '';
		this.countColumn = -1;
		this.rangeHead = range;
		this.rangeBody = null;
		this.schedule = '';
		this.scheduleColumn = -1;
		this.deadline = '';
		this.deadlineColumn = -1;
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
