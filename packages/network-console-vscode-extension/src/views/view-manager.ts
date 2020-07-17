// Copyright (c) Rob Paveza
// Licensed under the MIT License

import * as vscode from 'vscode';
import HostTab from './host-tab';

export default class ViewManager {
    private static _instance: ViewManager;
    public static instance: () => ViewManager = () => {
        if (!ViewManager._instance) {
            ViewManager._instance = new ViewManager();
        }
        return ViewManager._instance;
    };

    private singletonInstance: HostTab | null = null;
    private multitabTabs: Set<HostTab>;
    private constructor() {
        this.multitabTabs = new Set<HostTab>();
    }

    public activateSingleton(context: vscode.ExtensionContext): HostTab {
        if (!this.singletonInstance) {
            const panel = vscode.window.createWebviewPanel('networkConsole', 'Network Console', vscode.ViewColumn.Active, {
                enableScripts: true,
                enableCommandUris: true,
                retainContextWhenHidden: true,
            });
            this.singletonInstance = new HostTab(panel, context, /* singleRequestMode */ false);
        }

        return this.singletonInstance;
    }

    public constructMultitabView(context: vscode.ExtensionContext): HostTab {
        const panel = vscode.window.createWebviewPanel('networkConsole', 'Network Console', vscode.ViewColumn.Active, {
            enableScripts: true,
            enableCommandUris: true,
            retainContextWhenHidden: true,
        });
        const result = new HostTab(panel, context, /* singleRequestMode: */ true);
        this.multitabTabs.add(result);
        return result;
    }
}