// Copyright (c) Rob Paveza
// Licensed under the MIT License

declare const acquireVsCodeApi: () => any;
let iframeWindow: Window | null = null;

export function initializeMessaging() {
    const vscode = acquireVsCodeApi();

    window.addEventListener('DOMContentLoaded', () => {
        iframeWindow = (document.getElementById('host') as HTMLIFrameElement).contentWindow;
    });

    function onMessage(messageEvent: MessageEvent) {
        if (messageEvent.source === iframeWindow) {
            // In this case, the message originated in the iframe; therefore,
            // pass it along unchanged to the VS Code extension. The only message
            // we should get in this case is CONSOLE_READY.
            vscode.postMessage(messageEvent.data);
        }
        else {
            if (!iframeWindow) {
                throw new Error('Not yet initialized.');
            }

            // Forward the message to the frontend
            iframeWindow.postMessage(messageEvent.data, '*');
        }
    }

    window.addEventListener('message', onMessage);
}