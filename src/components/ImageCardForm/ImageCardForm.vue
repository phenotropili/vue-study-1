<script setup lang="ts">
import type { ImageCard } from '@/models'
import { emit } from 'process'
import type { VNodeRef } from 'vue'
import { onMounted, reactive, ref } from 'vue'

const props = defineProps<{ card: Omit<ImageCard, 'fileName'> }>()
const emits = defineEmits<{
  sumbit: [categories: string[]]
  cancel: []
}>()
const inputRef = ref<HTMLTextAreaElement | null>(null)

const formValues = reactive({
  tagsStr: props.card.categories?.length ? props.card.categories.join(', ') : '',
  tagsList: props.card.categories ? [...props.card.categories] : []
})

const onCategoriesTouch = (v: string) => {
  formValues.tagsList = v
    .split(',')
    .map((x) => x.trim())
    .filter((x) => Boolean(x))
  formValues.tagsStr = v
}

onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
})

const onSubmit = () => {
  emits('sumbit', formValues.tagsList)
}
</script>

<template>
  <v-form @submit.prevent="onSubmit" class="d-flex flex-column">
    <v-textarea
      :model-value="formValues.tagsStr"
      label="Enter image categories"
      @update:model-value="onCategoriesTouch"
      variant="plain"
      no-resize
      rows="8"
      ref="inputRef"
      v-on:keydown.ctrl.enter="onSubmit"
    ></v-textarea>
    <div class="d-flex justify-space-between">
      <v-btn variant="text" @click="$emit('cancel')">Cancel</v-btn>
      <v-btn variant="outlined" type="submit" color="success">Save</v-btn>
    </div>
  </v-form>
</template>

<style></style>
