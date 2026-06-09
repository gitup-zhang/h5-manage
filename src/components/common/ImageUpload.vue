<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: string
  limit?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleChange(file: { raw?: File; url?: string }) {
  // TODO: 对接真实上传 API
  // 这里暂时使用本地预览
  if (file.raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      emit('update:modelValue', url)
    }
    reader.readAsDataURL(file.raw)
  }
}

function beforeUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}
</script>

<template>
  <el-upload
    class="image-upload"
    :show-file-list="false"
    :before-upload="beforeUpload"
    :http-request="handleChange"
    accept="image/*"
  >
    <div v-if="modelValue" class="upload-preview">
      <img :src="modelValue" alt="preview" />
      <div class="upload-mask">
        <el-icon :size="20"><Delete /></el-icon>
      </div>
    </div>
    <div v-else class="upload-trigger">
      <el-icon :size="28"><Plus /></el-icon>
      <span>上传图片</span>
    </div>
  </el-upload>
</template>

<style lang="scss" scoped>
.image-upload {
  .upload-preview {
    position: relative;
    width: 148px;
    height: 148px;
    border-radius: 4px;
    overflow: hidden;

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

    span {
      margin-top: 8px;
      font-size: 12px;
    }
  }
}
</style>
