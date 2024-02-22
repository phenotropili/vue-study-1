<!-- eslint-disable no-unreachable -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ImagesGrid from '../components/ImagesGrid.vue'
import { useImagesListStore } from '@/stores/imagesList'
import { ImagesConnector } from '@/connectors/images'
import config from '@/config'
import { watch } from 'vue'
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'
import { getFiltersObject, getImageUrl } from '@/utils'
import { mdiMagnify } from '@mdi/js'
import type { ImageCard } from '@/models'
import { useCategoriesStore } from '@/stores/categories'

const imagesConnector = new ImagesConnector(config.endpoints.api)
const imagesListStore = useImagesListStore()
const categoriesStore = useCategoriesStore()

const pagesCount = ref(0)

const route = useRoute()
const router = useRouter()
const page = ref<number>(1)
const filter = ref<object>()

const loadImages = () => {
  imagesConnector
    .getImages(page.value - 1, filter.value)
    .then(({ images, pagesTotal, categories }) => {
      console.log('Loaded images')
      imagesListStore.images = images
      pagesCount.value = pagesTotal
      categoriesStore.categories = categories
    })
}

const getPage = (paramValue: LocationQueryValue | LocationQueryValue[]) => {
  if (Array.isArray(paramValue) || paramValue === null) {
    return 1
  }

  const pageNum = parseInt(paramValue, 10)

  return Number.isNaN(pageNum) ? 1 : pageNum
}

onMounted(() => {
  // eslint-disable-next-line no-debugger
  // debugger
  page.value = getPage(route.params['page'])

  const queryStr = route.query['query']
  if (Array.isArray(queryStr)) {
    clearSearch()
    filter.value = undefined

    loadImages()
  } else if (!queryStr) {
    filter.value = undefined
    loadImages()
  } else {
    try {
      const decodedQueryStr = decodeURIComponent(queryStr)
      filter.value = getFiltersObject(decodedQueryStr)
    } catch {
      clearSearch()
      filter.value = undefined
    }

    loadImages()
  }
})

watch(
  () => [route.query['query'], route.params['page']],
  ([newQueryString, newPage]) => {
    // eslint-disable-next-line no-debugger
    debugger
    const pageValue = getPage(newPage)
    if (pageValue !== page.value) {
      page.value = pageValue
    }

    if (!newQueryString) {
      filter.value = undefined
      searchValue.value = ''
    } else {
      const currentFilterStr = JSON.stringify(filter.value)
      const decodedQueryStr = decodeURIComponent(newQueryString as string)
      if (currentFilterStr !== decodedQueryStr) {
        try {
          const newFilter = getFiltersObject(decodedQueryStr)

          filter.value = newFilter
          searchValue.value = decodedQueryStr
        } catch {
          filter.value = undefined
          searchValue.value = ''
        }
      }
    }

    loadImages()
  }
)

const onPage = (newPage: number) => {
  page.value = newPage
  router.push({ name: 'home', params: { page: newPage }, query: route.query })
  loadImages()
  window.scrollTo(0, 0)
}

const onCardEdit = async (_id: string, newCategories: string[]) => {
  const { image, categories } = await imagesConnector.editImage(_id, [...newCategories])
  categoriesStore.categories = categories

  const index = imagesListStore.images.findIndex((x) => x._id === _id)
  if (index !== -1) {
    imagesListStore.images.splice(index, 1, image)
  }
}

const errorMessages = ref<string[]>([])
const searchValue = ref<string>(route.query['query'] as string)

const clearSearch = () => {
  router.push({ name: 'home' })
  filter.value = undefined
  page.value = 1
  loadImages()
}

const onSearch = () => {
  // eslint-disable-next-line no-debugger
  // debugger
  const newValue = searchValue.value

  if (!newValue || newValue === '{}') {
    clearSearch()
    return
  }

  try {
    filter.value = getFiltersObject(newValue)
    if (errorMessages.value.length) {
      errorMessages.value = []
    }

    const queryString = encodeURIComponent(JSON.stringify(filter.value))
    page.value = 1
    if (route.query['query'] !== queryString) {
      router.push({ name: 'home', params: { page: page.value }, query: { query: queryString } })
    }

    loadImages()
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
    <v-card class="image-card">
      <v-img :src="expandedImage" aspect-ratio="1"></v-img>
    </v-card>
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

.image-card {
  height: 100%;
}
</style>
