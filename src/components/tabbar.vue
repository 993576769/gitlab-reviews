<script setup lang="ts">
import Icon from '@/components/icon.vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
</script>

<template>
  <div class="btm-nav h-10 text-white static">
    <button
      class="text-gray-400 hover:text-white"
      :class="{ active: route.name === 'Home' }"
      @click="router.push({ name: 'Home' })"
    >
      <Icon
        name="home"
        class="size-5"
        :class="{ 'text-white': route.name === 'Home' }"
      />
    </button>
  </div>
</template>
