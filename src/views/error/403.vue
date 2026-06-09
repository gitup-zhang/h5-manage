<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.back()
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">403</h1>
      <p class="error-message">抱歉，您没有权限访问此页面</p>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="goBack">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #fff;

  .error-content {
    text-align: center;

    .error-code {
      font-size: 120px;
      font-weight: 700;
      color: #409eff;
      line-height: 1;
    }

    .error-message {
      margin: 20px 0 32px;
      font-size: 18px;
      color: #606266;
    }

    .error-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
  }
}
</style>
