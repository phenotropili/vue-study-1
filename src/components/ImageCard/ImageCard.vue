<script setup lang="ts">
import { ref } from 'vue'
import { mdiLabel, mdiPencil, mdiDelete, mdiContentCopy } from '@mdi/js'
import type { ImageCard } from '@/models'
import ImageCardForm from '../ImageCardForm/ImageCardForm.vue'
import { computed } from 'vue'
import { getImageUrl } from '@/utils'
import { onMounted } from 'vue'
import { onUnmounted } from 'vue'

const props = defineProps<ImageCard & { disabled?: boolean }>()
const emits = defineEmits<{
  favToggle: [id: number, newToggle: boolean]
  delete: [id: string]
  loadError: []
  edit: [id: string, categories: string[]]
  imageClick: [card: ImageCard]
}>()
const url = computed(() => getImageUrl(props.fileName))
const isDeleting = ref(false)
const isEditing = ref(false)

const onDelete = () => {
  emits('delete', props._id)
  isDeleting.value = false
}

const onCancelEdit = () => {
  isEditing.value = false
}

const onSubmit = (categories: string[]) => {
  isEditing.value = false
  emits('edit', props._id, categories)
}

const onCopyClick = () => {
  if (props.categories?.length) {
    navigator.clipboard.writeText(props.categories.join(', '))
  }
}
</script>

<template>
  <v-card class="card d-flex flex-column justify-space-between">
    <v-img
      @error="$emit('loadError')"
      :class="['image', { image_hidden: isEditing }]"
      :src="url"
      download
      aspect-ratio="1"
      @click="$emit('imageClick', props)"
    ></v-img>
    <v-card-text
      v-if="props.categories?.length"
      class="d-flex pt-4 flex-wrap flex-grow-0 gc-1 gr-1 py-0 align-end"
    >
      <v-chip
        v-for="tag in props.categories"
        v-bind:key="tag"
        :title="tag"
        :prepend-icon="mdiLabel"
        color="grey"
      >
        <span class="tag">{{ tag }}</span>
      </v-chip>
    </v-card-text>
    <v-card-actions class="py-0 actions">
      <v-btn
        size="small"
        color="primary"
        variant="text"
        :icon="mdiPencil"
        title="Edit"
        @click="isEditing = true"
        :disabled="props.disabled"
      ></v-btn>
      <v-btn
        @click="onCopyClick"
        size="small"
        color="primary"
        variant="text"
        :icon="mdiContentCopy"
        ref="btnRef"
        title="Copy categories"
        :disabled="props.disabled"
      ></v-btn>
      <v-btn
        size="small"
        color="primary"
        variant="text"
        :icon="mdiDelete"
        class="ms-auto"
        title="Delete"
        @click="isDeleting = true"
        :disabled="props.disabled"
      ></v-btn>
    </v-card-actions>

    <v-expand-transition>
      <v-card v-if="isDeleting" class="delete-container d-flex flex-column">
        <v-card-text class="d-flex flex-column justify-center">
          <div class="text-center">Delete this meme?</div>
        </v-card-text>

        <v-card-actions class="justify-space-between pa-4">
          <v-btn @click="onDelete" variant="outlined" color="error">Delete</v-btn>
          <v-btn @click="isDeleting = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>

    <v-expand-transition>
      <v-card v-if="isEditing" class="delete-container pa-4 d-flex flex-direction-column">
        <image-card-form
          :card="{ _id: props._id, categories: props.categories }"
          class="flex-grow-1"
          @cancel="onCancelEdit"
          @sumbit="onSubmit"
        />
      </v-card>
    </v-expand-transition>
  </v-card>
</template>

<style>
.image {
  margin-bottom: auto;
}

.image_hidden {
  pointer-events: none;
}

.color {
  display: inline;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  float: left;
  margin-top: 2px;
  margin-right: 8px;
}

.tag {
  max-width: 150px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.delete-container {
  position: absolute;
  bottom: 0;
  height: 100%;
  width: 100%;
}
</style>
