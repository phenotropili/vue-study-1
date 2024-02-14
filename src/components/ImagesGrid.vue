<script setup lang="ts">
import { useImagesListStore } from '@/stores/imagesList'
import ImageCard from './ImageCard/ImageCard.vue'

const imagesStore = useImagesListStore()
</script>

<template>
  <div class="grid gr-4 gc-4">
    <ImageCard
      v-for="card in imagesStore.images"
      :key="card._id"
      :_id="card._id"
      :file-name="card.fileName"
      :categories="card.categories"
      @edit="
        (_id, categories) => {
          $emit('card-edit', _id, categories)
        }
      "
      @image-click="
        (card) => {
          $emit('image-click', card)
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
