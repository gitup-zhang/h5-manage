<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import ImageUpload from '@/components/common/ImageUpload.vue'
import { getEventDetail, createEvent, updateEvent } from '@/api/modules/event'
import { getFieldList } from '@/api/modules/field'
import type { Field } from '@/types/user'

const router = useRouter()
const route = useRoute()

const isEdit = ref(false)
const editId = ref(0)
const loading = ref(false)
const fieldOptions = ref<Field[]>([])

/** 用户报名信息字段选项：单位、部门、职位、行业，ID 分别为 1-4 */
const userInfoFieldOptions = [
  { id: 1, name: '单位' },
  { id: 2, name: '部门' },
  { id: 3, name: '职位' },
  { id: 4, name: '行业' },
]

const formRef = ref()
const form = reactive({
  title: '',
  detail: '',
  event_start_time: '',
  event_end_time: '',
  registration_start_time: '',
  registration_end_time: '',
  max_registrants: 0,
  event_address: '',
  cover_image_url: '',
  cover_file_id: 0,
  need_invite_code: 2,
  field_id_list: [] as number[],
  image_id_list: [] as number[],
  user_info_id_list: [] as number[],
})

const rules = {
  title: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
  detail: [{ required: true, message: '请输入活动详情', trigger: 'blur' }],
  event_start_time: [{ required: true, message: '请选择活动开始时间', trigger: 'change' }],
  event_end_time: [{ required: true, message: '请选择活动结束时间', trigger: 'change' }],
  registration_start_time: [{ required: true, message: '请选择报名开始时间', trigger: 'change' }],
  registration_end_time: [{ required: true, message: '请选择报名截止时间', trigger: 'change' }],
  event_address: [{ required: true, message: '请输入活动地址', trigger: 'blur' }],
}

onMounted(async () => {
  // 加载领域列表
  try {
    const res = await getFieldList({ enable: 1 })
    fieldOptions.value = res.data
  } catch { /* ignore */ }

  // 编辑模式
  const id = route.params.id as string
  if (id) {
    isEdit.value = true
    editId.value = Number(id)
    loading.value = true
    try {
      const res = await getEventDetail(editId.value)
      const d = res.data
      form.title = d.title
      form.detail = d.detail
      form.event_start_time = formatForInput(d.event_start_time)
      form.event_end_time = formatForInput(d.event_end_time)
      form.registration_start_time = formatForInput(d.registration_start_time)
      form.registration_end_time = formatForInput(d.registration_end_time)
      form.max_registrants = d.max_registrants
      form.event_address = d.event_address
      form.cover_image_url = d.cover_image_url
      form.need_invite_code = d.need_invite_code
      form.field_id_list = d.fields?.map((f) => f.field_id) || []
      form.image_id_list = d.images?.map((img) => img.image_id) || []
      form.user_info_id_list = d.user_info?.map((u) => u.user_info_id) || []
    } catch { /* ignore */ }
    finally { loading.value = false }
  }
})

/** ISO 8601 时间转为 datetime-local 输入格式 (YYYY-MM-DDTHH:mm:ss) */
function formatForInput(iso: string): string {
  if (!iso) return ''
  // API 返回 "2026-07-01T09:00:00Z"，取前 19 位保留 T
  return iso.substring(0, 19)
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    const fmt = (v: string) => v.replace('T', ' ') // YYYY-MM-DDTHH:mm:ss → YYYY-MM-DD HH:mm:ss
    const data: Record<string, unknown> = {
      ...form,
      event_start_time: fmt(form.event_start_time),
      event_end_time: fmt(form.event_end_time),
      registration_start_time: fmt(form.registration_start_time),
      registration_end_time: fmt(form.registration_end_time),
    }
    // 如果未选择任何信息字段，不传该参数
    if (!form.user_info_id_list.length) {
      delete data.user_info_id_list
    }

    if (isEdit.value) {
      await updateEvent(editId.value, data)
      ElMessage.success('更新成功')
    } else {
      await createEvent(data)
      ElMessage.success('创建成功')
    }
    router.push('/event/list')
  } catch { /* ignore */ }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="event-edit" v-loading="loading">
    <div class="edit-header">
      <el-button :icon="ArrowLeft" text @click="goBack">返回列表</el-button>
      <div class="header-actions">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" @click="handleSubmit">
          {{ isEdit ? '更新活动' : '创建活动' }}
        </el-button>
      </div>
    </div>

    <el-card shadow="never">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入活动标题" />
        </el-form-item>

        <!-- 时间 -->
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="活动开始时间" prop="event_start_time">
              <el-date-picker
                v-model="form.event_start_time"
                type="datetime"
                placeholder="选择开始时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DDTHH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动结束时间" prop="event_end_time">
              <el-date-picker
                v-model="form.event_end_time"
                type="datetime"
                placeholder="选择结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DDTHH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="报名开始时间" prop="registration_start_time">
              <el-date-picker
                v-model="form.registration_start_time"
                type="datetime"
                placeholder="选择报名开始时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DDTHH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报名截止时间" prop="registration_end_time">
              <el-date-picker
                v-model="form.registration_end_time"
                type="datetime"
                placeholder="选择报名截止时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DDTHH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="活动地址" prop="event_address">
              <el-input v-model="form.event_address" placeholder="请输入活动地址" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="报名上限">
              <el-input-number v-model="form.max_registrants" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="邀请码">
              <el-switch
                v-model="form.need_invite_code"
                :active-value="1"
                :inactive-value="2"
                active-text="需要"
                inactive-text="不需要"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="封面图">
          <ImageUpload
            v-model="form.cover_image_url"
            v-model:file-id="form.cover_file_id"
            biz-type="EVENT"
          />
        </el-form-item>

        <el-form-item label="关联领域">
          <el-select
            v-model="form.field_id_list"
            multiple
            placeholder="请选择关联领域"
            style="width: 100%"
          >
            <el-option
              v-for="f in fieldOptions"
              :key="f.id"
              :label="f.field_name"
              :value="f.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="报名信息字段">
          <el-select
            v-model="form.user_info_id_list"
            multiple
            placeholder="请选择用户报名时需填写的信息字段"
            style="width: 100%"
          >
            <el-option
              v-for="f in userInfoFieldOptions"
              :key="f.id"
              :label="f.name"
              :value="f.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="活动详情" prop="detail">
          <el-input
            v-model="form.detail"
            type="textarea"
            :rows="6"
            placeholder="请输入活动详情..."
          />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.event-edit {
  .edit-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }
}
</style>
