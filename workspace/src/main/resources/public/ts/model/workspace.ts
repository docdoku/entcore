export class Workspace{
	private static _instance: Workspace;

	static get instance(): Workspace{
		if(!this._instance){
			this._instance = new Workspace();
		}

		return this._instance;
	}

	sync(){

	}
}