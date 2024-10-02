// test/setup.js
import mockRequire from "mock-require";
import vscodeMock from "../test/vscodeMock.js";

mockRequire("vscode", vscodeMock);
