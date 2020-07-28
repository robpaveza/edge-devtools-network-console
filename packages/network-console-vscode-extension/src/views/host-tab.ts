// Copyright (c) Rob Paveza
// Licensed under the MIT License

import * as vscode from 'vscode';
import { FrontendMessage, IExecuteRequestMessage, ISaveRequestMessage, ISaveCollectionAuthorizationMessage, ISaveEnvironmentVariablesMessage, IOpenWebLinkMessage, IUpdateDirtyFlagMessage, ILogMessage, IRequestCompleteMessage, HostMessage, INetConsoleRequest } from 'network-console-shared';

import * as path from 'path';
import ConfigurationManager from '../config-manager';
import { IOpenUnattachedRequestMessage } from 'network-console-shared/hosting/frontend-messages';
import issueRequest from '../net/request-executor';

/**
 * Represents a single tab hosting Network Console. 
 */
export default class HostTab implements vscode.Disposable {
    private disposables: vscode.Disposable[] = [];
    private messageQueue: HostMessage[] = [];
    private _singleRequestModeRequestId: string | undefined;

    constructor(
        private readonly panel: vscode.WebviewPanel,
        private readonly context: vscode.ExtensionContext,
        public readonly singleRequestMode: boolean,
    ) {
        this.disposables.push(this.panel.onDidChangeViewState(e => {
            if (panel.visible) {
                this.initialize();
            }
        }));
        this.disposables.push(panel.webview.onDidReceiveMessage(message => {
            this.onMessageFromWebview(message);
        }));
        this.disposables.push(vscode.window.onDidChangeActiveColorTheme(theme => {
            const isDark = theme.kind === vscode.ColorThemeKind.Dark;
            const isHighContrast = theme.kind === vscode.ColorThemeKind.HighContrast;

            this.sendMessage({
                type: 'CSS_STYLE_UPDATED',
                isDark,
                isHighContrast,
                cssVariables: '',
            });
        }));
    }

    // #region HTML slinging
    private initialize() {
        const { panel, context } = this;
        const onDiskPath = vscode.Uri.file(
            path.join(context.extensionPath, 'frontend', 'index.html')
        );
        const iframeUri = panel.webview.asWebviewUri(onDiskPath);

        let hostUri = iframeUri.toString();
        let allowedFrameSrc = panel.webview.cspSource;
        const config = ConfigurationManager.instance();
        if (config.developerMode) {
            hostUri = ' http://localhost:3000/';
            allowedFrameSrc += ' http://localhost:3000';
        }

        // Gets to the output file from src/host/main.ts which is required for marshaling 
        // messages from the Extension to the NC Frontend
        const hostScriptPath = vscode.Uri.file(
            path.join(context.extensionPath, 'dist', 'host', 'main.js')
        );
        const hostScriptUri = panel.webview.asWebviewUri(hostScriptPath);

        const outputHtml = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy"
                          content="
                            default-src 'none';
                            media-src ${allowedFrameSrc} data:;
                            frame-src ${allowedFrameSrc};
                            script-src ${allowedFrameSrc} vscode-webview:;
                            style-src 'unsafe-inline' ${allowedFrameSrc};
                          ">
            <title>Visual Studio Code Network Console</title>
            <style>
      html, body, iframe {
          width: 100%;
          height: 100%;
          overflow: hidden;
          padding: 0;
      }
            </style>
        </head>
        <body>
            <iframe src="${hostUri}?host=vscode" id="host" frameBorder="0"></iframe>
            <script src="${hostScriptUri}" type="module"></script>
        </body>
        </html>`;
        this.panel.webview.html = outputHtml;
    }
    // #endregion HTML slinging

    private onMessageFromWebview(message: FrontendMessage) {
        switch (message.type) {
            case 'CONSOLE_READY':
                this.onConsoleReady();
                break;
            case 'EXECUTE_REQUEST':
                this.onExecuteRequest(message);
                break;
            case 'SAVE_REQUEST':
                this.onSaveRequest(message);
                break;
            case 'SAVE_COLLECTION_AUTHORIZATION_PARAMETERS':
                this.onSaveCollectionAuthorizationParameters(message);
                break;
            case 'SAVE_ENVIRONMENT_VARIABLES':
                this.onSaveEnvironmentVariables(message);
                break;
            case 'OPEN_WEB_LINK':
                this.onOpenWebLink(message);
                break;
            case 'UPDATE_DIRTY_FLAG':
                this.onUpdateDirtyFlag(message);
                break;
            case 'OPEN_NEW_UNATTACHED_REQUEST':
                this.onOpenNewUnattachedRequest(message);
                break;
            case 'LOG':
                this.onLog(message);
                break;

            default:
                // @ts-ignore Type is inferred as 'never' but from a practical perspective that's not true.
                console.warn(`Unrecognized message type "${message.type}" from frontend.`);
                console.warn(message);
                break;
        }
    }

    /**
     * Sends or queues a message. High-level API implementations should call this method rather
     * than directly calling into the WebView, because the WebView may not yet have initialized.
     * @param message The message to send
     */
    protected sendMessage(message: HostMessage) {
        if (this.messageQueue) {
            this.messageQueue.push(message);
        }
        else {
            this.panel.webview.postMessage(message);
        }
    }

    // #region Message handlers from the frontend
    protected onConsoleReady() {
        const cssVariables = '';
        const isDark = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
        const isHighContrast = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.HighContrast;

        this.panel.webview.postMessage({
            type: 'INIT_HOST',
            cssVariables,
            isDark,
            isHighContrast,
        });

        while (this.messageQueue.length) {
            const nextMessage = this.messageQueue.shift();
            this.panel.webview.postMessage(nextMessage);
        }
        delete this.messageQueue;
    }

    protected async onExecuteRequest(message: IExecuteRequestMessage) {
        const { configuration, authorization, id } = message;
        try {
            const result = await issueRequest(configuration, authorization);
            
            const toRespond: IRequestCompleteMessage = {
                id,
                type: 'REQUEST_COMPLETE',
                result,
            };
            this.panel.webview.postMessage(toRespond);
        }
        catch (e) {
            this.panel.webview.postMessage({
                id,
                type: 'REQUEST_COMPLETE',
                error: e.message,
            });
        }
    }

    protected onSaveRequest(message: ISaveRequestMessage) {

    }

    protected onSaveCollectionAuthorizationParameters(message: ISaveCollectionAuthorizationMessage) {

    }

    protected onSaveEnvironmentVariables(message: ISaveEnvironmentVariablesMessage) {

    }

    protected onOpenWebLink(message: IOpenWebLinkMessage) {

    }

    protected onUpdateDirtyFlag(message: IUpdateDirtyFlagMessage) {

    }

    protected onOpenNewUnattachedRequest(message: IOpenUnattachedRequestMessage) {
        if (this.singleRequestMode) {
            this._singleRequestModeRequestId = message.requestId;
        }
        else {
            // todo
        }
    }

    protected onLog(message: ILogMessage) {
        console.info(message);
    }
    // #endregion Message handlers from the frontend

    // #region API calls from the Host to the frontend
    public initNewEmptyRequest() {
        this.sendMessage({
            type: 'INIT_NEW_EMPTY_REQUEST',
        });
    }

    public loadRequest(request: INetConsoleRequest) {

    }

    /**
     * Closes a view. Only has an effect if this is NOT the singleton tab.
     * @param requestId 
     */
    public closeView(requestId: string) {
        if (!this.singleRequestMode) {
            this.sendMessage({
                type: 'CLOSE_VIEW',
                requestId,
            });
        }
    }

    /**
     * Switches to a particular request by ID. 
     * @param requestId 
     */
    public showOpenRequest(requestId: string) {
        if (!this.singleRequestMode) {
            this.sendMessage({
                type: 'SHOW_OPEN_REQUEST',
                requestId,
            });
        }
        this.panel.reveal();
    }

    // #endregion API calls from the Host to the frontend


    dispose() {
        this.panel.dispose();

        while (this.disposables.length > 0) {
            const next = this.disposables.pop();
            if (next) {
                next.dispose();
            }
        }
    }
}