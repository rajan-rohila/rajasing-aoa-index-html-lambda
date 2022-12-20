'use strict';

import { Shopify, ApiVersion } from "@shopify/shopify-api";
import "dotenv/config";
import { join } from "path";

import queryString from 'query-string';

import { AppInstallations } from './app_installations.js';
import redirectToAuth from "./redirect-to-auth.js";

const sessionDb = new Shopify.Session.MemorySessionStorage();

Shopify.Context.initialize({
    API_KEY: "efcbb8e78f4dfbb5ba79c6af17bdb890",
    API_SECRET_KEY: "b1d2233ff014bda402497edae0e3f01c",
    SCOPES: ['write_products', 'write_customers', 'write_draft_orders'],
    HOST_NAME: "rajan-poc-app.aoa.rajasing.people.aws.dev",
    HOST_SCHEME: "https",
    API_VERSION: ApiVersion.April22,
    IS_EMBEDDED_APP: true,
    // This should be replaced with your preferred storage strategy
    SESSION_STORAGE: sessionDb,
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
    const req = event.Records[0].cf.request;
    const qs = req.querystring;
    const query = queryString.parse(qs);

    if (typeof query.shop !== "string") {
        callback(null, responseForNoShopParam);
        return true;
    }

    const shop = Shopify.Utils.sanitizeShop(query.shop);
    const appInstalled = await AppInstallations.includes(shop);

    if (!appInstalled) {
        const redirectToAuthResponse = await redirectToAuth(req, query);
        callback(null, redirectToAuthResponse);
        return true;
    }

    if (Shopify.Context.IS_EMBEDDED_APP && query.embedded !== "1") {
        const embeddedUrl = Shopify.Utils.getEmbeddedAppUrl(req);
        callback(null, getRedirectResponse(embeddedUrl + req.origin.custom.path));
        return true;
    }

    //Serves index.html
    req.uri = DEFAULT_OBJECT;
    callback(null, req);
    return true;
};

const getRedirectResponse = (url) => {
    return {
        status: '302',
        headers: {
            'location': [{
                key: 'Location',
                value: url,
            }],
            'cache-control': [{
                key: 'Cache-Control',
                value: "max-age=0"
            }],
        },
    };
}