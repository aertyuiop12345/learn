<template>
  <article
    class="flex flex-row items-center gap-md rounded-[14px] border border-rule bg-paper p-3 md:p-md md:flex-col md:items-stretch"
  >
    <div
      class="flex h-24 w-24 shrink-0 items-center justify-center rounded-sm border border-dashed border-outline bg-surface-alt px-xs text-center text-meta text-ink-muted md:h-auto md:w-full md:aspect-video md:rounded-sm"
    >
      Visuel à fournir
    </div>
    <div class="flex flex-1 flex-col justify-center md:mt-md md:block">
      <p class="text-[9.5px] font-bold uppercase text-accent-text">{{ category }}</p>
      <h3 class="mt-xs font-sans text-[13.5px] md:text-[15px] font-bold leading-snug text-ink">
        {{ title }}
      </h3>
      <p class="mt-xs text-small text-ink-subtle md:mt-sm">{{ date }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  category: string
  title: string
  date: string
}>()
</script>
