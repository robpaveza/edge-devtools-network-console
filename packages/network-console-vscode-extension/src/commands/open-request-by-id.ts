// Copyright (c) 2020, Rob Paveza
// Licensed under the MIT License

import * as vscode from 'vscode';
import SingletonManager from '../util/singleton-manager';
import { CollectionMap } from '../data/collections-id-map';
import ViewManager from '../views/view-manager';

export default function registerRefreshCollectionsCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('network-console-vscode-extension.open-request-by-id', (id: string) => {
        const cm = SingletonManager.get(context).getInstance(CollectionMap);
        const item = cm.getItem(id);
        if (!item) {
            vscode.window.showErrorMessage(`Could not open a request with an ID of "${id}."`);
            return;
        }

        const vm = SingletonManager.get(context).getInstance(ViewManager);
        vm.activateOrCreateTab(id, item.request);
    }));
}
