var userId;

chrome.runtime.onInstalled.addListener(({reason}) => {
    getUserId().then(function(result) {
        userId = result;
        chrome.runtime.setUninstallURL(`https://theeasystreet.duckdns.org/uninstall?userId=${userId}`);
        if (reason === 'install') {
            install();
        }
    });
});

function getLocalStorageValue(key) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.sync.get(key, function(value) {
                resolve(value[key]);
            });
        } catch (ex) {
            reject(ex);
        }
    });
}

function setUserId(value) {
    chrome.storage.sync.set({
        'userId': value
    });
}

async function getUserId() {
    let storedUserId = await getLocalStorageValue("userId");
    if (storedUserId === undefined) {
        storedUserId = generateUUID();
        setUserId(storedUserId);
        chrome.runtime.setUninstallURL(`https://theeasystreet.duckdns.org/uninstall?userId=${storedUserId}`);
    }
    return storedUserId;
}

chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {
        while (userId === undefined) {
            userId = await getUserId();
        }
        if (request.greeting === "matchAttempt") {
            matchAttempt(request);
            sendResponse({
                farewell: "matchAttemptRecorded"
            });
        }
        if (request.greeting === "matchFound") {
            matchFound(request);
            sendResponse({
                farewell: "matchFoundRecorded"
            });
        }
        if (request.greeting === "buttonAppears") {
            buttonAppears(request);
            sendResponse({
                farewell: "buttonAppearsRecorded"
            });
        }
        if (request.greeting === "buttonClick") {
            buttonClick(request);
            sendResponse({
                farewell: "buttonClickRecorded"
            });
        }
        if (request.greeting === "listingClick") {
            listingClick(request);
            sendResponse({
                farewell: "listingClickedRecorded"
            });
        }
        if (request.greeting === "filtersClick") {
            filtersClick(request);
            sendResponse({
                farewell: "filtersClickRecorded"
            });
        }
    }
);

async function install() {
    let uniqueId = Date.now() + Math.random();

    const options = {
        method: 'POST',
        headers: {
            accept: 'text/plain',
            'content-type': 'application/json'
        },
        body: JSON.stringify([{
            properties: {
                token: 'fbfd3babd9bbe30378557e44041a0711',
                time: new Date(),
                $insert_id: uniqueId,
                distinct_id: userId
            },
            event: 'ExtensionInstalled'
        }])
    };

    fetch('https://api.mixpanel.com/track', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
}

async function matchAttempt(request) {
    let uniqueId = Date.now() + Math.random();

    const options = {
        method: 'POST',
        headers: {
            accept: 'text/plain',
            'content-type': 'application/json'
        },
        body: JSON.stringify([{
            properties: {
                token: 'fbfd3babd9bbe30378557e44041a0711',
                time: new Date(),
                $insert_id: uniqueId,
                distinct_id: userId,
                Match_ID: request.matchid,
                Brand_Name: request.brand,
                Product_Name: request.product,
                URL: request.url
            },
            event: 'MatchAttempt'
        }])
    };

    fetch('https://api.mixpanel.com/track', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
}

async function matchFound(request) {
    let uniqueId = Date.now() + Math.random();

    const options = {
        method: 'POST',
        headers: {
            accept: 'text/plain',
            'content-type': 'application/json'
        },
        body: JSON.stringify([{
            properties: {
                token: 'fbfd3babd9bbe30378557e44041a0711',
                time: new Date(),
                $insert_id: uniqueId,
                distinct_id: userId,
                Match_ID: request.matchid,
                Brand_Name: request.brand,
                Product_Name: request.product,
                URL: request.url,
                Num_Marketplace_Listings: request.listingNums
            },
            event: 'MatchMade'
        }])
    };

    fetch('https://api.mixpanel.com/track', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
}

async function filtersClick(request) {
    let uniqueId = Date.now() + Math.random();

    const options = {
        method: 'POST',
        headers: {
            accept: 'text/plain',
            'content-type': 'application/json'
        },
        body: JSON.stringify([{
            properties: {
                token: 'fbfd3babd9bbe30378557e44041a0711',
                time: new Date(),
                $insert_id: uniqueId,
                distinct_id: userId,
                Match_ID: request.matchid,
                Brand_Name: request.brand,
                Product_Name: request.product,
                URL: request.url,
                Num_Marketplace_Listings: request.listingNums
            },
            event: 'FilterClick'
        }])
    };

    fetch('https://api.mixpanel.com/track', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
}

async function buttonClick(request) {
    let uniqueId = Date.now() + Math.random();

    const options = {
        method: 'POST',
        headers: {
            accept: 'text/plain',
            'content-type': 'application/json'
        },
        body: JSON.stringify([{
            properties: {
                token: 'fbfd3babd9bbe30378557e44041a0711',
                time: new Date(),
                $insert_id: uniqueId,
                distinct_id: userId,
                Match_ID: request.matchid,
                Brand_Name: request.brand,
                URL: request.url,
                Product_Name: request.product,
                Num_Marketplace_Listings: request.listingNums
            },
            event: 'HoverButtonClicked'
        }])
    };

    fetch('https://api.mixpanel.com/track', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
}

async function buttonAppears(request) {
    let uniqueId = Date.now() + Math.random();

    const options = {
        method: 'POST',
        headers: {
            accept: 'text/plain',
            'content-type': 'application/json'
        },
        body: JSON.stringify([{
            properties: {
                token: 'fbfd3babd9bbe30378557e44041a0711',
                time: new Date(),
                $insert_id: uniqueId,
                distinct_id: userId,
                Match_ID: request.matchid,
                Brand_Name: request.brand,
                Product_Name: request.product,
                URL: request.url,
                Num_Marketplace_Listings: request.listingNums
            },
            event: 'HoverButtonDisplayed'
        }])
    };

    fetch('https://api.mixpanel.com/track', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
}

async function listingClick(request) {
    let uniqueId = Date.now() + Math.random();

    const options = {
        method: 'POST',
        headers: {
            accept: 'text/plain',
            'content-type': 'application/json'
        },
        body: JSON.stringify([{
            properties: {
                token: 'fbfd3babd9bbe30378557e44041a0711',
                time: new Date(),
                $insert_id: uniqueId,
                distinct_id: userId,
                Brand_Name: request.brand,
                Product_Name: request.product,
                Match_ID: request.matchid,
                Marketplace: request.market,
                URL: request.url,
                Num_Marketplace_Listings: request.listingNums
            },
            event: 'MarketplaceLinkClicked'
        }])
    };

    fetch('https://api.mixpanel.com/track', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
}

function generateUUID() {
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}