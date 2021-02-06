'use babel';

import IConfig from '../interface/iconfig';
import IEditor from '../interface/ieditor';
import Head from './head';

export default class OrgDoc {
	config: IConfig;
	headRegex: RegExp;
	first: Head;

	constructor(config: IConfig) {
		this.config = config;
		const level = this.config.get('headLevel');
		this.headRegex = new RegExp('\\n[*]{1,' + level.toString() + '}\\s+|[\\s\\S]$', 'g');
		this.first = null;

		Head.allState = (this.config.get('todoState') + ' ' + this.config.get('doneState')).split(' ');
		Head.doneState = this.config.get('doneState').split(' ');
		Head.countRegex = new RegExp('\\[\\d*\\/\\d*\\]', 'g');
	}

	update(editor: IEditor): void {
		this.first = null;
		if (!editor) {
			return;
		}
		const text = editor.getText();
		let match;
		const parent: Head[] = [];
		let prevHead = null;
		let head = null;
		let startLine = -1;
		let endLine = -1;
		while (match = this.headRegex.exec(text)) {
			const level = match[0].trim().startsWith('*') ? match[0].trim().length : 0;
			const position = editor.offsetToPosition(match.index);
			head = null;
			if (level == 0) {
				// end of file
				if (startLine > 0) {
					endRow = position.line;
					head = new Head(editor, startLine, endLine);
				}
			} else {
				// head
				if (startLine > 0) {
					endLine = position.line;
					head = new Head(editor, startLine, endLine);
				}
				// new head
				startLine = position.line + 1;
			}
			if (head) {
				if (!this.first) {
					this.first = head;
				}

				// previous head
				if (prevHead) {
					prevHead.nextHead = head;
					head.prevHead = prevHead;
				}

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
			if (line >= h.startLine && line <= h.endLine) {
				break;
			}
			h = h.nextHead;
		}
		return h;
	}

	[Symbol.iterator]() {
		let h = this.first;
		return {
			next: () => {
				if (h) {
					let result = { value: h, done: (h.nextHead == null) };
					h = h.nextHead;
					return result;
				}
				return { value: null, done: true };
			}
		};
	}
}
