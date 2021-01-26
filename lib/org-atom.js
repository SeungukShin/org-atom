'use babel';

import * as path from 'path';
import { CompositeDisposable, TextEditor } from 'atom';
import Log from './log';
import Parser from './parser';

class OrgAtom {
	subscriptions: CompositeDisposable;
	editorDisposable: Disposable;
	parser: Parser;

	activate() {
		this.subscriptions = new CompositeDisposable();
		this.parser = new Parser();

		// Register commands
		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'org-atom:toggle': () => this.toggle()
		}));

		const editor = atom.workspace.getActiveTextEditor();
		if (editor && path.extname(editor.getPath()).toLowerCase() === '.org') {
			this.decorateEditor(self, editor);
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
		console.log(editor.getPath());
		this.parser.parse(editor);
	}

	toggle() {
		console.log('OrgAtom was toggled!');
	}
}

const orgAtom = new OrgAtom();
export default orgAtom;
