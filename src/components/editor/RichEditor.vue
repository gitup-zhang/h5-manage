<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  editable: !props.disabled,
  extensions: [
    StarterKit,
    Image.configure({ allowBase64: true }),
    Placeholder.configure({
      placeholder: props.placeholder || '请输入内容...',
    }),
  ],
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    emit('update:modelValue', html)
  },
})
</script>

<template>
  <div class="rich-editor" :class="{ disabled }">
    <!-- 工具栏 -->
    <div v-if="editor && !disabled" class="editor-toolbar">
      <button
        :class="{ active: editor.isActive('bold') }"
        title="加粗"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <strong>B</strong>
      </button>
      <button
        :class="{ active: editor.isActive('italic') }"
        title="斜体"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <em>I</em>
      </button>
      <button
        :class="{ active: editor.isActive('strike') }"
        title="删除线"
        @click="editor.chain().focus().toggleStrike().run()"
      >
        <s>S</s>
      </button>
      <span class="divider" />
      <button
        :class="{ active: editor.isActive('heading', { level: 1 }) }"
        title="标题1"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        H1
      </button>
      <button
        :class="{ active: editor.isActive('heading', { level: 2 }) }"
        title="标题2"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>
      <button
        :class="{ active: editor.isActive('heading', { level: 3 }) }"
        title="标题3"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        H3
      </button>
      <span class="divider" />
      <button
        :class="{ active: editor.isActive('bulletList') }"
        title="无序列表"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        • List
      </button>
      <button
        :class="{ active: editor.isActive('orderedList') }"
        title="有序列表"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        1. List
      </button>
      <button
        :class="{ active: editor.isActive('blockquote') }"
        title="引用"
        @click="editor.chain().focus().toggleBlockquote().run()"
      >
        ❝
      </button>
      <span class="divider" />
      <button
        title="撤销"
        @click="editor.chain().focus().undo().run()"
      >
        ↶
      </button>
      <button
        title="重做"
        @click="editor.chain().focus().redo().run()"
      >
        ↷
      </button>
    </div>

    <!-- 编辑区 -->
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<style lang="scss" scoped>
.rich-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;

  &.disabled {
    .editor-content {
      :deep(.ProseMirror) {
        background-color: #f5f7fa;
      }
    }
  }

  .editor-toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px;
    padding: 8px;
    border-bottom: 1px solid #dcdfe6;
    background-color: #fafafa;

    button {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 4px;
      background: transparent;
      cursor: pointer;
      font-size: 13px;
      color: #606266;

      &:hover {
        background-color: #e4e7ed;
      }

      &.active {
        background-color: #d9ecff;
        color: #409eff;
      }
    }

    .divider {
      width: 1px;
      height: 20px;
      margin: 0 4px;
      background-color: #dcdfe6;
    }
  }

  .editor-content {
    :deep(.ProseMirror) {
      min-height: 300px;
      padding: 16px;
      outline: none;

      p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        color: #c0c4cc;
        pointer-events: none;
        float: left;
        height: 0;
      }

      h1 { font-size: 28px; }
      h2 { font-size: 24px; }
      h3 { font-size: 20px; }

      blockquote {
        border-left: 3px solid #dcdfe6;
        margin: 8px 0;
        padding: 4px 12px;
        color: #909399;
      }

      ul, ol {
        padding-left: 24px;
      }

      img {
        max-width: 100%;
        border-radius: 4px;
      }
    }
  }
}
</style>
