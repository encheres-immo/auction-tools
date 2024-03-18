import {Socket} from 'phoenix'
import {AuctionType, BidType, UserType} from '../types/types';

let BASE_URL: string = "";
let WS_URL: string = "";
let accessToken: string | null = null;
let socket: Socket | null = null;

// TODO: only connect if we have an access token
// TODO: implement refresh token?
// TODO: implement error handling
let clientId: string | null = null;
function initEIClient(userClientId: string, environment: string) {
    clientId = userClientId;
    switch(environment){
        case "local":
            let DOMAIN = 'localhost:4000';
            BASE_URL = `http://${DOMAIN}`;
            WS_URL = `ws://${DOMAIN}/api/socket`;
            break;
        case "staging":
            DOMAIN = 'staging.encheres-immo.com';
            BASE_URL = `https://${DOMAIN}`;
            WS_URL = `wss://${DOMAIN}/api/socket`;
            break;
        default:
            DOMAIN = 'encheres-immo.com';
            BASE_URL = `https://${DOMAIN}`;
            WS_URL = `wss://${DOMAIN}/api/socket`;
            break;
    }
}

async function authenticate(){

    function sha256(plain: string) {
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);
        return window.crypto.subtle.digest('SHA-256', data);
    }

    // Base64-urlencodes the input string
    // function base64urlencode(str: ArrayBuffer) {
    //     return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
    //         .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    // }
    function base64urlencode(str: ArrayBuffer) {
        return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(str))))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    // Return the base64-urlencoded sha256 hash for the PKCE challenge
    async function pkceChallengeFromVerifier(v: string) {
        const hashed = await sha256(v);
        return base64urlencode(hashed);
    }

    function generateRandomString() {
        var array = new Uint32Array(28);
        window.crypto.getRandomValues(array);
        return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
    }

    const url = window.location.href;
    const params = new URLSearchParams(url.split('?')[1]);
    const code = params.get('code');

    // const redirect_uri = encodeURIComponent(window.location.href);
    // console.log(redirect_uri)
    const redirect_uri = window.location.origin;
    // try to extract the oauth code from the query string
    if (code) {
        // if there is a code in the query, then fetch the access token
        return fetch(`${BASE_URL}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'grant_type': 'authorization_code',
                'client_id': clientId,
                'code': code,
                'redirect_uri': redirect_uri,
                'code_verifier': localStorage.getItem("pkce_code_verifier"),
            })
        }).then(response => {
            return response.json();
        }).then(data => {

            // remove code details from URL
            window.history.replaceState({}, "", "/");

            // with the access token, we can now access the protected resource 
            localStorage.removeItem("pkce_code_verifier")
            accessToken = data.access_token;
            return null;

        }).catch(err => {
            console.log(err);
        });
    } else{
        // if there is no code in the query, then redirect to the authorization server
        let state = generateRandomString();
        let codeChallengeMethod = "S256";
        let CODE_VERIFIER = generateRandomString();
        localStorage.setItem("pkce_code_verifier", CODE_VERIFIER);
        let codeChallenge = await pkceChallengeFromVerifier(CODE_VERIFIER);
        let redirect_oauth_url = `${BASE_URL}/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirect_uri}&state=${encodeURIComponent(state)}&code_challenge=${encodeURIComponent(codeChallenge)}&code_challenge_method=${codeChallengeMethod}`;
        console.log(redirect_oauth_url);
        document.location = redirect_oauth_url;
    }
}

function subscribeToAuction(auctionId: string, messageCallback: (payload: BidType) => void) {
    return new Promise((resolve, reject) => {
        if(socket != null){
            socket.disconnect();
        }
        // connect to channel
        socket = new Socket(WS_URL, {
            // debug: true,
            params: { token: accessToken }
        });

        socket.connect();

        let channel = socket.channel(`auction:${auctionId}`, {});

        // Set up message event listener
        channel.on("outbid", (payload: any) => {
            console.log("Got message", payload);
            if (messageCallback) {
                messageCallback(payload.bid);
            }
        });

        // Join the channel
        channel.join()
            .receive("ok", (resp: any) => {
                console.log("Joined successfully", resp);
                resolve(channel); // Resolve with the channel on successful join
            })
            .receive("error", (resp: any) => {
                console.log("Unable to join", resp);
                if(socket != null){
                    socket.disconnect();
                }
                reject(resp); // Reject the promise on error
            });
    });
}

async function me() : Promise<UserType>{
    return fetch(`${BASE_URL}/api/v1/me`, {
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        },
    }).then(response => {
        if(response.status === 401){
            console.log("Unauthorized")
        } else {
            return response.json();
        }
    }).then(data => {
        console.log(data);
        return {
            id: data.id,
        };
    }).catch(err => {
        console.log("err", err);
        throw err;
    });
}

async function getAuctionById(id: string) : Promise<AuctionType> {
    return fetch(`${BASE_URL}/api/v1/auction/${id}`, {
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        }
    }).then(response => {
        if(response.status === 401){
            console.log("Unauthorized")
        }
        return response.json();
    }).then(data => {
        console.log(data);
        const bids = data.bids.map((bid: any) => {
            return {
                id: bid.id,
                amount: bid.amount,
                createdAt: bid.createdAt,
                newEndDate: bid.newEndDate,
                userAnonymousId: bid.userAnonymousId,
                participantId: bid.participantId,
            };
        })
        const highestBid = data.bids.reduce((acc: BidType, bid: BidType) => {
            return (bid.amount > acc.amount) ? bid : acc;
        }, {id: '', amount: 0, createdAt: '', newEndDate: 0, userAnonymousId: ''})
        return {
            id: data.id,
            startDate: data.startDate,
            endDate: data.endDate,
            startingPrice: data.startingPrice,
            step: data.step,
            bids: bids,
            highestBid: highestBid,
            agentEmail: data.agentEmail,
            agentPhone: data.agentPhone,
            isUserAllowed: data.isUserAllowed,
            isUserRegistered: data.isUserRegistered,
            currency: {
                symbol: data.currency.symbol,
                code: data.currency.code,
                isBefore: data.currency.isBefore,
            },
        };
    }).catch(err => {
        console.log("err", err);
        throw err;
    });
}

async function placeBidOnAuction(auction: AuctionType, amount: number) : Promise<BidType> {
    console.log(auction.id)
    return fetch(`${BASE_URL}/api/v1/bid`, {
        method: 'POST',
        body: JSON.stringify({
            auctionId: auction.id,
            amount: amount,
        }),
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        }
    }).then(response => {
        if(response.status === 401){
            console.log("Unauthorized")
        }
        if(response.status === 422){
            return response.json().then(data => {
                throw data;
            });
        }
        return response.json();
    }).then(data => {
        console.log(data.id);
        return {
            id: data.id,
            amount: data.amount,
            createdAt: data.createdAt,
            newEndDate: data.newEndDate,
            userAnonymousId: data.userAnonymousId,
            participantId: data.participantId,
        };
    }).catch(err => {
        console.log("err", err);
        throw err;
    });
}
async function oAuthIntrospect(){
    // call to introspect endpoint 
    // (doesn't seem to work with a bearer token, requires a basic token instead)
    fetch(`${BASE_URL}/oauth/introspect`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        }
    }).then(response => {
        if(response.status === 401){
            console.log("Unauthorized")
        }
        return response.json();
    }).then(data => {
        console.log(data);
    }).catch(err => {
        console.log("err", err);
    });
}

export default {initEIClient, getAuctionById, authenticate, subscribeToAuction, me, placeBidOnAuction, oAuthIntrospect}