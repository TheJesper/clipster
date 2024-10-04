import mockRequire from "mock-require";
import * as vscodeMock from "../test/vscodeMock.js";

// Ensure the 'env' object exists
if (!vscodeMock.env) {
  vscodeMock.env = {}; // Initialize 'env' if it doesn't exist
}

// Mock the clipboard functionality in the 'env' object
vscodeMock.env.clipboard = {
  writeText: async (text) => {
    console.log(`Mock clipboard: ${text} copied to clipboard`);
  },
};

mockRequire("vscode", vscodeMock);
