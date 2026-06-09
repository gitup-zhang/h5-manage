import dayjs from 'dayjs'

/**
 * 格式化日期
 */
export function formatDate(
  date: string | number | Date | undefined,
  format = 'YYYY-MM-DD HH:mm:ss',
): string {
  if (!date) return '-'
  return dayjs(date).format(format)
}

/**
 * 格式化文件大小
 */
export function formatFileSize(size: number): string {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + ' MB'
  return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

/**
 * 数字千分位
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
