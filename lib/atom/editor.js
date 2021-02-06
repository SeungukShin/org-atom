'use babel';

import { TextEditor } from 'atom';
import IEditor from '../interface/ieditor';
import Position from '../interface/position';

export default class Editor extends IEditor {
	editor: TextEditor;

	constructor(editor: TextEditor) {
		super();
		this.editor = editor;
	}

	getText(): String {
		return this.editor.getText();
	}

	getLine(line: Number): String {
		return this.editor.lineTextForBufferRow(line);
	}

	offsetToPosition(offset: Number): Position {
		const buffer = this.editor.getBuffer();
		const point = buffer.positionForCharacterIndex(offset);
		return new Position(point.row, point.column);
	}

	getCurrentPosition(): Position {
		const point = this.editor.getCursorBufferPosition();
		return new Position(point.row, point.column);
	}
}
