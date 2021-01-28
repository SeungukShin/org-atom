'use babel';

import * as path from 'path';
import { CompositeDisposable, Range, TextEditor } from 'atom';
import Log from './log';
import Parser from './parser';

class OrgAtom {
	subscriptions: CompositeDisposable;
	editorDisposable: Disposable;
	parser: Parser;
	markers: DisplayMarker[];

	activate() {
		this.subscriptions = new CompositeDisposable();
		this.parser = new Parser();
		this.markers = [];

		// Register commands
		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'org-atom:toggle': () => this.toggle()
		}));

		const editor = atom.workspace.getActiveTextEditor();
		if (editor && path.extname(editor.getPath()).toLowerCase() === '.org') {
			this.changeActiveTextEditor(editor);
		}

		// Register events
		this.subscriptions.add(atom.workspace.onDidChangeActiveTextEditor(
			this.changeActiveTextEditor.bind(this)));

		Log.info('"org-atom" is now active!');
	}

	deactivate() {
		this.subscriptions.dispose();
		if (this.editorDisposable) {
			this.editorDisposable.dispose();
		}
		for (const marker of this.markers) {
			marker.destroy();
		}

		Log.info('"org-atom" is now inactive!');
	}

	changeActiveTextEditor(editor: TextEditor): void {
		if (this.editorDisposable) {
			this.editorDisposable.dispose();
		}
		if (!editor) {
			return;
		}
		if (path.extname(editor.getPath()).toLowerCase() !== '.org') {
			return;
		}
		this.decorateEditor(self, editor);
		this.editorDisposable =
			editor.onDidStopChanging(this.decorateEditor.bind(this));
	}

	decorateEditor(): void {
		const editor = atom.workspace.getActiveTextEditor();
		if (!editor) {
			return;
		}
		for (const marker of this.markers) {
			marker.destroy();
		}
		this.markers = [];
		this.parser.parse(editor);
		let h = this.parser.getHead();
		while (h) {
			if (h.level > 1) {
				const line = h.rangeHead.start.row;
				const range = new Range([line, 0], [line, h.level - 1]);
				const marker = editor.markBufferRange(range, { invalidate: 'never' });
				const fontSize = parseInt(document.documentElement.style.fontSize);
				this.markers.push(marker);
				editor.decorateMarker(marker, { type: 'text', style: {
					color: 'rgba(255, 255, 255, 0.0)',
					paddingLeft: `${8 * (h.level - 1)}px`
				} });
			}
			if (h.rangeBody) {
				const startLine = h.rangeBody.start.row;
				const endLine = h.rangeBody.end.row;
				const fontSize = parseInt(document.documentElement.style.fontSize);
				let i;
				for (i = startLine; i <= endLine; i++) {
					const range = new Range([i, 0], [i, 1]);
					const marker = editor.markBufferRange(range, { invalidate: 'never' });
					this.markers.push(marker);
					editor.decorateMarker(marker, { type: 'text', style: {
						paddingLeft: `${8 * (h.level * 2)}px`
					} });
				}
			}
			h = h.nextHead;
		}
	}

	toggle() {
		console.log('OrgAtom was toggled!');
	}
}

const orgAtom = new OrgAtom();
export default orgAtom;
