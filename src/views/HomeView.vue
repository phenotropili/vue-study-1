<!-- eslint-disable no-unreachable -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ImagesGrid from '../components/ImagesGrid.vue'
import { useImagesListStore } from '@/stores/imagesList'
import { ImagesConnector } from '@/connectors/images'
import config from '@/config'
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFiltersObject, getImageUrl } from '@/utils'
import { mdiMagnify } from '@mdi/js'
import type { ImageCard } from '@/models'

const imagesConnector = new ImagesConnector(config.endpoints.api)
const imagesListStore = useImagesListStore()

const pagesCount = ref(0)

const loadImages = (p: number, filter?: object) => {
  imagesConnector.getImages(p - 1, filter).then(({ images, pagesTotal }) => {
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

const filter = computed<object | undefined>(() => {
  const queryStr = route.query['query']

  if (Array.isArray(queryStr)) {
    clearSearch()
    return undefined
  }

  if (!queryStr || queryStr === '{}') {
    return undefined
  }

  try {
    return JSON.parse(queryStr)
  } catch {
    return undefined
  }
})

watch(page, (newPage) => {
  loadImages(newPage, filter)
})

watch(filter, (newFilter) => {
  loadImages(page.value, newFilter)
})

onMounted(() => {
  loadImages(page.value, filter.value)
})

const onPage = (newPage: number) => {
  router.push({ name: 'home', params: { page: newPage } })
}

const onCardEdit = async (_id: string, newCategories: string[]) => {
  const { image } = await imagesConnector.editImage(_id, [...newCategories])

  const index = imagesListStore.images.findIndex((x) => x._id === _id)
  if (index !== -1) {
    imagesListStore.images.splice(index, 1, image)
  }
}

const errorMessages = ref<string[]>([])
const searchValue = ref<string>(route.query['query'] as string)

const clearSearch = () => {
  router.push(`${route.path}`)
}

const onSearch = () => {
  const newValue = searchValue.value

  if (!newValue || newValue === '{}') {
    clearSearch()
    return
  }

  try {
    const filter = getFiltersObject(newValue)
    if (errorMessages.value.length) {
      errorMessages.value = []
    }

    const queryString = encodeURIComponent(JSON.stringify(filter))

    router.push(`${route.path}?query=${queryString}`)
  } catch {
    errorMessages.value = ['Invalid search string']
  }
}

const showImage = ref(false)
const expandedImage = ref<string | undefined>()

const onImageExpand = (card: ImageCard) => {
  expandedImage.value = getImageUrl(card.fileName)
  showImage.value = true
}

const onOverlayClose = () => {
  showImage.value = false
  expandedImage.value = undefined
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
  <v-container class="search-container px-0 d-flex ga-4">
    <v-text-field
      clearable
      label="Categories filter"
      placeholder="Categories or mongo query: { categories: { $in: ['oral', 'anal'] }}, { $or: [{ categories: 'anal' }, { categories: 'oral' }] }, {categories: []}"
      variant="outlined"
      v-on:keyup.enter="onSearch"
      ref="searchElement"
      :error-messages="errorMessages"
      v-model="searchValue"
      @click:clear="clearSearch"
    ></v-text-field>
    <v-btn :prepend-icon="mdiMagnify" size="x-large" @click="onSearch"> Search </v-btn>
  </v-container>
  <ImagesGrid @card-edit="onCardEdit" @image-click="onImageExpand" />
  <v-container>
    <v-pagination
      :length="pagesCount"
      :model-value="page"
      @update:model-value="onPage"
    ></v-pagination>
  </v-container>

  <v-overlay
    :model-value="showImage"
    scroll-strategy="close"
    class="d-flex align-center justify-center image-overlay"
    @update:model-value="onOverlayClose"
    @click="onOverlayClose"
  >
    <v-img :src="expandedImage" aspect-ratio="1"></v-img>
  </v-overlay>
</template>

<style>
.search-container {
  max-width: unset;
}

.image-overlay > .v-overlay__content {
  /* position: relative; */
  width: 90%;
  height: 90%;
}
</style>
