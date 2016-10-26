import { routes, model, ng } from 'entcore/entcore';
import { workspaceController } from './controller';
import { Workspace } from './model/workspace';

routes.define(function($routeProvider) {
	$routeProvider
		.when('/folder/:folderId', {
			action: 'viewFolder'
		})
		.when('/shared/folder/:folderId', {
	  		action: 'viewSharedFolder'
		})
		.when('/shared', {
		  	action: 'openShared'
		})
		.otherwise({
		  	redirectTo: '/'
		})
});

ng.controllers.push(workspaceController);

model.build = function(){
	Workspace.instance.sync()
};