<script setup lang="ts">
import { useImagesListStore } from '@/stores/imagesList'
import ImageCard from './ImageCard/ImageCard.vue'
import type { ImageCard as ImageCardProps } from '@/models'
import config from '@/config'
import { computed } from 'vue'

const imagesStore = useImagesListStore()
const cards = computed<ImageCardProps[]>(() => {
  return imagesStore.images.map((fileName) => {
    const prop: ImageCardProps = {
      id: fileName,
      url: `${config.endpoints.images}/${fileName}`
    }

    return prop
  })
})
</script>

<template>
  <div class="grid gr-4 gc-4">
    <ImageCard v-for="card in cards" :key="card.id" :id="card.id" :url="card.url" />
  </div>
</template>

<style>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}
</style>
