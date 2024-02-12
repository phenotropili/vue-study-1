<script setup lang="ts">
import { useImagesListStore } from '@/stores/imagesList'
import ImageCard from './ImageCard/ImageCard.vue'

const imagesStore = useImagesListStore()
</script>

<template>
  <div class="grid gr-4 gc-4">
    <ImageCard
      v-for="card in imagesStore.images"
      :key="card.id"
      :id="card.id"
      :url="card.url"
      :categories="card.categories"
      @edit="
        (id, categories) => {
          $emit('card-edit', id, categories)
        }
      "
    />
  </div>
</template>

<style>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}
</style>
