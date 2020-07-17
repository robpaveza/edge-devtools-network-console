// Copyright (c) Rob Paveza
// Licensed under the MIT License

import * as vscode from 'vscode';

export default class ConfigurationManager {
    private static _instance: ConfigurationManager;
    public static instance: () => ConfigurationManager = () => {
        if (!ConfigurationManager._instance) {
            ConfigurationManager._instance = new ConfigurationManager();
        }
        return ConfigurationManager._instance;
    };

    private _current = {
        ignoreHttpsCertificateErrors: true,
        developerMode: false,
        openFrontendInMultipleTabs: false,
    };

    private constructor() {
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