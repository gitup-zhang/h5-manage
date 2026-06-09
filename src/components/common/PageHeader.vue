<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="page-header">
    <div class="page-header-left">
      <h2 class="page-title">{{ title }}</h2>
      <p v-if="description" class="page-description">{{ description }}</p>
    </div>
    <div class="page-header-right">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .page-description {
    margin-top: 4px;
    font-size: 13px;
    color: #909399;
  }
}
</style>
