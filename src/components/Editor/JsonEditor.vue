<script setup lang="ts">
import { ref, watch } from 'vue'
import { useForgeStore } from '@/stores/forge'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import type { SlotManifest } from '@/types/manifest'

const forgeStore = useForgeStore()

// Local editor content
const editorContent = ref('')
const editorError = ref('')

// Debounce timer
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Initialize editor content from store
watch(() => forgeStore.manifest, (newManifest) => {
  if (newManifest) {
    editorContent.value = JSON.stringify(newManifest, null, 2)
  }
}, { immediate: true })

// Handle editor change with debounce
function handleEditorChange(value: string | undefined) {
  if (!value) return
  
  editorError.value = ''
  
  // Clear previous timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  // Set new debounce timer (100ms)
  debounceTimer = setTimeout(() => {
    try {
      const parsed = JSON.parse(value) as SlotManifest
      forgeStore.updateManifest(parsed)
      editorError.value = ''
    } catch (error) {
      editorError.value = error instanceof Error ? error.message : 'Invalid JSON format'
    }
  }, 100)
}

// Monaco editor options
const editorOptions = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 13,
  tabSize: 2,
  theme: 'vs-dark'
}
</script>

<template>
  <div class="json-editor-container">
    <div class="editor-header">
      <h3>Manifest Editor</h3>
      <div v-if="editorError" class="error-message">
        ⚠️ {{ editorError }}
      </div>
    </div>
    
    <VueMonacoEditor
      v-model:value="editorContent"
      language="json"
      :options="editorOptions"
      @change="handleEditorChange"
      class="monaco-editor"
    />
  </div>
</template>

<style scoped>
.json-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
}

.editor-header {
  padding: 1rem;
  background: #252526;
  border-bottom: 1px solid #3f3f46;
}

.editor-header h3 {
  margin: 0 0 0.5rem 0;
  color: #e4e4e7;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.error-message {
  color: #f87171;
  font-size: 0.75rem;
  font-family: 'Monaco', 'Menlo', monospace;
  padding: 0.5rem;
  background: rgba(248, 113, 113, 0.1);
  border-radius: 0.25rem;
  border-left: 3px solid #f87171;
}

.monaco-editor {
  flex: 1;
  min-height: 0;
}
</style>
