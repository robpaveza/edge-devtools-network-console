// Copyright (c) Rob Paveza
// Licensed under the MIT License

import * as vscode from 'vscode';

import registerCreateNewNetworkConsoleRequestCommand from './create-new-network-console-request';
import registerRefreshCollectionsCommand from './refresh-collections-command';
import registerOpenRequestByIdCommand from './open-request-by-id';

type RegisterFn = (c: vscode.ExtensionContext) => void;
const registrations: RegisterFn[] = [
    registerCreateNewNetworkConsoleRequestCommand,
    registerRefreshCollectionsCommand,
    registerOpenRequestByIdCommand,
];

export default function registerCommands(
    context: vscode.ExtensionContext
) {
    registrations.forEach(r => r(context)); 
}
