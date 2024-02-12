<script setup lang="ts">
import type { ImageCard } from '@/models'
import ImageCardComponent from '../ImageCard/ImageCard.vue'
import { ref } from 'vue'
import { computed } from 'vue'
import { reactive } from 'vue'

const props = defineProps<{ card: ImageCard }>()
const emits = defineEmits<{
  sumbit: [categories: string[]]
  cancel: []
}>()

const formValues = reactive({
  url: props.card.url,
  tagsStr: props.card.categories?.length ? props.card.categories.join(', ') : '',
  tagsList: props.card.categories ? [...props.card.categories] : []
})

const onCategoriesTouch = (v: string) => {
  formValues.tagsList = v.split(/\s|,/).filter((x) => Boolean(x))
}
</script>

<template>
  <v-form @submit.prevent="$emit('sumbit', formValues.tagsList)" class="d-flex flex-column">
    <v-textarea
      :model-value="formValues.tagsStr"
      label="Enter image categories"
      @update:model-value="onCategoriesTouch"
      variant="plain"
      no-resize
      rows="14"
    ></v-textarea>
    <div class="d-flex justify-space-between">
      <v-btn variant="text" @click="$emit('cancel')">Cancel</v-btn>
      <v-btn variant="outlined" type="submit" color="success">Save</v-btn>
    </div>
  </v-form>
</template>

<style></style>
