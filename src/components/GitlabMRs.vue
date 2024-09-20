<script setup lang="ts">
import type { MergeRequestSchemaWithBasicLabels } from '@gitbeaker/rest';
import { onMounted, onUnmounted, ref } from 'vue';
import { useGitlabService } from '../services/gitlab';
import { useGitlabStore } from '../stores/gitlab';

const gitlabStore = useGitlabStore();
const gitlabService = useGitlabService();

const url = ref('');
const token = ref('');
const interval = ref(1800);
const mrs = ref<MergeRequestSchemaWithBasicLabels[]>([]);

async function saveConfig() {
  await gitlabStore.setConfig(url.value, token.value, interval.value);
}

async function fetchMRs() {
  try {
    mrs.value = await getAssignedMRs();
  } catch (error) {
    console.error('获取MR失败:', error);
  }
}

const { getAssignedMRs, startAutoRefresh, stopAutoRefresh } = useGitlabService();

onMounted(async () => {
  await gitlabStore.loadConfig();
  url.value = gitlabStore.url;
  token.value = gitlabStore.token;
  interval.value = gitlabStore.interval;
  if (url.value && token.value) {
    await fetchMRs();
    startAutoRefresh(fetchMRs);
  }
});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<template>
  <div>
    <h2>GitLab配置</h2>
    <form @submit.prevent="saveConfig">
      <input v-model="url" placeholder="GitLab URL" required />
      <input
        v-model="token"
        type="password"
        placeholder="Personal Access Token"
        required
      />
      <input
        v-model.number="interval"
        type="number"
        placeholder="刷新间隔（秒）"
        required
      />
      <button type="submit">
        保存配置
      </button>
    </form>

    <h2>分配给我的MR</h2>
    <button @click="fetchMRs">
      刷新MR列表
    </button>
    <ul v-if="mrs.length">
      <li v-for="mr in mrs" :key="mr.id">
        {{ mr.title }} ({{ mr.web_url }})
      </li>
    </ul>
    <p v-else>
      没有找到分配给您的MR
    </p>
  </div>
</template>
