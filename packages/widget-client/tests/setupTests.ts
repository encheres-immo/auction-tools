import { vi, Mock } from "vitest";
import { config } from "../index.js";

  // Reset configuration before each test
  export function reset_config(accessToken: string | null = null) {
    config.BASE_URL = "http://localhost:4000";
    config.WS_URL = "ws://localhost:4000/api/socket";
    config.clientId = "test-client-id";
    config.accessToken = accessToken;
  
    (fetch as Mock).mockReset();
    vi.spyOn(console, "log").mockImplementation(() => {});
  }

// Mock global fetch function
vi.stubGlobal("fetch", vi.fn());

// Mock the Phoenix socket used to connect to the backend
vi.mock("phoenix", () => {
  return {
    Socket: vi.fn().mockImplementation(() => {
      return {
        connect: vi.fn(),
        channel: vi.fn().mockReturnValue({
          join: vi.fn().mockReturnThis(),
          receive: vi.fn().mockReturnThis(),
          on: vi.fn(),
        }),
        disconnect: vi.fn(),
      };
    }),
  };
});
