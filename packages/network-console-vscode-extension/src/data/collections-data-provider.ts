// Copyright (c) Rob Paveza
// Licensed under the MIT License

import * as vscode from 'vscode';
import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import { 
    ICollectionEntryAdapter, 
    ICollectionContainerAdapter, 
    // ICollectionItemAdapter, 
    // ICollectionAdapter,
    CollectionFormats,
    ICollectionItemAdapter,
} from 'network-console-shared';
import SingletonManager, { SINGLETON_ID } from '../util/singleton-manager';
import { CollectionMap } from './collections-id-map';

export class CollectionsDataProvider implements vscode.TreeDataProvider<ICollectionEntryAdapter> {
    private _onDidChangeTreeData: vscode.EventEmitter<ICollectionEntryAdapter | undefined> = new vscode.EventEmitter();
    readonly onDidChangeTreeData: vscode.Event<ICollectionEntryAdapter | undefined> = this._onDidChangeTreeData.event;
    private _roots: ICollectionContainerAdapter[];
    public static readonly [SINGLETON_ID] = 'CollectionsDataProvider';
    private _itemMap: CollectionMap;

    constructor(context: vscode.ExtensionContext) {
        this._roots = [];
        this._itemMap = SingletonManager.get(context).getInstance(CollectionMap);
        this._discoverCollections();
    }

    public refresh() {
        this._discoverCollections();
    }

    private async _discoverCollections() {
        const candidates = await vscode.workspace.findFiles('**/*.json');
        const results: ICollectionContainerAdapter[] = [];
        const decoder = new TextDecoder('utf-8');
        await Promise.all(candidates.map(async uri => {
            // TODO: Map this to avoid repeating so much code.

            let handled = false;
            if (uri.path.endsWith('.nc.json')) {
                // Network Console native collection format
                try {
                    const fileContents = await vscode.workspace.fs.readFile(uri);
                    const fileText = decoder.decode(fileContents);
                    const parsed = await CollectionFormats['nc-native'].parse(uri.path, fileText);
                    results.push(parsed);
                    handled = true;
                }
                catch (e) {
                    console.warn(`Failed to parse expected NC-Native collection file "${uri.path}": "${e.message}"`);
                }
            }
            else if (uri.path.endsWith('.postman_collection.json')) {
                // Postman collection format
                try {
                    const fileContents = await vscode.workspace.fs.readFile(uri);
                    const fileText = decoder.decode(fileContents);
                    const parsed = await CollectionFormats['postman-v2.1'].parse(uri.path, fileText);
                    results.push(parsed);
                    handled = true;
                }
                catch (e) {
                    console.warn(`Failed to parse expected Postman-v2.1 collection file "${uri.path}": "${e.message}"`);
                }
            }
            
            if (!handled) {
                // Try other formats here
                try {
                    const fileContents = await vscode.workspace.fs.readFile(uri);
                    const fileText = decoder.decode(fileContents);
                    const parsed = await CollectionFormats['openapi'].parse(uri.path, fileText);
                    results.push(parsed);
                    handled = true;
                }
                catch (e) {
                    console.warn(`Failed to parse possible OpenAPI collection file "${uri.path}": "${e.message}"`);
                }
            }
        }));

        this._roots = results;
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: ICollectionEntryAdapter): TreeItem {
        if (element.type === 'container') {
            return {
                collapsibleState: TreeItemCollapsibleState.Collapsed,
                contextValue: 'networkConsole.collectionContainer',
                label: element.name,
                id: element.id,
            };
        }
        else {
            const item = element as ICollectionItemAdapter;
            this._itemMap.set(item.id, item, item.collection);
            return {
                collapsibleState: TreeItemCollapsibleState.None,
                contextValue: 'networkConsole.collectionItem',
                label: element.name,
                id: element.id,
                description: `${item.request.verb} ${item.request.url}`,
                command: {
                    command: 'network-console-vscode-extension.open-request-by-id',
                    arguments: [element.id],
                    title: 'Open Collection Entry',
                },
            };
        }
    }

    async getChildren(element?: ICollectionEntryAdapter): Promise<ICollectionEntryAdapter[]> {
        if (!element) {
            return this._roots;
        }

        if (element.type === 'item') {
            return [];
        }

        const container = element as ICollectionContainerAdapter;
        const childrenIds = container.childEntryIds;
        return childrenIds.map(id => container.getEntryById(id)).filter(item => item !== null) as ICollectionEntryAdapter[];
    }
}
