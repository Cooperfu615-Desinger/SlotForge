import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DEFAULT_TEMPLATE_ID, TEMPLATES } from '../templateRegistry'

export const useEditorStore = defineStore('editor', () => {
  const selectedElementId = ref<string | null>(null)
  const currentTemplateId = ref<string>(DEFAULT_TEMPLATE_ID)

  const setSelected = (id: string | null) => {
    selectedElementId.value = id
  }

  const loadTemplate = (templateId: string) => {
    if (TEMPLATES[templateId]) {
      currentTemplateId.value = templateId
      console.log(`[Editor] Loaded template: ${templateId}`)
      return
    }

    console.warn(`[Editor] Template not found: ${templateId}`)
  }

  return {
    selectedElementId,
    currentTemplateId,
    setSelected,
    loadTemplate,
  }
})
