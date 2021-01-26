'use babel';

import { TextEditor } from 'atom';
import Head from './head';

export default class Parser {
	state: String[];
	headRegex: RegExp;
	countRegex: RegExp;
	first: Head;

	constructor() {
		const level = atom.config.get('org-atom.headLevel');
		this.state = (atom.config.get('org-atom.todoState') + ' ' + atom.config.get('org-atom.doneState')).split(' ');
		this.headRegex = new RegExp('\\n[*]{1,' + level.toString() + '}\\s+|[\\s\\S]$', 'g');
		this.countRegex = new RegExp('\\[\\d*\\/\\d*\\]', 'g');
		this.first = null;
	}

	parse(editor: TextEditor): void {
		this.first = null;
		if (!editor) {
			return;
		}
		const buffer = editor.getBuffer();
		if (!editor) {
			return;
		}
		const text = buffer.getText();
		let match;
		const parent: Head[] = [];
		let prevHead = null;
		while (match = this.headRegex.exec(text)) {
			const level = match[0].trim().startsWith('*') ? match[0].trim().length : 0;
			const pos = buffer.positionForCharacterIndex(match.index);
			if (level == 0) {
				// end of file
				if (prevHead) {
					const prevLine = prevHead.rangeHead.start.row;
					if (prevLine >= 0 && pos.row > prevLine) {
						const range = new Range([prevLine + 1, 0], [pos.row, 0]);
						prevHead.rangeBody = range;
					}
				}
			} else {
				// head
				const range = buffer.rangeForRow(pos.row + 1);
				const head = new Head(level, range);
				if (!this.first) {
					this.first = head;
				}

				// state
				const line = buffer.getTextInRange(range);
				console.log(line);
				const lineArray = line.split(/\s+/);
				if ((lineArray.length > 2) && this.state.includes(lineArray[1])) {
					head.state = lineArray[1];
					head.stateColumn = line.indexOf(head.state);
				}

				// count
				const countMatch = this.countRegex.exec(line);
				if (countMatch) {
					head.count = countMatch[0];
					head.countColumn = countMatch.index;
				}

				// schedule and deadline
				if (buffer.getLineCount() > pos.line + 2) {
					const range = buffer.rangeForRow(pos.row + 2);
					const nextLine = buffer.getTextInRange(range);
					head.scheduleColumn = nextLine.indexOf('SCHEDULED:');
					if (head.scheduleColumn >= 0) {
						const end = nextLine.indexOf('>', head.scheduleColumn);
						head.schedule = nextLine.slice(head.scheduleColumn, end + 1);
					}
					head.deadlineColumn = nextLine.indexOf('DEADLINE:');
					if (head.deadlineColumn >= 0) {
						const end = nextLine.indexOf('>', head.deadlineColumn);
						head.deadline = nextLine.slice(head.deadlineColumn, end + 1);
					}
				}

				// body
				if (prevHead) {
					prevHead.nextHead = head;
					const prevLine = prevHead.rangeHead.start.row;
					if (prevLine >= 0 && pos.row > prevLine) {
						const range = new Range([prevLine + 1, 0], [pos.row, 0]);
						prevHead.rangeBody = range;
					}
				}
				head.prevHead = prevHead;

				// parent
				let p = parent.pop();
				if (!p) {
					parent.push(head);
				} else {
					while (p && p.level >= head.level) {
						p = parent.pop();
					}
					if (p) {
						p.children.push(head);
						head.parent = p;
						parent.push(p);
					}
					parent.push(head);
				}

				prevHead = head;
			}
		}
		return;
	}

	getHead(line: Number = null): Head {
		if (!line) {
			return this.first;
		}
		let h = this.first;
		while (h) {
			const headLine = h.rangeHead.start.row;
			const bodyLine = (h.rangeBody) ? h.rangeBody.end.row : h.rangeHead.start.row;
			if (line >= headLine && line <= bodyLine) {
				break;
			}
			h = h.nextHead;
		}
		return h;
	}
}
