<template>
  <div class="flex flex-1 flex-col">
    <!-- Hero / recherche -->
    <section class="border-b border-rule bg-linear-to-b from-paper to-surface">
      <div class="mx-auto max-w-container px-gutter-mobile py-2xl md:px-gutter">
        <p class="text-overline text-accent-text">Catalogue de formations</p>
        <h1
          class="mt-sm max-w-prose font-display text-h2 font-extrabold leading-tight text-ink lg:text-h1"
        >
          Trouvez la formation adaptée à vos besoins professionnels
        </h1>
        <p class="mt-md max-w-prose text-body text-ink-body">
          {{ formations.length }} formations réglementaires et professionnelles, en centre partout
          en France ou dans votre entreprise.
        </p>

        <form
          class="mt-2xl max-w-prose"
          role="search"
          aria-label="Rechercher une formation"
          @submit.prevent="triggerSearch"
        >
          <SearchInput
            v-model="searchQuery"
            input-id="catalogue-search"
            sr-label="Rechercher une formation"
            placeholder="CACES, SST, habilitation électrique, hauteur…"
            button-label="Lancer la recherche"
            class="w-full"
            @submit="triggerSearch"
          >
            <template #icon>
              <IconSparkle :size="18" class="shrink-0 text-accent" />
            </template>
          </SearchInput>
        </form>

        <!-- Barre mobile : filtrer + tri -->
        <div class="mt-lg flex items-center gap-md lg:hidden">
          <Button
            type="button"
            class="h-control gap-sm rounded-full bg-primary px-md text-small font-semibold text-paper hover:bg-primary-dark"
            aria-haspopup="dialog"
            aria-controls="mobile-filter-panel"
            :aria-expanded="isFilterPanelOpen"
            @click="openFilterPanel"
          >
            <IconFilter :size="16" />
            Filtrer
            <span
              v-if="activeFilters.length"
              class="flex h-lg w-lg items-center justify-center rounded-full bg-accent text-meta font-bold text-ink"
            >
              {{ activeFilters.length }}
            </span>
          </Button>
          <Select id="sort-mobile" v-model="sortBy" aria-label="Trier par">
            <SelectTrigger
              aria-label="Trier par"
              class="h-control w-auto gap-sm rounded-full border-outline bg-paper px-md text-small font-semibold text-ink-body shadow-none"
            >
              <span class="truncate">{{ sortLabel }}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in sortOptions"
                :key="option.value"
                :value="option.value"
                class="text-small"
              >
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Raccourcis familles -->
        <ul class="mt-2xl hidden grid-cols-1 gap-md sm:grid sm:grid-cols-2 lg:grid-cols-4">
          <li
            v-for="shortcut in familyShortcuts"
            :key="shortcut.label"
            class="rounded-md border border-rule bg-paper p-lg"
          >
            <p class="font-semibold text-ink">{{ shortcut.label }}</p>
            <p class="mt-xs text-small text-ink-muted">{{ shortcut.caption }}</p>
            <NuxtLink
              :to="shortcut.to"
              class="mt-md inline-block text-small font-semibold text-primary hover:underline"
            >
              {{ shortcut.linkLabel }} →
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>

    <!-- Filtres + résultats -->
    <section
      class="mx-auto w-full max-w-container px-gutter-mobile max-md:pt-0 py-section md:px-gutter"
    >
      <div class="grid grid-cols-1 gap-2xl lg:grid-cols-[260px_1fr]">
        <!-- Sidebar filtres desktop -->
        <aside aria-label="Filtres du catalogue" class="hidden lg:block">
          <div class="flex items-center justify-between">
            <h2 class="font-sans text-h4 font-bold text-ink">Filtres</h2>
            <span class="text-meta text-ink-subtle">
              {{ activeFilters.length ? `${activeFilters.length} actif(s)` : 'Aucun filtre actif' }}
            </span>
          </div>
          <CatalogueFilters
            v-model:families="selectedFamilies"
            v-model:modalities="selectedModalities"
            v-model:location="locationQuery"
            v-model:durations="selectedDurations"
            v-model:certifications="selectedCertifications"
            :family-options="familyOptions"
            location-input-id="loc-desktop"
          />
        </aside>

        <!-- Résultats -->
        <div>
          <!-- Chips filtres actifs -->
          <div v-if="activeFilters.length" class="mt-md lg:mt-0">
            <div class="flex flex-wrap items-center gap-sm">
              <span class="hidden text-meta font-bold tracking-wide text-ink-muted lg:inline">
                Filtres actifs
              </span>
              <span
                v-for="filter in activeFilters"
                :key="`${filter.group}:${filter.key}`"
                class="inline-flex items-center gap-sm rounded-full bg-primary px-md py-xs text-small text-paper"
              >
                {{ filter.label }}
                <button
                  type="button"
                  :aria-label="`Retirer le filtre ${filter.label}`"
                  class="text-paper/70 hover:text-paper"
                  @click="removeFilter(filter)"
                >
                  <IconClose :size="12" />
                </button>
              </span>
            </div>
            <button
              type="button"
              class="mt-sm text-small font-semibold text-primary underline"
              @click="resetFilters"
            >
              Réinitialiser
            </button>
          </div>

          <div class="mt-lg flex flex-wrap items-center justify-between gap-md">
            <h2 class="font-sans text-h4 font-bold text-ink">
              {{ filteredFormations.length }}
              {{ filteredFormations.length > 1 ? 'formations' : 'formation' }}
              <template v-if="hasActiveCriteria">correspondent</template>
            </h2>
            <div class="hidden items-center gap-sm lg:flex">
              <Label for="sort-desktop" class="text-small font-normal text-ink-body">
                Trier par
              </Label>
              <Select id="sort-desktop" v-model="sortBy">
                <SelectTrigger
                  class="h-auto w-auto gap-sm rounded-full border-outline bg-paper px-md py-sm text-small text-ink-body shadow-none"
                >
                  <span class="truncate">{{ sortLabel }}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in sortOptions"
                    :key="option.value"
                    :value="option.value"
                    class="text-small"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Chargement : squelette de la liste -->
          <div v-if="showSkeleton" aria-label="Chargement des formations">
            <output class="sr-only">Chargement des formations</output>
            <div class="mt-lg flex flex-col gap-lg">
              <div class="h-sm w-2xl animate-pulse rounded-full bg-surface" aria-hidden="true" />
              <div class="grid grid-cols-1 gap-md sm:grid-cols-2">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="flex flex-col gap-sm rounded-md border border-rule p-lg"
                  aria-hidden="true"
                >
                  <div class="h-xs w-3xl animate-pulse rounded-full bg-accent/30" />
                  <div class="h-xs w-full animate-pulse rounded-full bg-surface" />
                  <div class="h-xs w-3/4 animate-pulse rounded-full bg-surface" />
                  <div class="h-xs w-1/2 animate-pulse rounded-full bg-surface" />
                </div>
              </div>
            </div>
          </div>

          <!-- État vide -->
          <div
            v-else-if="filteredFormations.length === 0"
            class="mt-lg flex flex-col items-center rounded-md border border-dashed border-rule bg-surface-soft px-lg py-4xl text-center"
          >
            <IconSearchMinus :size="30" class="text-ink-muted" />
            <h3 class="mt-md font-sans text-h4 font-bold text-ink">
              Aucune formation ne correspond exactement à votre recherche.
            </h3>
            <p class="mt-sm max-w-prose text-small text-ink-body">
              Vous pouvez élargir vos critères, retirer un filtre, ou transmettre votre besoin : une
              réponse adaptée vous sera proposée.
            </p>
            <div class="mt-lg flex flex-wrap justify-center gap-md">
              <Button
                as-child
                class="h-control rounded-full bg-primary px-lg text-small font-semibold text-paper hover:bg-primary-dark"
              >
                <NuxtLink to="#">Être guidé dans mon choix</NuxtLink>
              </Button>
              <Button
                as-child
                variant="outline"
                class="h-control rounded-full border-outline px-lg text-small font-semibold text-ink-body hover:bg-surface"
              >
                <NuxtLink to="#">Parler à un conseiller</NuxtLink>
              </Button>
            </div>
            <div class="mt-lg flex gap-lg text-small font-semibold">
              <button type="button" class="text-primary hover:underline" @click="resetFilters">
                Réinitialiser les filtres
              </button>
              <NuxtLink to="/formations" class="text-primary hover:underline" @click="resetFilters">
                Voir le catalogue complet
              </NuxtLink>
            </div>
          </div>

          <!-- Grille résultats -->
          <ul v-else class="mt-lg grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-3">
            <li v-for="formation in paginatedFormations" :key="formation.slug">
              <CenterFormationCard
                :family="formation.family"
                :title="formation.title"
                :description="formation.description"
                :meta="formation.meta"
                :status="formation.status"
                :to="formation.to"
                class="h-full"
              />
            </li>
          </ul>

          <!-- Pagination desktop -->
          <Pagination
            v-if="filteredFormations.length"
            v-model:page="currentPage"
            :total="sortedFormations.length"
            :items-per-page="perPage"
            :sibling-count="1"
            class="mt-2xl hidden items-center justify-center lg:flex"
            aria-label="Pagination du catalogue"
          >
            <PaginationContent v-slot="{ items }" class="gap-sm">
              <PaginationPrevious
                class="h-control-sm w-control-sm rounded-full border border-primary/25 p-0 text-ink-subtle hover:bg-surface"
              />
              <template v-for="item in items" :key="item.value">
                <PaginationItem
                  v-if="item.type === 'page'"
                  :value="item.value"
                  :is-active="item.value === currentPage"
                >
                  {{ item.value }}
                </PaginationItem>
                <PaginationEllipsis
                  v-else-if="item.type === 'ellipsis'"
                  class="h-control-sm w-control-sm text-ink-subtle"
                />
              </template>
              <PaginationNext
                class="h-control-sm w-control-sm rounded-full border border-primary/25 p-0 text-ink-body hover:bg-surface"
              />
            </PaginationContent>
          </Pagination>

          <!-- Pagination mobile -->
          <button
            v-if="hasMoreMobile"
            type="button"
            class="mx-auto mt-lg block rounded-full border border-outline px-lg py-sm text-small font-semibold text-ink-body hover:bg-surface lg:hidden"
            @click="showMore"
          >
            Afficher plus de résultats
          </button>
        </div>
      </div>

      <!-- Bandeau CTA -->
      <CtaBanner
        class="mt-2xl"
        title="Vous ne savez pas quelle formation choisir ?"
        text="Décrivez votre besoin : LEARN UP identifie la formation, le format et le lieu adaptés à votre situation."
      >
        <Button
          as-child
          class="h-control w-full rounded-full bg-accent px-lg text-small font-semibold text-ink transition hover:bg-accent-text sm:w-auto"
        >
          <NuxtLink to="#">Être guidé dans mon choix</NuxtLink>
        </Button>
        <Button
          as-child
          variant="outline"
          class="h-control w-full rounded-full border-outline-inverse bg-transparent px-lg text-small font-semibold text-ink-inverse transition hover:bg-transparent hover:text-ink-inverse sm:w-auto"
        >
          <NuxtLink to="#">Parler à un conseiller</NuxtLink>
        </Button>
      </CtaBanner>
    </section>

    <!-- Panneau filtres mobile plein écran -->
    <dialog
      v-if="isFilterPanelOpen"
      id="mobile-filter-panel"
      ref="filterPanel"
      aria-labelledby="mobile-filter-panel-title"
      class="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none flex-col bg-paper p-0 lg:hidden"
      @close="isFilterPanelOpen = false"
    >
      <div
        class="flex shrink-0 items-center justify-between border-b border-rule px-gutter-mobile py-md"
      >
        <h2 id="mobile-filter-panel-title" class="font-display text-h3 font-extrabold text-ink">
          Filtres
          <span class="ml-xs align-middle text-small font-medium text-ink-muted">
            {{ activeFilters.length }} actif(s)
          </span>
        </h2>
        <button
          ref="closeFilterButton"
          type="button"
          class="flex h-control-sm w-control-sm items-center justify-center rounded-full border border-outline text-ink-muted hover:bg-surface"
          aria-label="Fermer le panneau de filtres"
          @click="closeFilterPanel"
        >
          <IconClose :size="16" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-gutter-mobile py-lg">
        <CatalogueFilters
          v-model:families="selectedFamilies"
          v-model:modalities="selectedModalities"
          v-model:location="locationQuery"
          v-model:durations="selectedDurations"
          v-model:certifications="selectedCertifications"
          :family-options="familyOptions"
          location-input-id="loc-mobile"
        />
      </div>

      <!-- Barre d'action fixe -->
      <div class="shrink-0 border-t border-rule bg-paper p-md">
        <div class="mx-auto flex w-full max-w-container gap-md">
          <button
            type="button"
            class="rounded-full border border-outline px-lg py-sm text-small font-semibold text-ink-body hover:bg-surface"
            @click="resetFilters"
          >
            Tout effacer
          </button>
          <button
            type="button"
            class="h-control flex-1 rounded-full bg-primary px-lg text-small font-semibold text-paper hover:bg-primary-dark"
            @click="closeFilterPanel"
          >
            Afficher {{ filteredFormations.length }} formation(s)
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, watch } from 'vue'
import { useCatalog, type FormationItem } from '~/composables/useCatalog'
import { FAMILY_LABELS, getFilterLabel } from '~/utils/catalog-filters'

definePageMeta({
  layout: 'with-breadcrumb',
  breadcrumb: [{ label: 'Accueil', to: '/' }, { label: 'Formations' }]
})

useContentSeo(
  {
    seo_title: 'Catalogue de formations — LEARN UP ACADEMY',
    seo_description:
      'Formations réglementaires et professionnelles, en centre partout en France ou dans votre entreprise.'
  },
  'Catalogue de formations — LEARN UP ACADEMY'
)

// useRoute avant le premier await : le contexte Nuxt n'est pas garanti après.
const route = useRoute()

const catalog = await useCatalog()
const formations = computed(() => catalog.data.value?.formations ?? [])

// ?loading=1 force l'affichage du squelette pour prévisualiser l'état de
// chargement (pending est déjà résolu après le SSR).
const showSkeleton = computed(() => catalog.pending.value || route.query.loading === '1')

const familyShortcuts = [
  {
    label: 'Sécurité & prévention',
    caption: '38 formations',
    linkLabel: 'Voir la famille',
    to: '/formations/securite-prevention'
  },
  {
    label: "CACES & conduite d'engins",
    caption: '24 formations',
    linkLabel: 'Voir la famille',
    to: '/formations/caces-conduite-engins'
  },
  {
    label: 'Habilitations électriques',
    caption: '17 formations',
    linkLabel: 'Voir la famille',
    to: '/formations/habilitations-electriques'
  },
  {
    label: 'Toutes les familles',
    caption: 'Management, bureautique, qualité…',
    linkLabel: 'Parcourir',
    to: '#'
  }
]

// ?q= alimente la recherche (liens depuis les états introuvable/erreur).
const searchQuery = ref(typeof route.query.q === 'string' ? route.query.q : '')
const selectedFamilies = ref<string[]>([])
const selectedModalities = ref<string[]>([])
const locationQuery = ref('')
const selectedDurations = ref<string[]>([])
const selectedCertifications = ref<string[]>([])
const sortBy = ref(searchQuery.value ? 'pertinence' : 'editorial')
const sortOptions = [
  { value: 'pertinence', label: 'Pertinence' },
  { value: 'editorial', label: 'Ordre éditorial' },
  { value: 'duree', label: 'Durée' }
]
const sortLabel = computed(
  () => sortOptions.find((option) => option.value === sortBy.value)?.label ?? ''
)
const isFilterPanelOpen = ref(false)
const filterPanel = ref<HTMLDialogElement | null>(null)
const closeFilterButton = ref<HTMLButtonElement | null>(null)

const perPage = ref(9)
const currentPage = ref(1)

const familyOptions = computed(() => {
  const knownFamilies = Object.keys(FAMILY_LABELS)
  const presentFamilies = [...new Set(formations.value.map((f) => f.familyKey))]
  const keys = [...new Set([...knownFamilies, ...presentFamilies])]

  return keys.map((key) => ({
    key,
    label: FAMILY_LABELS[key] ?? key,
    count: formations.value.filter((f) => f.familyKey === key).length
  }))
})

const filteredFormations = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const location = locationQuery.value.trim().toLowerCase()
  return formations.value.filter((f) => {
    if (query && !`${f.title} ${f.family} ${f.description}`.toLowerCase().includes(query)) {
      return false
    }
    if (selectedFamilies.value.length && !selectedFamilies.value.includes(f.familyKey)) {
      return false
    }
    if (
      selectedModalities.value.length &&
      !selectedModalities.value.some((m) => f.modalities.includes(m))
    ) {
      return false
    }
    if (location && !f.region.toLowerCase().includes(location)) {
      return false
    }
    if (selectedDurations.value.length && !selectedDurations.value.includes(f.duration)) {
      return false
    }
    if (
      selectedCertifications.value.length &&
      !selectedCertifications.value.some((c) => f.certifications.includes(c))
    ) {
      return false
    }
    return true
  })
})

const sortedFormations = computed(() => {
  const list = [...filteredFormations.value]
  const query = searchQuery.value.trim().toLowerCase()

  if (sortBy.value === 'duree') {
    list.sort((a, b) => a.days - b.days)
  } else if (sortBy.value === 'pertinence' && query) {
    const score = (f: FormationItem) => {
      let s = 0
      if (f.title.toLowerCase().includes(query)) s += 3
      if (f.family.toLowerCase().includes(query)) s += 2
      if (f.description.toLowerCase().includes(query)) s += 1
      return s
    }
    list.sort((a, b) => score(b) - score(a))
  }

  return list
})

const paginatedFormations = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return sortedFormations.value.slice(start, start + perPage.value)
})

const hasMoreMobile = computed(
  () => paginatedFormations.value.length < sortedFormations.value.length
)

interface ActiveFilter {
  group: 'families' | 'modalities' | 'location' | 'durations' | 'certifications'
  key: string
  label: string
}

const activeFilters = computed<ActiveFilter[]>(() => [
  ...selectedFamilies.value.map((key) => ({
    group: 'families' as const,
    key,
    label: getFilterLabel('families', key)
  })),
  ...selectedModalities.value.map((key) => ({
    group: 'modalities' as const,
    key,
    label: getFilterLabel('modalities', key)
  })),
  ...(locationQuery.value.trim()
    ? [{ group: 'location' as const, key: 'location', label: locationQuery.value.trim() }]
    : []),
  ...selectedDurations.value.map((key) => ({
    group: 'durations' as const,
    key,
    label: getFilterLabel('durations', key)
  })),
  ...selectedCertifications.value.map((key) => ({
    group: 'certifications' as const,
    key,
    label: getFilterLabel('certifications', key)
  }))
])

const hasActiveCriteria = computed(
  () => activeFilters.value.length > 0 || searchQuery.value.trim().length > 0
)

function removeFilter(filter: ActiveFilter) {
  if (filter.group === 'location') {
    locationQuery.value = ''
    return
  }
  const models = {
    families: selectedFamilies,
    modalities: selectedModalities,
    durations: selectedDurations,
    certifications: selectedCertifications
  } as const
  const model = models[filter.group]
  model.value = model.value.filter((key) => key !== filter.key)
}

function resetFilters() {
  searchQuery.value = ''
  selectedFamilies.value = []
  selectedModalities.value = []
  locationQuery.value = ''
  selectedDurations.value = []
  selectedCertifications.value = []
  sortBy.value = 'editorial'
  currentPage.value = 1
  perPage.value = 9
}

function openFilterPanel() {
  isFilterPanelOpen.value = true
  nextTick(() => {
    filterPanel.value?.showModal()
    closeFilterButton.value?.focus()
  })
}

function closeFilterPanel() {
  filterPanel.value?.close()
  isFilterPanelOpen.value = false
}

function showMore() {
  perPage.value += 9
}

function triggerSearch(query?: string) {
  searchQuery.value = (query ?? searchQuery.value).trim()
  sortBy.value = searchQuery.value ? 'pertinence' : 'editorial'
  currentPage.value = 1
  perPage.value = 9
}

watch(
  [
    searchQuery,
    selectedFamilies,
    selectedModalities,
    locationQuery,
    selectedDurations,
    selectedCertifications
  ],
  () => {
    currentPage.value = 1
    perPage.value = 9
  }
)

watch(isFilterPanelOpen, (open) => {
  if (!import.meta.client) return
  document.body.classList.toggle('overflow-hidden', open)
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.classList.remove('overflow-hidden')
  }
})
</script>
