<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import RichEditor from '@/components/editor/RichEditor.vue'
import ImageUpload from '@/components/common/ImageUpload.vue'
import { getArticleDetail, createArticle, updateArticle, getCategoryTree, type Category } from '@/api/modules/article'

const router = useRouter()
const route = useRoute()

const isEdit = ref(false)
const editId = ref(0)
const loading = ref(false)
const categories = ref<Category[]>([])

const form = ref<{
  title: string
  content: string
  summary: string
  cover: string
  categoryId: number | undefined
  tags: string[]
  status: 0 | 1 | 2
}>({
  title: '',
  content: '',
  summary: '',
  cover: '',
  categoryId: undefined,
  tags: [],
  status: 0,
})

const rules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
}

const formRef = ref()

onMounted(async () => {
  // 加载分类
  try {
    const res = await getCategoryTree()
    categories.value = res.data
  } catch { /* ignore */ }

  // 编辑模式
  const id = route.params.id as string
  if (id) {
    isEdit.value = true
    editId.value = Number(id)
    loading.value = true
    try {
      const res = await getArticleDetail(editId.value)
      form.value = {
        title: res.data.title,
        content: res.data.content,
        summary: res.data.summary,
        cover: res.data.cover,
        categoryId: res.data.categoryId,
        tags: res.data.tags || [],
        status: res.data.status,
      }
    } catch { /* ignore */ }
    finally { loading.value = false }
  }
})

async function handleSubmit(status: 0 | 1 | 2) {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  form.value.status = status

  try {
    if (isEdit.value) {
      await updateArticle(editId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await createArticle(form.value)
      ElMessage.success('创建成功')
    }
    router.push('/content/articles')
  } catch { /* ignore */ }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="article-edit" v-loading="loading">
    <div class="edit-header">
      <el-button :icon="ArrowLeft" text @click="goBack">返回列表</el-button>
      <div class="header-actions">
        <el-button @click="handleSubmit(0)">保存草稿</el-button>
        <el-button type="primary" @click="handleSubmit(1)">发布</el-button>
      </div>
    </div>

    <el-card shadow="never">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="标题" prop="title">
              <el-input
                v-model="form.title"
                placeholder="请输入文章标题"
                size="large"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分类" prop="categoryId">
              <el-tree-select
                v-model="form.categoryId"
                :data="categories"
                :props="{ label: 'name', value: 'id', children: 'children' }"
                placeholder="请选择分类"
                check-strictly
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="摘要">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入文章摘要"
          />
        </el-form-item>

        <el-form-item label="封面图">
          <ImageUpload v-model="form.cover" />
        </el-form-item>

        <el-form-item label="标签">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            placeholder="请输入标签后回车"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <RichEditor
            v-model="form.content"
            placeholder="请输入文章内容..."
          />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.article-edit {
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
