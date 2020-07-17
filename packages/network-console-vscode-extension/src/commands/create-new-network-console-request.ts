// Copyright (c) Rob Paveza
// Licensed under the MIT License

import * as vscode from 'vscode';
import ConfigurationManager from '../config-manager';
import ViewManager from '../views/view-manager';

export default function registerCreateNewNetworkConsoleRequestCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('network-console-vscode-extension.new', () => {
        if (ConfigurationManager.instance().openFrontendInMultipleTabs) {
            ViewManager.instance().constructMultitabView(context);
        }
        else {
            ViewManager.instance().activateSingleton(context);
        }
    }));
}
