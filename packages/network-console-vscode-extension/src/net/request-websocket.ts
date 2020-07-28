// Copyright (c) Rob Paveza
// Licensed under the MIT License

import * as vscode from 'vscode';
import * as WebSocket from 'ws';
import { Base64String } from 'network-console-shared';
import HostTab from '../views/host-tab';

export class RequestWebsocket implements vscode.Disposable {
    private _ws: WebSocket | null;
    private _disposables: vscode.Disposable[] = [];

    constructor(private url: string, private requestId: string, private tab: HostTab) {
        this._ws = null;
    }

    connect() {
        const { url, requestId, tab } = this;
        this._ws = new WebSocket(url);
        this._ws.on('close', () => {
            tab.notifyWebsocketDisconnected(requestId);
        });
        this._ws.on('message', data => {
            if (typeof data === 'string') {
                tab.notifyWebsocketPacket(requestId, data, 'text', 'recv');
            }
            else {
                tab.notifyWebsocketPacket(requestId, data.toString('base64'), 'base64', 'recv');
            }
        });
    }

    send(message: string | Base64String, encoding: 'text' | 'base64') {
        if (!this._ws) {
            throw new ReferenceError('Object disconnected.');
        }

        if (encoding === 'base64') {
            this._ws.send(Buffer.from(message, 'base64'));
        }
        else {
            this._ws.send(message);
        }

        this.tab.notifyWebsocketPacket(this.requestId, message, encoding, 'send');
    }

    disconnect() {
        if (!this._ws) {
            return;
        }

        this._ws.close();
    }

    dispose() {
        while (this._disposables.length) {
            const next = this._disposables.shift();
            next?.dispose();
        }
    }
}
