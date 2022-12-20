'use strict';

//Temp code below to prevent node from trying to load sqlite3 and choking
//https://github.com/Shopify/shopify-api-js/issues/410#issuecomment-1227409450
import Module from "module";
var originalRequire = Module.prototype.require;
Module.prototype.require = function () {
    if (arguments[0] === 'sqlite3') {
        return {}
    } else {
        return originalRequire.apply(this, arguments);
    }
};

import { Shopify, ApiVersion } from "@shopify/shopify-api";
import "dotenv/config";

import queryString from 'query-string';

import { AppInstallations } from './app_installations.js';

Shopify.Context.initialize({
    API_KEY: process.env.SHOPIFY_API_KEY,
    API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
    SCOPES: process.env.SCOPES.split(","),
    HOST_NAME: process.env.HOST.replace(/https?:\/\//, ""),
    HOST_SCHEME: process.env.HOST.split("://")[0],
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