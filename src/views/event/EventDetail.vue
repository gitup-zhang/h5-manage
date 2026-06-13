<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getEventDetail } from '@/api/modules/event'
import { formatDate } from '@/utils/format'
import type { EventDetail } from '@/types/user'

const route = useRoute()
const router = useRouter()

const eventId = Number(route.params.id)
const loading = ref(false)
const detail = ref<EventDetail | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    const res = await getEventDetail(eventId)
    detail.value = res.data
  } catch {
    detail.value = null
  } finally {
    loading.value = false
  }
})

function goBack() {
  router.back()
}
</script>

<template>
  <div class="event-detail" v-loading="loading">
    <div class="detail-header">
      <el-button :icon="ArrowLeft" text @click="goBack">返回列表</el-button>
    </div>

    <template v-if="detail">
      <!-- 封面图 -->
      <el-card shadow="never" class="cover-card">
        <img v-if="detail.cover_image_url" :src="detail.cover_image_url" class="cover-img" />
        <div class="cover-placeholder" v-else>暂无封面</div>
      </el-card>

      <!-- 基本信息 -->
      <el-card shadow="never" class="info-card">
        <template #header>
          <div class="card-header">
            <h2>{{ detail.title }}</h2>
            <el-tag :type="detail.status === '进行中' ? 'success' : 'info'" size="small">
              {{ detail.status }}
            </el-tag>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="活动开始时间">
            {{ formatDate(detail.event_start_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="活动结束时间">
            {{ formatDate(detail.event_end_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="报名开始时间">
            {{ formatDate(detail.registration_start_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="报名截止时间">
            {{ formatDate(detail.registration_end_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="活动地址">
            {{ detail.event_address }}
          </el-descriptions-item>
          <el-descriptions-item label="报名人数">
            {{ detail.current_registrants }}{{ detail.max_registrants > 0 ? ` / ${detail.max_registrants}` : ' / 不限' }}
            （剩余 {{ detail.remaining_quota }}）
          </el-descriptions-item>
          <el-descriptions-item label="邀请码">
            <span v-if="detail.invite_code">{{ detail.invite_code }}</span>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="是否需要邀请码">
            {{ detail.need_invite_code === 1 ? '需要' : '不需要' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 关联图片 -->
      <el-card shadow="never" class="info-card" v-if="detail.images?.length">
        <template #header>
          <span class="section-title">活动图片</span>
        </template>
        <div class="image-list">
          <img
            v-for="img in detail.images"
            :key="img.image_id"
            :src="img.url"
            class="detail-img"
          />
        </div>
      </el-card>

      <!-- 报名信息字段 -->
      <el-card shadow="never" class="info-card" v-if="detail.user_info?.length">
        <template #header>
          <span class="section-title">报名需填写信息</span>
        </template>
        <el-tag v-for="f in detail.user_info" :key="f.user_info_id" class="info-tag">
          {{ f.name }}
        </el-tag>
      </el-card>

      <!-- 关联领域 -->
      <el-card shadow="never" class="info-card" v-if="detail.fields?.length">
        <template #header>
          <span class="section-title">关联领域</span>
        </template>
        <el-tag v-for="f in detail.fields" :key="f.field_id" class="info-tag">
          {{ f.field_name }}
        </el-tag>
      </el-card>

      <!-- 活动详情 -->
      <el-card shadow="never" class="info-card">
        <template #header>
          <span class="section-title">活动详情</span>
        </template>
        <div class="detail-content" v-html="detail.detail"></div>
      </el-card>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.event-detail {
  .detail-header {
    margin-bottom: 16px;
  }

  .cover-card {
    margin-bottom: 16px;
    .cover-img {
      width: 100%;
      max-height: 320px;
      object-fit: cover;
      border-radius: 4px;
    }
    .cover-placeholder {
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #909399;
      background: #f5f7fa;
      border-radius: 4px;
    }
  }

  .info-card {
    margin-bottom: 16px;
    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      h2 {
        margin: 0;
        font-size: 18px;
        color: #303133;
      }
    }
    .section-title {
      font-weight: 600;
      color: #303133;
    }
  }

  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    .detail-img {
      width: 200px;
      height: 140px;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid #ebeef5;
    }
  }

  .info-tag {
    margin-right: 8px;
  }

  .detail-content {
    line-height: 1.8;
    :deep(img) {
      max-width: 100%;
    }
  }
}
</style>
