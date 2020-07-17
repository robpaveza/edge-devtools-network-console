// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

//@ts-check

'use strict';

const path = require('path');
// const CopyPlugin = require('copy-webpack-plugin');

/**@type {import('webpack').Configuration}*/
const config = [{
  target: 'node', 
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
              },
            },
          },
        ],
      },
    ]
  }
}, {
    // This compiles the host-iframe marshaling shim contained within src/host
    // It is required by the iframe since we can't just plop the root WebView to an 
    // arbitrary URI, we have to modify its HTML.
    target: 'web',
    entry: [
        './src/host/main.ts',
    ], 
    output: {
      path: path.resolve(__dirname, 'dist', 'host'),
      libraryTarget: 'window',
      filename: 'main.js',
      devtoolModuleFilenameTemplate: '../[resource-path]'
    },
    devtool: 'source-map',
    externals: {
      vscode: 'commonjs vscode'
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader'
            }
          ]
        }
      ]
    }
  }];
module.exports = config;
