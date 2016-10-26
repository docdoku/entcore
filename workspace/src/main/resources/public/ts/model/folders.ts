// Copyright © WebServices pour l'Éducation, 2014
//
// This file is part of ENT Core. ENT Core is a versatile ENT engine based on the JVM.
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation (version 3 of the License).
//
// For the sake of explanation, any module that communicate over native
// Web protocols, such as HTTP, with ENT Core is outside the scope of this
// license and could be license under its own terms. This is merely considered
// normal use of ENT Core, and does not fall under the heading of "covered work".
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

import { http, model, quota } from 'entcore/entcore';
import { Mix, Selection, Selectable, Eventer } from 'toolkit';
import { Document } from './documents';

export class FoldersCollection{
	sel: Selection<Folder>;
	all: Folder[];

	constructor(){
		this.sel = new Selection(this.all);
	}

	get selection(): Folder[]{
		return this.sel.selected;
	}

	trashSelection(){
		this.selection.forEach((folder) => {
			http().put('/workspace/folder/trash/' + folder._id).done(() => {
				Folder.eventer.trigger('change');
			});
			this.sel.removeSelection();
		});
	}
}

export class DocumentsCollection{
	sel: Selection<Document>;
	all: Document[];

	constructor(){
		this.sel = new Selection(this.all);
	}

	get selection(): Document[]{
		return this.sel.selected;
	}
}

export class Folder implements Selectable{
	selected: boolean;
	folders: FoldersCollection;
	documents: DocumentsCollection;
	_id: string;
    static eventer: Eventer;

	constructor(data){
		this.folders = new FoldersCollection();
		this.documents = new DocumentsCollection();
	}

	toTrashSelection(){
		this.documents.selection.forEach(function(document){
				http().put('/workspace/document/trash/' + document._id);
		});

		this.documents.sel.removeSelection();

		this.folders.trashSelection();
	}
}

Folder.eventer = new Eventer();