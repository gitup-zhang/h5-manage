<script setup lang="ts">
import { reactive } from 'vue'

export interface SearchField {
  label: string
  prop: string
  type?: 'input' | 'select' | 'date' | 'daterange'
  placeholder?: string
  options?: { label: string; value: string | number }[]
}

const props = defineProps<{
  fields: SearchField[]
}>()

const emit = defineEmits<{
  search: [params: Record<string, unknown>]
  reset: []
}>()

const form = reactive<Record<string, unknown>>({})

function handleSearch() {
  // 过滤空值
  const params: Record<string, unknown> = {}
  for (const key of Object.keys(form)) {
    if (form[key] !== '' && form[key] !== null && form[key] !== undefined) {
      params[key] = form[key]
    }
  }
  emit('search', params)
}

function handleReset() {
  for (const key of Object.keys(form)) {
    form[key] = ''
  }
  emit('reset')
}
</script>

<template>
  <div class="search-form">
    <el-form :model="form" inline>
      <el-form-item v-for="field in fields" :key="field.prop" :label="field.label">
        <!-- 输入框 -->
        <el-input
          v-if="!field.type || field.type === 'input'"
          v-model="form[field.prop]"
          :placeholder="field.placeholder || `请输入${field.label}`"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
        <!-- 下拉选择 -->
        <el-select
          v-else-if="field.type === 'select'"
          v-model="form[field.prop]"
          :placeholder="field.placeholder || `请选择${field.label}`"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="opt in field.options"
            :key="String(opt.value)"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <!-- 日期 -->
        <el-date-picker
          v-else-if="field.type === 'date'"
          v-model="form[field.prop]"
          type="date"
          :placeholder="field.placeholder || '选择日期'"
          style="width: 200px"
        />
        <!-- 日期范围 -->
        <el-date-picker
          v-else-if="field.type === 'daterange'"
          v-model="form[field.prop]"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 280px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.search-form {
  background-color: #fff;
  padding: 16px 16px 0;
  border-radius: 4px;
  margin-bottom: 16px;
}
</style>
