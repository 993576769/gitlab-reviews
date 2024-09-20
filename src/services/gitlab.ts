import { Gitlab } from '@gitbeaker/rest';
import { onMounted, onUnmounted, ref } from 'vue';
import { useGitlabStore } from '../stores/gitlab';

export function useGitlabService() {
  const gitlabStore = useGitlabStore();
  let intervalId: number | null = null;

  function getClient() {
    if (!gitlabStore.url || !gitlabStore.token) {
      throw new Error('GitLab配置未设置');
    }
    return new Gitlab({
      host: gitlabStore.url,
      token: gitlabStore.token,
    });
  }

  async function getAssignedMRs() {
    const client = getClient();
    const mrs = await client.MergeRequests.all({
      scope: 'assigned_to_me',
      state: 'opened',
    });
    return mrs;
  }

  function startAutoRefresh(callback: () => void) {
    stopAutoRefresh();
    intervalId = window.setInterval(() => {
      callback();
    }, gitlabStore.interval * 1000);
  }

  function stopAutoRefresh() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  onUnmounted(() => {
    stopAutoRefresh();
  });

  return { getAssignedMRs, startAutoRefresh, stopAutoRefresh };
}
