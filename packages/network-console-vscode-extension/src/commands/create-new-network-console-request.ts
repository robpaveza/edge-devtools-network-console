// Copyright (c) Rob Paveza
// Licensed under the MIT License

import * as vscode from 'vscode';
import ConfigurationManager from '../config-manager';
import ViewManager from '../views/view-manager';
import SingletonManager from '../util/singleton-manager';

export default function registerCreateNewNetworkConsoleRequestCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('network-console-vscode-extension.new', () => {
        const viewManager = SingletonManager.get(context).getInstance(ViewManager);
        const config = SingletonManager.get(context).getInstance(ConfigurationManager);

        if (config.openFrontendInMultipleTabs) {
            const tab = viewManager.constructMultitabView();
            tab.initNewEmptyRequest();
        }
        else {
            viewManager.activateSingleton();
        }
    }));
}
