<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ImagesGrid from '../components/ImagesGrid.vue'
import { useImagesListStore } from '@/stores/imagesList'
import { ImagesConnector } from '@/connectors/images'
import config from '@/config'
import { computed, watch } from 'vue'

const imagesConnector = new ImagesConnector(config.endpoints.api)
const imagesListStore = useImagesListStore()

const pagesCount = computed(() => imagesListStore.images.length)

const loadImages = (p: number) => {
  imagesConnector.getImages(p - 1).then((images) => {
    imagesListStore.images = images
  })
}

const page = ref(1)
const onPage = (newPage: number) => {
  page.value = newPage
  loadImages(page.value)
}

onMounted(() => {
  loadImages(page.value)
})

const onCardEdit = async (id: string, newCategories: string[]) => {
  const { image } = await imagesConnector.editImage(id, [...newCategories])

  const index = imagesListStore.images.findIndex((x) => x.id === id)
  if (index !== -1) {
    imagesListStore.images.splice(index, 1, image)
  }
}
</script>

<template>
  <!-- <div class="d-flex justify-center mb-6" v-if="pagesCount"> -->
  <v-container>
    <v-pagination
      :length="pagesCount"
      :model-value="page"
      @update:model-value="onPage"
    ></v-pagination>
  </v-container>
  <!-- </div> -->
  <ImagesGrid @card-edit="onCardEdit" />
</template>
