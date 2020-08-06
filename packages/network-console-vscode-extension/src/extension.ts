import * as vscode from 'vscode';
import registerCommands from './commands';
import SingletonManager, { SINGLETON_ID } from './util/singleton-manager';
import { CollectionsDataProvider } from './data/collections-data-provider';

export function activate(context: vscode.ExtensionContext) {
	SingletonManager.get(context).register(CollectionsDataProvider);

	registerCommands(context);
	const cdp = SingletonManager.get(context).getInstance(CollectionsDataProvider);
	vscode.window.registerTreeDataProvider('network-console-vscode-extension.collections', cdp!);
}

// this method is called when your extension is deactivated
export function deactivate() {}
