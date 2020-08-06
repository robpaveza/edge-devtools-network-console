// Copyright (c) 2020, Rob Paveza
// Licensed under the MIT License

import { INetConsoleRequest, INetConsoleAuthorization } from 'network-console-shared';

// Network Console file format code implements adapters (the objects that come out of the File-IO module
// are not serializable). This allows the implementations to produce a single unified view without regard
// to how they're serialized to disk. However, that means that the property assignment and message-passing
// serialization has to occur to allow those getters and setters to work.

export function serializeRequest(src: INetConsoleRequest): INetConsoleRequest {
    const { authorization, bodyComponents, description, headers, name, queryParameters, routeParameters, url, verb } = src;
    return {
        authorization: serializeAuthorization(authorization),
        body: { 
            content: '',
        },
        bodyComponents: {
            bodySelection: bodyComponents.bodySelection,
            formData: bodyComponents.formData ? bodyComponents.formData.slice() : undefined,
            rawTextBody: bodyComponents.rawTextBody ? {
                contentType: bodyComponents.rawTextBody.contentType,
                text: bodyComponents.rawTextBody.text,
            } : undefined,
            xWwwFormUrlencoded: bodyComponents.xWwwFormUrlencoded ? bodyComponents.xWwwFormUrlencoded.slice() : undefined,
        },
        description,
        headers: headers.slice(),
        name,
        queryParameters: queryParameters.slice(),
        routeParameters: routeParameters.slice(),
        url,
        verb,
    };
}

export function serializeAuthorization(src: INetConsoleAuthorization): INetConsoleAuthorization {
    const { type, basic, token } = src;
    return {
        type,
        basic: basic ? { 
            password: basic.password,
            showPassword: basic.showPassword,
            username: basic.username,
        } : undefined,
        token: token ? {
            token: token.token,
        } : undefined,
    };
}

export function assignRequest(target: INetConsoleRequest, src: INetConsoleRequest) {
    // TODO
}

export function assignAuthorization(target: INetConsoleAuthorization, src: INetConsoleAuthorization) {
    // TODO
}
