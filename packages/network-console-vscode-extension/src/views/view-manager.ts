// Copyright (c) Rob Paveza
// Licensed under the MIT License

import * as vscode from 'vscode';
import HostTab from './host-tab';
import SingletonManager, { SINGLETON_ID } from '../util/singleton-manager';
import { INetConsoleRequest } from 'network-console-shared';
import ConfigurationManager from '../config-manager';

export default class ViewManager {
    public static readonly [SINGLETON_ID] = 'ViewManager';

    private static VIEW_ID = 'network-console-vscode-extension.network-console';
    private singletonInstance: HostTab | null = null;
    private multitabTabs: Map<string, HostTab>;
    constructor(private context: vscode.ExtensionContext) {
        this.multitabTabs = new Map<string, HostTab>();
    }

    public activateSingleton(): HostTab {
        if (!this.singletonInstance) {
            const panel = vscode.window.createWebviewPanel(ViewManager.VIEW_ID, 'Network Console', vscode.ViewColumn.Active, {
                enableScripts: true,
                enableCommandUris: true,
                retainContextWhenHidden: true,
            });
            this.singletonInstance = new HostTab(panel, this.context, /* singleRequestMode */ false);
        }

        return this.singletonInstance;
    }

    public constructMultitabView(): HostTab {
        const panel = vscode.window.createWebviewPanel(ViewManager.VIEW_ID, 'Network Console', vscode.ViewColumn.Active, {
            enableScripts: true,
            enableCommandUris: true,
            retainContextWhenHidden: true,
        });
        const result = new HostTab(panel, this.context, /* singleRequestMode: */ true);
        return result;
    }

    /**
     * Links a host tab to an ID. Used for single-request-mode tabs which are initialized with an 
     * empty request.
     * @param id 
     * @param tab 
     */
    public linkTabToId(id: string, tab: HostTab) {
        this.multitabTabs.set(id, tab);
    }

    public async activateOrCreateTab(id: string, request: INetConsoleRequest) {
        const config = SingletonManager.get(this.context).getInstance(ConfigurationManager);
        if (config.openFrontendInMultipleTabs) {
            let tab = this.multitabTabs.get(id);
            if (tab) {
                tab.reveal();
            }
            else {
                tab = this.constructMultitabView();
                this.multitabTabs.set(id, tab);
                tab.loadRequest(id, request);
            }
        }
    }
}
