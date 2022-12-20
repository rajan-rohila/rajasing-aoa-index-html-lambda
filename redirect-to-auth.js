import { Shopify } from "@shopify/shopify-api";

export default async function redirectToAuth(req, query) {
    if (!query.shop) {
        return getInternalServerErrorResponse("No shop provided")
    }

    if (query.embedded === "1") {
        return getClientSideRedirectResponse(query);
    }

    //This wont ever happen as we are dealing with embedded apps
    return await getServerSideRedirectResponse(req, query);
}

function getClientSideRedirectResponse(query) {
    const shop = Shopify.Utils.sanitizeShop(query.shop);
    const redirectUriParams = new URLSearchParams({
        shop,
        host: query.host,
    }).toString();
    const queryParams = new URLSearchParams({
        ...query,
        shop,
        redirectUri: `https://${Shopify.Context.HOST_NAME}/api/auth?${redirectUriParams}`,
    }).toString();

    return getRedirectResponse(`/exitiframe?${queryParams}`);
}

async function getServerSideRedirectResponse(req, query) {
    const redirectUrl = await Shopify.Auth.beginAuth(
        req,
        {
            addTrailers: () => { },
            end: () => { },
            finished: false,
            getHeader: () => { },
            headersSent: false,
            removeHeader: () => { },
            sendDate: true,
            setHeader: () => { },
            setTimeout: () => { },
            statusCode: () => { },
            statusMessage: () => { },
            write: () => { },
            writeContinue: () => { },
            writeHead: () => { },
        },
        query.shop,
        "/api/auth/callback",
        false
    );

    return getRedirectResponse(redirectUrl);
}

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

const getInternalServerErrorResponse = (text) => {
    return {
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
        body: text,
    };
}