// Copyright (c) Rob Paveza
// Licensed under the MIT License

import * as vscode from 'vscode';
import ViewManager from '../views/view-manager';
import ConfigurationManager from '../config-manager';

import registerCreateNewNetworkConsoleRequestCommand from './create-new-network-console-request';

type RegisterFn = (c: vscode.ExtensionContext) => void;
const registrations: RegisterFn[] = [
    registerCreateNewNetworkConsoleRequestCommand,
];

export default function registerCommands(
    context: vscode.ExtensionContext
) {
    registrations.forEach(r => r(context)); 
}
