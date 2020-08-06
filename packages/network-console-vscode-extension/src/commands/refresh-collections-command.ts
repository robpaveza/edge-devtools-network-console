// Copyright (c) 2020, Rob Paveza
// Licensed under the MIT License

import * as vscode from 'vscode';
import SingletonManager from '../util/singleton-manager';
import { CollectionsDataProvider } from '../data/collections-data-provider';

export default function registerRefreshCollectionsCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('network-console-vscode-extension.refresh', () => {
        const tdp = SingletonManager.get(context).getInstance(CollectionsDataProvider);
        tdp.refresh();
    }));
}
