import { config } from "../index.js";
import type { UserType } from "../types.js";

/**
 * Returns the new registration URL.
 */
export function registration(): string {
  const cleanRedirectUrl = window.location.origin + window.location.pathname;
  return `${config.BASE_URL}/registration/new?org_id=${config.clientId}&user_return_to=${cleanRedirectUrl}`;
}

/**
 * Handles the OAuth2 authentication process by either fetching an access token using an
 * authorization code or redirecting the user to the authorization server to obtain it.
 */
export async function authenticate() {
  // Try to use the stored access token if it exists
  const storedToken = localStorage.getItem("auction_widget_access_token");
  if (storedToken) {
    config.accessToken = storedToken;
    return;
  }
  // Get the current URL and extract the OAuth code from the query string
  const url = window.location.href || "";
  const parsedUrl = new URL(url);
  const params = parsedUrl.searchParams;
  const code = params.get("code");
  // WARNING: This is a lazy fix to avoid this type of error ->
  // https://github.com/encheres-immo/auction-widget/issues/52
  // If, in the future, we need to conserve params and anchor during the redirection,
  // we will need to remove this line and find a better solution.
  const cleanRedirectUrl = window.location.origin + window.location.pathname;

  // Try to extract the OAuth code from the query string
  if (code) {
    parsedUrl.search = "";

    window.history.replaceState({}, "", parsedUrl);

    // If there is a code in the query, then fetch the access token
    return fetch(`${config.BASE_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: config.clientId,
        code: code,
        redirect_uri: cleanRedirectUrl,
        code_verifier: localStorage.getItem(
          "auction_widget_pkce_code_verifier"
        ),
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // With the access token, we can now access the protected resource
        localStorage.removeItem("auction_widget_pkce_code_verifier");
        config.accessToken = data.access_token;
        // Store the token so User can be authenticated on future visits
        localStorage.setItem("auction_widget_access_token", data.access_token);
        return null;
      })
      .catch((err) => {
        console.error("Auction Widget: ", err);
        console.error("Auction Widget: ", err);
      });
  } else {
    // If there is no code in the query, then redirect to the authorization server
    let state = generateRandomString();
    let codeChallengeMethod = "S256";
    let CODE_VERIFIER = generateRandomString();
    localStorage.setItem("auction_widget_pkce_code_verifier", CODE_VERIFIER);
    let codeChallenge = await pkceChallengeFromVerifier(CODE_VERIFIER);
    let redirect_oauth_url = `${config.BASE_URL}/oauth/authorize?response_type=code&client_id=${config.clientId}&redirect_uri=${cleanRedirectUrl}&state=${encodeURIComponent(state)}&code_challenge=${encodeURIComponent(codeChallenge)}&code_challenge_method=${codeChallengeMethod}`;
    window.location.assign(redirect_oauth_url);
  }
}

/**
 * Fetches the authenticated user's details.
 */
export async function me(): Promise<UserType | undefined> {
  try {
    const response = await fetch(`${config.BASE_URL}/api/v1/me`, {
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
      },
    });

    if (response.status === 401) {
      console.error("Auction Widget: Unauthorized request");
      // Clear the stored access token since it's invalid
      localStorage.removeItem("auction_widget_access_token");
      return undefined;
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        "Auction Widget: ",
        errorData.error || "Error fetching user details"
      );
      return undefined;
    }

    const data = await response.json();
    if (!data || !data.id) {
      console.error("Auction Widget: Invalid user data");
      return undefined;
    }

    return {
      id: data.id,
      email: data.email,
    };
  } catch (error) {
    console.error("Auction Widget: Error fetching user details. ", error);
    return undefined;
  }
}

/**
 * Generates a SHA-256 hash of the input string.
 */
function sha256(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);

  return window.crypto.subtle.digest("SHA-256", data);
}

/**
 * Base64-url encodes the input string.
 */
function base64urlencode(str: ArrayBuffer) {
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(str))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Returns the base64-url-encoded SHA-256 hash for the PKCE challenge.
 */
async function pkceChallengeFromVerifier(v: string) {
  const hashed = await sha256(v);
  return base64urlencode(hashed);
}

/**
 * Generates a random string used for PKCE code verifier and state parameters.
 */
function generateRandomString() {
  const array = new Uint32Array(28);
  window.crypto.getRandomValues(array);

  return Array.from(array, (dec) => ("0" + dec.toString(16)).substr(-2)).join(
    ""
  );
}
