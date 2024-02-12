<script setup lang="ts">
import { ref } from 'vue'
import { mdiLabel, mdiDownload, mdiPencil, mdiDelete } from '@mdi/js'
import type { ImageCard } from '@/models'
import { computed } from 'vue'
import { tr } from 'vuetify/locale'
import ImageCardForm from '../ImageCardForm/ImageCardForm.vue'

const props = defineProps<ImageCard & { disabled?: boolean }>()
const emits = defineEmits<{
  favToggle: [id: number, newToggle: boolean]
  delete: [id: string]
  loadError: []
}>()

const btnRef = ref(undefined)
const isTooltipShown = ref(false)
const isDeleting = ref(false)
const isEditing = ref(false)

const showTooltip = () => {
  isTooltipShown.value = true

  setTimeout(() => {
    isTooltipShown.value = false
  }, 1000)
}

const onCopyClick = async () => {
  try {
    const data = await fetch(props.url)
    const blob = await data.blob()
    await navigator.clipboard.write([
      new ClipboardItem({
        data: blob
      })
    ])
  } catch {
    console.log('Failed to write image')
  }
}

const onDelete = () => {
  emits('delete', props.id)
  isDeleting.value = false
}

const onCancelEdit = () => {
  isEditing.value = false
}
</script>

<template>
  <v-card class="card">
    <v-img @error="$emit('loadError')" class="image" :src="url" download aspect-ratio="1"></v-img>
    <v-col class="d-flex flex-column pa-0 gr-4">
      <v-card-text
        v-if="props.categories?.length"
        class="d-flex pt-0 flex-wrap gc-1 gr-1 py-0 mt-4"
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
      <v-card-actions class="py-0">
        <!-- <v-btn
          @click="onCopyClick"
          size="small"
          color="primary"
          variant="text"
          :icon="mdiDownload"
          ref="btnRef"
          title="Copy to clipboard"
          :disabled="props.disabled"
        ></v-btn> -->
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
    </v-col>

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
          :card="{ id: props.id, url: props.url, categories: props.categories }"
          class="flex-grow-1"
          @cancel="onCancelEdit"
        />
      </v-card>
    </v-expand-transition>
  </v-card>
</template>

<style>
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
