<script setup lang="ts">
import { useCategoriesStore } from '@/stores/categories'
import e from 'express'
import { onMounted } from 'vue'
import { onUnmounted } from 'vue'
import { nextTick } from 'vue'
import { ref, type Ref } from 'vue'
import { VTextarea } from 'vuetify/components'
const categoriesStore = useCategoriesStore()
const props = defineProps<{
  categories?: string[]
}>()
const emits = defineEmits<{
  categoriesChanged: [categories: string[]]
}>()

const selectedCategories = ref<string[]>(props.categories ?? [])
const inputText = ref<string>(props.categories?.join(', ') ?? '')

const suggestedCategories = ref<string[]>([])
const selectedSuggestion = ref(0)
const showSuggestions = ref(false)

const textareaRef = ref<VTextarea | null>(null)
const parentRef = ref<HTMLDivElement | null>(null)

const tagStr =
  'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNMйцукенгшщзхъфывапролджэячсмитьбюЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ0123456789-_'

const onChange = (e: KeyboardEvent) => {
  const { key } = e
  if (key === 'Backspace' || tagStr.includes(key)) {
    const value = textareaRef.value?.modelValue as string
    console.log(value)
    const chunks = value.split(',')
    const lastChunk = chunks[chunks.length - 1].trim()
    if (lastChunk) {
      const filteredCategories = categoriesStore.categories
        .filter((x) => x.includes(lastChunk))
        .slice(0, 10)
      suggestedCategories.value = filteredCategories
      selectedSuggestion.value = 0
      showSuggestions.value = filteredCategories.length !== 0
    } else {
      showSuggestions.value = false
    }

    const newCategories = chunks.map((x) => x.trim()).filter((x) => Boolean(x))
    selectedCategories.value = newCategories
    emits('categoriesChanged', newCategories)
  } else {
    showSuggestions.value = false
  }
}

const onPaste = (e: ClipboardEvent) => {
  const data = e.clipboardData?.getData('text') ?? ''
  const items = data
    .split(',')
    .map((x) => x.trim())
    .filter((x) => Boolean(x))
  selectedCategories.value = items
  emits('categoriesChanged', items)
}

const suggestUp = (e: KeyboardEvent) => {
  if (showSuggestions.value) {
    e.preventDefault()

    if (selectedSuggestion.value > 0) {
      selectedSuggestion.value -= 1
    }
  }
}

const suggestDown = (e: KeyboardEvent) => {
  if (showSuggestions.value) {
    e.preventDefault()

    if (selectedSuggestion.value < suggestedCategories.value.length - 1) {
      selectedSuggestion.value += 1
    }
  }
}

const suggestSelected = () => {
  const index = selectedSuggestion.value
  const value = textareaRef.value?.modelValue as string
  const newCategories = value
    .split(',')
    .map((x) => x.trim())
    .filter((x) => Boolean(x))

  newCategories.splice(newCategories.length - 1, 1, suggestedCategories.value[index])

  selectedCategories.value = newCategories
  emits('categoriesChanged', newCategories)

  nextTick().then(() => {
    inputText.value = newCategories.join(', ')
    showSuggestions.value = false
  })
}

const onEnter = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    if (showSuggestions.value) {
      e.preventDefault()
      suggestSelected()
    }
  }
}

const checkBlur = (e: MouseEvent) => {
  if (parentRef.value && e.target) {
    const contains = parentRef.value.contains(e.target as Node)

    if (!contains) {
      showSuggestions.value = false
    }
  } else {
    showSuggestions.value = false
  }
}

onMounted(() => {
  textareaRef.value?.focus()
  document.addEventListener('keydown', onEnter)
  document.addEventListener('click', checkBlur)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onEnter)
  document.removeEventListener('click', checkBlur)
})
</script>

<template>
  <div class="container" ref="parentRef">
    <v-textarea
      label="Categories"
      ref="textareaRef"
      v-model="inputText"
      v-on:keyup="onChange"
      v-on:keydown.up="suggestUp"
      v-on:keydown.down="suggestDown"
      v-on:paste="onPaste"
      rows="7"
      no-resize
      hide-details
    >
    </v-textarea>
    <ul v-if="showSuggestions" class="categories-list bg-grey-darken-3">
      <li
        v-for="(cat, index) in suggestedCategories"
        :class="[
          'category',
          'px-3',
          'py-1',
          'cursor-default',
          { 'bg-grey-darken-1': index === selectedSuggestion }
        ]"
        :key="cat"
        v-on:mouseenter="selectedSuggestion = index"
        v-on:click="suggestSelected"
      >
        {{ cat }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.container {
  position: relative;
}

.categories-list {
  position: absolute;
  width: 100%;
  list-style-type: none;
}
</style>
