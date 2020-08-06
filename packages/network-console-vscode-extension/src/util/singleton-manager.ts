// Copyright (c) Rob Paveza
// Licensed under the MIT License

import * as vscode from 'vscode';
export const SINGLETON_ID = Symbol('SingletonID');

export interface SingletonConstructor<TInstance extends object, TCtor extends new (...args: any) => TInstance> {
    new(context: vscode.ExtensionContext): TInstance;
    [SINGLETON_ID]: string;
}

export default class SingletonManager {
    private static _instance: SingletonManager;
    private map: Map<string, object>;
    constructor(private extensionContext: vscode.ExtensionContext) {
        this.map = new Map();
    }

    public static get(context: vscode.ExtensionContext) {
        if (!this._instance) {
            this._instance = new SingletonManager(context);
        }
        return this._instance;
    }

    public register<TInstance extends object, TCtor extends new (...args: any) => TInstance>(constructor: SingletonConstructor<TInstance, TCtor>) {
        if (!constructor[SINGLETON_ID]) {
            throw new RangeError('Singleton must have a singleton ID symbol property.');
        }

        if (this.map.has(constructor[SINGLETON_ID])) {
            throw new RangeError(`Singleton constructor "${constructor[SINGLETON_ID]}" already registered.`);
        }

        const obj = new constructor(this.extensionContext);
        this.map.set(constructor[SINGLETON_ID], obj);
    }

    public getInstance<TInstance extends object, TCtor extends new (...args: any) => TInstance>(constructor: SingletonConstructor<TInstance, TCtor>) {
        let instance = this.map.get(constructor[SINGLETON_ID]) as TInstance;
        if (!instance) {
            this.register(constructor);
            instance = this.map.get(constructor[SINGLETON_ID]) as TInstance;
        }

        return instance;
    }
}
