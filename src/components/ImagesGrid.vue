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
  <v-container v-if="cards.length">
    <v-row no-gutters>
      <v-col cols="4" v-for="card in cards" :key="card.id">
        <ImageCard :id="card.id" :url="card.url" />
      </v-col>
    </v-row>
  </v-container>
</template>
