'use strict';

import queryString from 'query-string';

const responseForNoShopParam = {
    status: '500',
    headers: {
        'cache-control': [{
            key: 'Cache-Control',
            value: 'max-age=0'
        }],
        'content-type': [{
            key: 'Content-Type',
            value: 'text/plain'
        }]
    },
    body: "No shop provided - Coming from lambda@Edge!!",
};

const DEFAULT_OBJECT = '/index.html';

export const handler = async (event, context, callback) => {
    const res = event.Records[0].cf.request;
    const qs = res.queryString;
    const query = queryString.parse(qs);

    if (typeof query.shop !== "string") {
        callback(null, responseForNoShopParam);
        return true;
    }


    res.uri = DEFAULT_OBJECT;
    callback(null, res);
    return true;
};