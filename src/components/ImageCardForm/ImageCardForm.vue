<script setup lang="ts">
import type { ImageCard } from '@/models'
import { ref } from 'vue'
import CategoriesSuggest from '../CategoriesSuggest/CategoriesSuggest.vue'

const props = defineProps<{ card: Omit<ImageCard, 'fileName'> }>()
const emits = defineEmits<{
  sumbit: [categories: string[]]
  cancel: []
}>()
const inputValues = ref<string[]>([...(props.card.categories ?? [])])

const onCategoriesChange = (newCategories: string[]) => {
  inputValues.value = newCategories
}

const onSubmit = () => {
  emits('sumbit', inputValues.value)
}
</script>

<template>
  <v-form
    @submit.prevent="onSubmit"
    v-on:keydown.ctrl.enter="onSubmit"
    class="d-flex flex-column justify-space-between"
  >
    <categories-suggest
      :categories="props.card.categories"
      @categories-changed="onCategoriesChange"
    ></categories-suggest>
    <div class="d-flex justify-space-between">
      <v-btn variant="text" @click="$emit('cancel')">Cancel</v-btn>
      <v-btn variant="outlined" type="submit" color="success">Save</v-btn>
    </div>
  </v-form>
</template>

<style scoped>
.v-chip-custom > :global(.v-chip__content) {
  padding-bottom: 2px;
}
</style>
