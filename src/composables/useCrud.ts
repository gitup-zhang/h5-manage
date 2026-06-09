import { ref, type Ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePagination } from './usePagination'
import type { PageResult } from '@/types/api'

interface CrudOptions<T> {
  /** 获取列表 API 函数 */
  fetchApi: (params: Record<string, unknown>) => Promise<{ data: PageResult<T> }>
  /** 删除 API 函数 */
  deleteApi?: (id: number) => Promise<unknown>
  /** 删除确认信息 */
  deleteMessage?: string
  /** 每页条数 */
  pageSize?: number
}

export function useCrud<T>(options: CrudOptions<T>) {
  const { fetchApi, deleteApi, deleteMessage = '确认删除？', pageSize = 10 } = options

  const tableData = ref<T[]>([]) as Ref<T[]>
  const searchParams = ref<Record<string, unknown>>({})
  const { pagination, loading, handlePageChange, handleSizeChange, setTotal, reset: _reset } =
    usePagination(pageSize)

  // 获取列表数据
  async function fetchData() {
    loading.value = true
    try {
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...searchParams.value,
      }
      const res = await fetchApi(params)
      tableData.value = res.data.list
      setTotal(res.data.total)
    } catch {
      tableData.value = []
    } finally {
      loading.value = false
    }
  }

  // 搜索
  function handleSearch(params: Record<string, unknown>) {
    searchParams.value = params
    pagination.page = 1
    fetchData()
  }

  // 重置搜索
  function handleReset() {
    searchParams.value = {}
    pagination.page = 1
    fetchData()
  }

  // 删除
  async function handleDelete(id: number) {
    if (!deleteApi) return
    try {
      await ElMessageBox.confirm(deleteMessage, '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      })
      await deleteApi(id)
      ElMessage.success('删除成功')
      // 如果删除后当前页无数据，回退到上一页
      if (tableData.value.length === 1 && pagination.page > 1) {
        pagination.page--
      }
      fetchData()
    } catch {
      // 取消操作或删除失败
    }
  }

  // 刷新
  function refresh() {
    fetchData()
  }

  return {
    tableData,
    searchParams,
    pagination,
    loading,
    fetchData,
    handleSearch,
    handleReset,
    handleDelete,
    handlePageChange,
    handleSizeChange,
    refresh,
  }
}
