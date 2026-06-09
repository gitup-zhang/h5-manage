import type { FormItemRule } from 'element-plus'

/** 常用表单校验规则 */
export const validateRules: Record<string, FormItemRule> = {
  required: { required: true, message: '此项为必填项', trigger: 'blur' },
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入正确的手机号',
    trigger: 'blur',
  },
  email: {
    type: 'email',
    message: '请输入正确的邮箱地址',
    trigger: 'blur',
  },
  url: {
    type: 'url',
    message: '请输入正确的URL地址',
    trigger: 'blur',
  },
}
