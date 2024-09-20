export interface Config {
  key: string;
}

export function getConfig(): Config {
  return {
    key: '',
  };
}
