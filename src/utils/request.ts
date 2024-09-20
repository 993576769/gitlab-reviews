import { useSettingsStore } from '@/stores/settings';
import { fetch } from '@tauri-apps/plugin-http';
import { stringify } from 'qs';

const baseURL = 'https://api.unsplash.com';
function request<T>(path: string, fetchOptions: any): Promise<T> {
  const settingsStore = useSettingsStore();

  const options = {
    headers: {
      'Authorization': `Client-ID ${settingsStore.config.key}`,
      'Content-Type': 'application/json',
    },
    ...fetchOptions,
  };
  const url = `${baseURL}${path}?${stringify(options.query, { arrayFormat: 'brackets' })}`;
  return fetch(url, options).then((res) => {
    if (res.ok) {
      return res.json();
    } else {
      throw new Error(res.statusText);
    }
  });
}

export { request };
