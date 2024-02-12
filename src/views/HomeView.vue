<script setup lang="ts">
import { onMounted } from 'vue'
import ImagesGrid from '../components/ImagesGrid.vue'
import { useImagesListStore } from '@/stores/imagesList'
import { ImagesConnector } from '@/connectors/images'
import config from '@/config'

onMounted(async () => {
  const imagesListStore = useImagesListStore()
  const imagesConnector = new ImagesConnector(config.endpoints.api)
  const images = await imagesConnector.getImages()
  console.log({ images })
  imagesListStore.images = images
})
</script>

<template>
  <ImagesGrid />
</template>
