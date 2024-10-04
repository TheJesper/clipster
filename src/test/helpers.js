// File: src/test/helpers.js
// Version: 1.0.5

import os from "os";
import path from "path";
import logger from "../logger.js";

// Helper to normalize line endings for system consistency
export const systemLineEnding = (str) => {
  if (str === undefined || str === null) {
    logger.error("[systemLineEnding] Received undefined or null string");
    return os.EOL;
  }
  return str.replace(/\r\n|\n/g, os.EOL);
};

// Helper to get system line ending
export const getSystemLineEnding = () => os.EOL;

// Helper to normalize slashes for system consistency
export const normalizeSlashes = (str) => {
  if (str === undefined || str === null) {
    logger.error("[normalizeSlashes] Received undefined or null string");
    return "";
  }
  return str.replace(/[\\/]/g, path.sep);
};
