<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ImagesGrid from '../components/ImagesGrid.vue'
import { useImagesListStore } from '@/stores/imagesList'
import { ImagesConnector } from '@/connectors/images'
import config from '@/config'
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const imagesConnector = new ImagesConnector(config.endpoints.api)
const imagesListStore = useImagesListStore()

const pagesCount = ref(0)

const loadImages = (p: number) => {
  imagesConnector.getImages(p - 1).then(({ images, pagesTotal }) => {
    imagesListStore.images = images
    pagesCount.value = pagesTotal
  })
}

const route = useRoute()
const router = useRouter()
const page = computed<number>(() => {
  const pageStr = route.params['page'] as string
  const pageNum = parseInt(pageStr, 10)

  return !Number.isNaN(pageNum) ? pageNum : 1
})
watch(page, (newPage) => {
  loadImages(newPage)
})

const onPage = (newPage: number) => {
  router.push({ name: 'home', params: { page: newPage } })
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
  <v-container>
    <v-pagination
      :length="pagesCount"
      :model-value="page"
      @update:model-value="onPage"
    ></v-pagination>
  </v-container>
  <ImagesGrid @card-edit="onCardEdit" />
  <v-container>
    <v-pagination
      :length="pagesCount"
      :model-value="page"
      @update:model-value="onPage"
    ></v-pagination>
  </v-container>
</template>
