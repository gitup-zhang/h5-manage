<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import RichEditor from '@/components/editor/RichEditor.vue'
import { createMessage } from '@/api/modules/message'
import { getFieldList } from '@/api/modules/field'
import type { Field, MessageTargetType } from '@/types/user'

const router = useRouter()

// ===== 领域选项 =====
const fieldOptions = ref<Field[]>([])

onMounted(async () => {
  try {
    const res = await getFieldList({})
    fieldOptions.value = res.data || []
  } catch { /* ignore */ }
})

// ===== 表单 =====
const formRef = ref()
const loading = ref(false)
const form = reactive({
  title: '',
  content: '',
  target_type: 'ALL' as MessageTargetType,
  target_id: undefined as number | undefined,
})

const rules = {
  title: [
    { required: true, message: '请输入消息标题', trigger: 'blur' },
    { max: 100, message: '标题不超过100个字符', trigger: 'blur' },
  ],
  content: [
    { required: true, message: '请输入消息内容', trigger: 'blur' },
  ],
  target_type: [
    { required: true, message: '请选择目标类型', trigger: 'change' },
  ],
  target_id: [
    {
      required: true,
      message: '请选择目标领域',
      trigger: 'change',
      validator: (_rule: unknown, _value: unknown, callback: (err?: Error) => void) => {
        if (form.target_type === 'FIELD' && !form.target_id) {
          callback(new Error('请选择目标领域'))
        } else {
          callback()
        }
      },
    },
  ],
}

function goBack() {
  router.back()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const data: { title: string; content: string; target_type: MessageTargetType; target_id?: number } = {
      title: form.title,
      content: form.content,
      target_type: form.target_type,
    }
    if (form.target_type === 'FIELD') {
      data.target_id = form.target_id
    }
    await createMessage(data)
    ElMessage.success('消息发送成功')
    router.push('/redirect/message/list')
  } catch { /* 拦截器已处理 */ }
  finally {
    loading.value = false
  }
}

/** 切换目标类型时清除 target_id */
function onTargetTypeChange() {
  form.target_id = undefined
}
</script>

<template>
  <div class="message-create">
    <!-- 顶部操作栏 -->
    <div class="edit-header">
      <el-button :icon="ArrowLeft" text @click="goBack">返回列表</el-button>
      <div class="header-actions">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          发送消息
        </el-button>
      </div>
    </div>

    <el-card shadow="never">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="90px"
        style="max-width: 680px"
      >
        <el-form-item label="消息标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入消息标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="消息内容" prop="content">
          <RichEditor v-model="form.content" placeholder="请输入消息内容" />
        </el-form-item>

        <el-form-item label="目标类型" prop="target_type">
          <el-radio-group v-model="form.target_type" @change="onTargetTypeChange">
            <el-radio value="ALL">全体用户</el-radio>
            <el-radio value="FIELD">按领域推送</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="form.target_type === 'FIELD'"
          label="目标领域"
          prop="target_id"
        >
          <el-select
            v-model="form.target_id"
            placeholder="请选择目标领域"
            style="width: 100%"
          >
            <el-option
              v-for="fld in fieldOptions"
              :key="fld.id"
              :label="fld.field_name"
              :value="fld.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.message-create {
  .edit-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
}
</style>
