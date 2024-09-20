import { COMMAND } from '@/constants';
import { type Config, getConfig } from '@/models/config';
import { invoke } from '@tauri-apps/api/core';
import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  const store = () => {
    const config = reactive<Config>(getConfig());
    let configLoaded = false;

    async function getAppConfig() {
      const data = await invoke<Config>(COMMAND.GET_CONFIG);
      Object.assign(config, data);
      configLoaded = true;
      return data;
    }

    watch(config, () => {
      invoke(COMMAND.WRITE_CONFIG, {
        data: {
          ...config,
        },
      });
    }, { deep: true });

    return {
      config,
      configLoaded,
      getAppConfig,
    };
  };

  return {
    ...store(),
  };
});
