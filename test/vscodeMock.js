export const workspace = {
  workspaceFolders: [{ uri: { fsPath: "/mocked/workspace" } }],
  getConfiguration: () => ({
    get: () => [],
  }),
};

export const window = {
  showInformationMessage: () => {},
  showErrorMessage: (message) => {
    console.error(`VS Code Error: ${message}`);
  },
};

export const env = {
  clipboard: {
    writeText: async () => {},
  },
};

export const commands = {
  registerCommand: () => ({
    dispose: () => {},
  }),
};

export class Disposable {
  constructor(func) {
    this.dispose = func;
  }
}
