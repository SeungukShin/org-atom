'use babel';

import * as path from 'path';
import { CompositeDisposable, TextEditor } from 'atom';
import Log from './log';

class OrgAtom {
	subscriptions: CompositeDisposable;
	editorDisposable: Disposable;
	headRegex: RegExp;
	orgAtomView: OrgAtomView;

	activate() {
		this.subscriptions = new CompositeDisposable();
		this.headRegex = new RegExp('\\n[*]{1,6}\\s+|[\\s\\S]$', 'g');

		// Register commands
		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'org-atom:toggle': () => this.toggle()
		}));

		const self = this;
		const editor = atom.workspace.getActiveTextEditor();
		if (editor && path.extname(editor.getPath()).toLowerCase() === '.org') {
			this.decorateEditor(self, editor);
		}

		// Register events
		this.subscriptions.add(atom.workspace.onDidChangeActiveTextEditor(() => {
			const editor = atom.workspace.getActiveTextEditor();
			if (self.editorDisposable) {
				self.editorDisposable.dispose();
			}
			if (path.extname(editor.getPath()).toLowerCase() === '.org') {
				this.decorateEditor(self, editor);
				self.editorDisposable = editor.onDidStopChanging(() => {
					self.decorateEditor(self, editor);
				});
			}
		}));

		Log.info('"org-atom" is now active!');
	}

	deactivate() {
		this.subscriptions.dispose();
		if (this.editorDisposable) {
			this.editorDisposable.dispose();
		}

		Log.info('"org-atom" is now inactive!');
	}

	decorateEditor(self: OrgAtom, editor: TextEditor): void {
		console.log(editor.getPath());
		const buffer = editor.getBuffer();
		const text = buffer.getText();
		let match;
		while (match = this.headRegex.exec(text)) {
			console.log(match[0]);
		}
	}

	toggle() {
		console.log('OrgAtom was toggled!');
	}
}

const orgAtom = new OrgAtom();
export default orgAtom;
