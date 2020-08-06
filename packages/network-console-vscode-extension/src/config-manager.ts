// Copyright (c) Rob Paveza
// Licensed under the MIT License

import * as vscode from 'vscode';
import { SINGLETON_ID } from './util/singleton-manager';

export default class ConfigurationManager {
    public static readonly [SINGLETON_ID] = 'ConfigurationManager';
    private _current = {
        ignoreHttpsCertificateErrors: true,
        developerMode: false,
        openFrontendInMultipleTabs: false,
    };

    constructor() {
        vscode.workspace.onDidChangeConfiguration(cce => {
            if (cce.affectsConfiguration('networkConsole')) {
                this._refreshConfiguration();
                this._dispatchToListeners();
            }
        });
        this._refreshConfiguration();
    }

    private _refreshConfiguration() {
        const config = vscode.workspace.getConfiguration('networkConsole');
        this._current = {
            ignoreHttpsCertificateErrors: config.ignoreHttpsCertificateErrors,
            developerMode: config.developerMode,
            openFrontendInMultipleTabs: config.openFrontendInMultipleTabs,
        };
    }

    private _dispatchToListeners() {
        // TODO: Send to all of the open views
    }

    get ignoreHttpsCertificateErrors() {
        return this._current.ignoreHttpsCertificateErrors;
    }

    get developerMode() {
        return this._current.developerMode;
    }

    get openFrontendInMultipleTabs() {
        return this._current.openFrontendInMultipleTabs;
    }
}