<script setup lang="ts">
import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart';
import { onMounted, ref, watch } from 'vue';

const autoStartEnabled = ref(false);
onMounted(async () => {
  autoStartEnabled.value = await isEnabled();
});

watch(autoStartEnabled, value => value ? enable() : disable());
</script>

<template>
  <div class="p-3 pb-0 text-white">
    <h1>
      Preferences
    </h1>
  </div>
</template>
