<template>
  <article class="mx-auto max-w-3xl px-6 py-16">
    <p v-if="article.category" class="font-sans text-sm font-semibold text-primary">
      {{ article.category }}
    </p>
    <h1 class="mt-2 font-display text-2xl font-bold text-ink">{{ article.title }}</h1>
    <img
      v-if="coverUrl"
      :src="coverUrl"
      :alt="article.title"
      class="mt-6 aspect-video w-full rounded-lg object-cover shadow-sm"
    />
    <!-- eslint-disable-next-line vue/no-v-html -- sanitizé via sanitizeHtml() -->
    <div
      v-if="article.content"
      class="prose mt-6 max-w-none"
      v-html="sanitizeHtml(article.content)"
    />
  </article>
</template>

<script setup lang="ts">
import type { Article } from '@learnup/types'
import { useDirectusAsset } from '~/composables/useDirectusAsset'

const route = useRoute()
const slug = route.params.slug as string

const article = await useDirectusItemBySlug<Article>('articles', slug, `article-${slug}`)

const { getAssetUrl } = useDirectusAsset()
const coverUrl = computed(() => getAssetUrl(article.cover_image, { format: 'webp' }))

useContentSeo(article, article.title)
</script>
