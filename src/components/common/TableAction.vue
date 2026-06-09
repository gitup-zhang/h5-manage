<script setup lang="ts">
import type { ButtonProps } from 'element-plus'

export interface ActionItem {
  label: string
  type?: ButtonProps['type']
  icon?: string
  permission?: string
  disabled?: boolean
  onClick: () => void
}

defineProps<{
  actions: ActionItem[]
}>()
</script>

<template>
  <div class="table-action">
    <template v-for="action in actions" :key="action.label">
      <el-button
        v-if="!action.permission"
        :type="action.type || 'default'"
        :disabled="action.disabled"
        size="small"
        @click="action.onClick"
      >
        {{ action.label }}
      </el-button>
      <el-button
        v-else
        v-permission="action.permission"
        :type="action.type || 'default'"
        :disabled="action.disabled"
        size="small"
        @click="action.onClick"
      >
        {{ action.label }}
      </el-button>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.table-action {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
