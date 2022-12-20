'use strict';

import { Shopify, ApiVersion } from "@shopify/shopify-api";
import "dotenv/config";

import queryString from 'query-string';

import { AppInstallations } from './app_installations.js';

Shopify.Context.initialize({
    API_KEY: "efcbb8e78f4dfbb5ba79c6af17bdb890",
    API_SECRET_KEY: "b1d2233ff014bda402497edae0e3f01c",
    SCOPES: ['write_products', 'write_customers', 'write_draft_orders'],
    HOST_NAME: "rajan-poc-app.aoa.rajasing.people.aws.dev",
    HOST_SCHEME: "https",
    API_VERSION: ApiVersion.April22,
    IS_EMBEDDED_APP: true,
});

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
    const qs = res.querystring;
    const query = queryString.parse(qs);

    if (typeof query.shop !== "string") {
        callback(null, responseForNoShopParam);
        return true;
    }

    const shop = Shopify.Utils.sanitizeShop(query.shop);
    const appInstalled = await AppInstallations.includes(shop);

    if (!appInstalled) {
        console.log("App is not installed!");
    }


    res.uri = DEFAULT_OBJECT;
    callback(null, res);
    return true;
};