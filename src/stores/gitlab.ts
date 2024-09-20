import { invoke } from '@tauri-apps/api/core';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useGitlabStore = defineStore('gitlab', () => {
  const url = ref('');
  const token = ref('');
  const interval = ref(1800); // 默认30分钟

  async function setConfig(newUrl: string, newToken: string, newInterval: number) {
    url.value = newUrl;
    token.value = newToken;
    interval.value = newInterval;
    await invoke('save_gitlab_config', { url: newUrl, token: newToken, interval: newInterval });
  }

  async function loadConfig() {
    try {
      const config = await invoke('load_gitlab_config');
      url.value = config.url;
      token.value = config.token;
      interval.value = config.interval;
    } catch (error) {
      console.error('加载GitLab配置失败:', error);
    }
  }

  return { url, token, interval, setConfig, loadConfig };
});
