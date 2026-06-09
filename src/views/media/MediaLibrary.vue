<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, PictureFilled, VideoPlay, Document, Delete } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { useCrud } from '@/composables/useCrud'
import { getMediaList, deleteMedia, type MediaFile } from '@/api/modules/media'
import { formatDate, formatFileSize } from '@/utils/format'

const viewMode = ref<'grid' | 'list'>('grid')

const { tableData, pagination, loading, fetchData, handleDelete } = useCrud<MediaFile>({
  fetchApi: getMediaList,
  deleteApi: deleteMedia,
  deleteMessage: '确认删除该文件？',
  pageSize: 12,
})

function getFileIcon(file: MediaFile) {
  if (file.mimeType?.startsWith('image/')) return PictureFilled
  if (file.mimeType?.startsWith('video/')) return VideoPlay
  return Document
}

function handleUpload() {
  // 触发隐藏的文件输入
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.accept = 'image/*,video/*'
  input.onchange = () => {
    if (input.files?.length) {
      ElMessage.success(`已选择 ${input.files.length} 个文件，对接后端上传 API 后生效`)
    }
  }
  input.click()
}

fetchData()
</script>

<template>
  <div class="media-library">
    <PageHeader title="媒体库" description="管理图片、视频等媒体资源">
      <template #default>
        <el-button-group class="view-toggle">
          <el-button
            :type="viewMode === 'grid' ? 'primary' : 'default'"
            size="small"
            @click="viewMode = 'grid'"
          >
            网格
          </el-button>
          <el-button
            :type="viewMode === 'list' ? 'primary' : 'default'"
            size="small"
            @click="viewMode = 'list'"
          >
            列表
          </el-button>
        </el-button-group>
        <el-button type="primary" :icon="Upload" @click="handleUpload">
          上传文件
        </el-button>
      </template>
    </PageHeader>

    <el-card v-loading="loading" shadow="never">
      <!-- 网格视图 -->
      <template v-if="viewMode === 'grid'">
        <div v-if="tableData.length > 0" class="media-grid">
          <div
            v-for="file in tableData"
            :key="file.id"
            class="media-card"
          >
            <div class="media-preview">
              <img
                v-if="file.mimeType?.startsWith('image/')"
                :src="file.url"
                :alt="file.name"
                loading="lazy"
              />
              <div v-else class="media-placeholder">
                <el-icon :size="40" color="#c0c4cc">
                  <component :is="getFileIcon(file)" />
                </el-icon>
              </div>
              <div class="media-overlay">
                <el-button
                  type="danger"
                  size="small"
                  circle
                  :icon="Delete"
                  @click="handleDelete(file.id)"
                />
              </div>
            </div>
            <div class="media-info">
              <span class="media-name" :title="file.name">{{ file.name }}</span>
              <span class="media-size">{{ formatFileSize(file.size) }}</span>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无媒体文件" />
      </template>

      <!-- 列表视图 -->
      <template v-else>
        <el-table :data="tableData" border stripe>
          <el-table-column label="预览" width="80">
            <template #default="{ row }">
              <img
                v-if="row.mimeType?.startsWith('image/')"
                :src="row.url"
                class="table-thumb"
              />
              <el-icon v-else :size="24" color="#909399">
                <component :is="getFileIcon(row)" />
              </el-icon>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="文件名" min-width="200" />
          <el-table-column prop="mimeType" label="类型" width="120" />
          <el-table-column label="大小" width="100">
            <template #default="{ row }">{{ formatFileSize(row.size) }}</template>
          </el-table-column>
          <el-table-column label="创建时间" width="170">
            <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button type="danger" size="small" link @click="handleDelete(row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[12, 24, 48]"
          layout="total, sizes, prev, pager, next"
          @current-change="fetchData"
          @size-change="fetchData"
        />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.media-library {
  .view-toggle {
    margin-right: 8px;
  }

  .media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  .media-card {
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;

    &:hover {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .media-preview {
    position: relative;
    height: 140px;
    background-color: #fafafa;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .media-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .media-overlay {
      position: absolute;
      top: 4px;
      right: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover .media-overlay {
      opacity: 1;
    }
  }

  .media-info {
    padding: 8px;

    .media-name {
      display: block;
      font-size: 13px;
      color: #303133;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .media-size {
      font-size: 12px;
      color: #909399;
    }
  }

  .table-thumb {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 4px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
