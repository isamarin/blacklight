declare global {
  interface Window {
    isElectron?: boolean;
  }
  const electron: {
    isElectron: boolean;
  }

  const greenlight: {}
}

export {};