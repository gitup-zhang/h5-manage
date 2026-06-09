<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Close } from '@element-plus/icons-vue'
import { useTagsViewStore, type TagView } from '@/stores/tagsView'

const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()

const visitedViews = computed(() => tagsViewStore.visitedViews)

function isActive(view: TagView): boolean {
  return view.path === route.path
}

function handleClick(view: TagView) {
  router.push({ path: view.path, query: view.query as Record<string, string | string[]> })
}

function handleClose(view: TagView) {
  const result = tagsViewStore.removeView(view)
  if (result && isActive(view)) {
    // 如果关闭的是当前页，跳转到最后一个标签
    const lastPath = result.lastPath || '/dashboard'
    router.push(lastPath)
  }
}

function handleContextMenu(_e: MouseEvent, _view: TagView) {
  // 右键菜单（可扩展：关闭其他、关闭所有等）
}
</script>

<template>
  <div v-if="visitedViews.length > 0" class="tags-view">
    <div class="tags-scroll">
      <span
        v-for="view in visitedViews"
        :key="view.path"
        :class="['tag-item', { active: isActive(view) }]"
        @click="handleClick(view)"
        @contextmenu.prevent="handleContextMenu($event, view)"
      >
        <span class="tag-title">{{ view.title }}</span>
        <el-icon
          v-if="visitedViews.length > 1"
          class="tag-close"
          :size="12"
          @click.stop="handleClose(view)"
        >
          <Close />
        </el-icon>
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tags-view {
  height: 34px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

  .tags-scroll {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 8px;
    overflow-x: auto;
    white-space: nowrap;
  }

  .tag-item {
    display: inline-flex;
    align-items: center;
    height: 26px;
    padding: 0 10px;
    margin-right: 4px;
    font-size: 12px;
    color: #606266;
    background-color: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    cursor: pointer;
    user-select: none;

    &.active {
      color: #409eff;
      background-color: #ecf5ff;
      border-color: #d9ecff;
    }

    &:hover {
      color: #409eff;
    }

    .tag-close {
      margin-left: 4px;
      border-radius: 50%;

      &:hover {
        color: #fff;
        background-color: #c0c4cc;
      }
    }
  }
}
</style>
