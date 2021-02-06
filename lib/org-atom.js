'use babel';

import * as path from 'path';
import { CompositeDisposable, Range, TextEditor } from 'atom';
import IConfig from './interface/iconfig';
import ILog from './interface/ilog';
import Config from './atom/config';
import Log from './atom/log';
import Editor from './atom/editor';
import OrgDoc from './org/org-doc';

class OrgAtom {
	subscriptions: CompositeDisposable;
	config: IConfig;
	log: ILog;
	orgDoc: OrgDoc;
	editorDisposable: Disposable;
	markers: DisplayMarker[];

	activate() {
		this.subscriptions = new CompositeDisposable();
		this.config = new Config('org-atom');
		this.log = new Log(this.config);
		this.orgDoc = new OrgDoc(this.config);
		this.editorDisposable = null;
		this.markers = [];

		// Register commands
		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'org-atom:toggleFold': () => this.toggleFold()
		}));

		// Register events
		this.subscriptions.add(atom.workspace.onDidChangeActiveTextEditor(
			this.changeActiveTextEditor.bind(this)));

		const editor = atom.workspace.getActiveTextEditor();
		if (editor && path.extname(editor.getPath()).toLowerCase() === '.org') {
			this.changeActiveTextEditor(editor);
		}

		this.log.info('"org-atom" is now active!');
	}

	deactivate() {
		if (this.editorDisposable) {
			this.editorDisposable.dispose();
		}
		this.subscriptions.dispose();
		for (const marker of this.markers) {
			marker.destroy();
		}

		this.log.info('"org-atom" is now inactive!');
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
		this.editorDisposable =
			editor.onDidStopChanging(this.decorateEditor.bind(this));
		this.decorateEditor();
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
		this.orgDoc.update(new Editor(editor));
		for (const h of this.orgDoc) {
			if (h.level > 1) {
				const line = h.startLine;
				const range = new Range([line, 0], [line, h.level - 1]);
				const marker = editor.markBufferRange(range, { invalidate: 'never' });
				//const fontSize = parseInt(document.documentElement.style.fontSize);
				this.markers.push(marker);
				editor.decorateMarker(marker, { type: 'text', style: {
					color: 'rgba(255, 255, 255, 0.0)',
					paddingLeft: `${8 * (h.level - 1)}px`
				} });
			}
			if (h.startLine < h.endLine) {
				const startLine = h.startLine + 1;
				const endLine = h.endLine;
				//const fontSize = parseInt(document.documentElement.style.fontSize);
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
		}
	}

	toggleFold(): void {
		const editor = atom.workspace.getActiveTextEditor();
		if (!editor || path.extname(editor.getPath()).toLowerCase() !== '.org') {
			return;
		}
		const line = editor.getCursorBufferPosition().row;
		if (editor.isFoldedAtBufferRow(line)) {
			editor.unfoldBufferRow(line);
			return;
		}
		const buffer = editor.getBuffer();
		let head = this.orgDoc.getHead(line);
		const startRange = buffer.rangeForRow(head.startLine);
		while (head.children.length > 0) {
			head = head.children[head.children.length - 1];
		}
		const endRange = buffer.rangeForRow(head.endLine);
		const range = Range(startRange.end, endRange.end);
		editor.setSelectedBufferRange(range);
		editor.foldSelectedLines();
	}
}

const orgAtom = new OrgAtom();
export default orgAtom;
