import { ref, computed, type Ref } from 'vue'

export function useTable<T>(rowKey = 'id') {
  const selectedRows = ref<T[]>([]) as Ref<T[]>

  const selectedIds = computed(() =>
    selectedRows.value.map((row) => (row as Record<string, unknown>)[rowKey] as number),
  )

  function handleSelectionChange(rows: T[]) {
    selectedRows.value = rows
  }

  function clearSelection() {
    selectedRows.value = []
  }

  return {
    selectedRows,
    selectedIds,
    handleSelectionChange,
    clearSelection,
  }
}
