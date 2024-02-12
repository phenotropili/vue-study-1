import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useImagesListStore = defineStore('imagesList', () => {
  const images = ref<string[]>([])

  const filters = reactive<{ categories?: string[] }>({})

  return { images, filters }
})
