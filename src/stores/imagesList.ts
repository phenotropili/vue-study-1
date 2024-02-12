import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { ImageCard } from '@/models'

export const useImagesListStore = defineStore('imagesList', () => {
  const images = ref<ImageCard[]>([])

  const filters = reactive<{ categories?: string[] }>({})

  return { images, filters }
})
