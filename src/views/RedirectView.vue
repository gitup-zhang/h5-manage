<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 从 /redirect/user/list 中提取 /user/list 并跳转回去
const pathSegments = route.params.path as string | string[]
const targetPath = '/' + (Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments)

router.replace({ path: targetPath })
</script>

<template>
  <div class="redirect-view" />
</template>
