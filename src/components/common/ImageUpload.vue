<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Loading } from '@element-plus/icons-vue'
import { uploadFile, deleteFile } from '@/api/modules/file'

const props = withDefaults(
  defineProps<{
    /** 图片 URL */
    modelValue: string
    /** 文件 ID（用于删除） */
    fileId?: number
    /** 业务类型 */
    bizType?: string
    /** 业务 ID */
    bizId?: number
  }>(),
  {
    fileId: 0,
  },
)

const emit = defineEmits<{
  'update:modelValue': [url: string]
  'update:fileId': [id: number]
}>()

const uploading = ref(false)

/** 允许的图片格式 */
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml', 'image/avif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

function beforeUpload(file: File): boolean {
  if (!ALLOWED_TYPES.includes(file.type)) {
    ElMessage.error('仅支持 jpg、jpeg、png、gif、bmp、webp、svg、avif 格式')
    return false
  }
  if (file.size > MAX_SIZE) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  return true
}

/** 自定义上传：调用真实 API */
async function handleUpload(options: { file: File; onSuccess?: () => void; onError?: () => void }) {
  const file = options.file
  if (!beforeUpload(file)) {
    options.onError?.()
    return
  }

  uploading.value = true
  try {
    const res = await uploadFile(file, props.bizType || undefined, props.bizId || undefined)
    const { id, url } = res.data
    emit('update:fileId', id)
    emit('update:modelValue', url)
    ElMessage.success('上传成功')
    options.onSuccess?.()
  } catch {
    options.onError?.()
  } finally {
    uploading.value = false
  }
}

/** 移除图片 */
async function handleRemove() {
  if (props.fileId) {
    try {
      await deleteFile(props.fileId)
    } catch { /* ignore */ }
  }
  emit('update:fileId', 0)
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="image-upload-wrapper">
    <el-upload
      class="image-upload"
      :show-file-list="false"
      :http-request="handleUpload"
      accept="image/*"
      :disabled="uploading"
    >
      <!-- 已有图片：预览 -->
      <div v-if="modelValue" class="upload-preview">
        <img :src="modelValue" alt="preview" />
        <div class="upload-mask" @click.stop="handleRemove">
          <el-icon :size="20"><Delete /></el-icon>
        </div>
      </div>

      <!-- 上传中 -->
      <div v-else-if="uploading" class="upload-trigger uploading">
        <el-icon :size="28" class="is-loading"><Loading /></el-icon>
        <span>上传中...</span>
      </div>

      <!-- 空状态：点击上传 -->
      <div v-else class="upload-trigger">
        <el-icon :size="28"><Plus /></el-icon>
        <span>上传图片</span>
      </div>
    </el-upload>
  </div>
</template>

<style lang="scss" scoped>
.image-upload-wrapper {
  .upload-preview {
    position: relative;
    width: 148px;
    height: 148px;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .upload-mask {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.5);
      color: #fff;
      opacity: 0;
      transition: opacity 0.3s;
    }

    &:hover .upload-mask {
      opacity: 1;
    }
  }

  .upload-trigger {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 148px;
    height: 148px;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    color: #909399;
    cursor: pointer;

    &:hover {
      border-color: #409eff;
      color: #409eff;
    }

    &.uploading {
      cursor: not-allowed;
      color: #409eff;
      border-color: #409eff;
    }

    span {
      margin-top: 8px;
      font-size: 12px;
    }
  }
}
</style>
