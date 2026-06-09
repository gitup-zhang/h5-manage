import { ref, reactive } from 'vue'

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export function usePagination(initialPageSize = 10) {
  const pagination = reactive<PaginationState>({
    page: 1,
    pageSize: initialPageSize,
    total: 0,
  })

  const loading = ref(false)

  function handlePageChange(page: number) {
    pagination.page = page
  }

  function handleSizeChange(size: number) {
    pagination.pageSize = size
    pagination.page = 1
  }

  function setTotal(total: number) {
    pagination.total = total
  }

  function reset() {
    pagination.page = 1
    pagination.pageSize = initialPageSize
    pagination.total = 0
  }

  return {
    pagination,
    loading,
    handlePageChange,
    handleSizeChange,
    setTotal,
    reset,
  }
}
