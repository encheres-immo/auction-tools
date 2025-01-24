import { beforeEach, afterEach, describe, expect, it, vi, Mock } from "vitest";
import { authenticate, me } from "../src/auth.js";
import { config } from "../index.js";
import { reset_config } from "./setupTests.js";

describe("Authentication", () => {
  beforeEach(() => {
    reset_config();
    localStorage.clear();

    // Set window.location.href
    const originalLocation = window.location;
    let localeUrl = new URL("https://example.com");
    delete (window as any).location;
    (window as any).location = {
      ...originalLocation,
      get href() {
        return localeUrl.href;
      },
      get origin() {
        return localeUrl.origin;
      },
      get pathname() {
        return localeUrl.pathname;
      },
      set href(value) {
        localeUrl = new URL(value);
      },
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
    };
    window.history.replaceState = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should fetch access token when code is in URL", async () => {
    // Set window.location.href with code parameter
    window.location.href = "https://example.com/?code=test-code";

    // Set code_verifier in localStorage
    localStorage.setItem("pkce_code_verifier", "test-code-verifier");

    // Mock fetch to return access token
    (fetch as Mock).mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({ access_token: "test-access-token" }),
    });

    await authenticate();

    // Check that fetch was called with correct parameters
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:4000/oauth/token",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: "test-client-id",
          code: "test-code",
          redirect_uri: "https://example.com/?code=test-code",
          code_verifier: "test-code-verifier",
        }),
      })
    );

    // Check that accessToken is set
    expect(config.accessToken).toBe("test-access-token");

    // Check that pkce_code_verifier is removed from localStorage
    expect(localStorage.getItem("pkce_code_verifier")).toBeNull();

    // Check that window.history.replaceState was called to remove code from URL
    expect(window.history.replaceState).toHaveBeenCalled();
  });

  it("should redirect to authorization server when no code in URL", async () => {
    const assignSpy = vi.spyOn(window.location, "assign");

    await authenticate();

    expect(assignSpy).toHaveBeenCalledWith(
      expect.stringContaining("/oauth/authorize")
    );
    expect(assignSpy).toHaveBeenCalledWith(
      expect.stringContaining("response_type=code")
    );
    expect(assignSpy).toHaveBeenCalledWith(
      expect.stringContaining("client_id=test-client-id")
    );
  });
});

describe("User Information", () => {
  beforeEach(() => {
    reset_config("test-access-token");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should fetch user details successfully", async () => {
    // Mock fetch to return user data
    (fetch as Mock).mockResolvedValue({
      ok: true, // Ensure response.ok is true
      status: 200,
      json: () => Promise.resolve({ id: "user-id" }),
    });

    const user = await me();

    // Check that fetch was called with correct parameters
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:4000/api/v1/me",
      expect.objectContaining({
        headers: {
          Authorization: "Bearer test-access-token",
        },
      })
    );

    // Check that user data is returned correctly
    expect(user).toEqual({ id: "user-id" });
  });

  it("should handle unauthorized response", async () => {
    // Mock fetch to return 401 Unauthorized
    (fetch as Mock).mockResolvedValue({
      status: 401,
      json: () => Promise.resolve({ error: "Unauthorized" }),
    });

    const consoleLogSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const user = await me();

    // Check that 'Unauthorized' is logged
    expect(consoleLogSpy).toHaveBeenCalledWith("Unauthorized");

    // Check that user is undefined
    expect(user).toBeUndefined();
  });
});
