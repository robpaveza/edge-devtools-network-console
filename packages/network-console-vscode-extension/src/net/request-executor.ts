// Copyright (c) Rob Paveza
// Licensed under the MIT License

import { IHttpRequest, INetConsoleAuthorization, INetConsoleResponse, IHttpHeader } from 'network-console-shared';
import got, { GotRequestFunction, OptionsOfBufferResponseBody } from 'got';

export default async function issueRequest(req: IHttpRequest, auth: INetConsoleAuthorization): Promise<INetConsoleResponse> {
    const verb = req.verb.toLowerCase();
    if (!(verb in got)) {
        return {
            duration: 0,
            status: 'ERROR_BELOW_APPLICATION_LAYER',
            response: {
                statusCode: 0,
                statusText: 'E_INVALID_HTTP_VERB',
                body: { content: '' },
                headers: [],
                size: 0,
            },
        };
    }

    const options: OptionsOfBufferResponseBody = { 
        responseType: 'buffer',
        throwHttpErrors: false,
    };

    const headers = req.headers.reduce((accum, item) => {
        accum[item.key] = item.value;
        return accum;
    }, { } as any);
    options.headers = headers;

    if (req.body && req.body.content) {
        options.body = Buffer.from(req.body.content, 'base64');
        if (verb === 'get') {
            options.allowGetBody = true;
        }
    }
    
    const method = (got as any)[verb] as GotRequestFunction;
    const start = Date.now();
    const result = await method(req.url, options);
    const finished = Date.now();

    let currentHeader: IHttpHeader;
    return {
        duration: finished - start,
        status: 'COMPLETE',
        response: {
            statusCode: result.statusCode,
            statusText: result.statusMessage || '',
            size: result.rawBody.length,
            body: {
                content: result.rawBody.toString('base64'),
            },
            headers: result.rawHeaders.reduce((accum, cur, index) => {
                if (index % 2 === 0) {
                    currentHeader = {
                        key: cur,
                        value: '',
                    };
                }
                else {
                    currentHeader.value = cur;
                    accum.push(currentHeader);
                }
                return accum;
            }, [] as IHttpHeader[]),
        },
    };
}
