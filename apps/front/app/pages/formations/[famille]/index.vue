<template>
  <div class="flex flex-1 flex-col">
    <template v-if="pageState === 'found'">
      <!-- Hero / intro famille -->
      <section class="border-b border-rule bg-linear-to-b from-paper to-surface">
        <div class="mx-auto max-w-container px-gutter-mobile py-section md:px-gutter">
          <div class="grid grid-cols-1 items-start gap-2xl lg:grid-cols-5">
            <div class="lg:col-span-3">
              <p class="text-overline text-accent-text">Famille de formations</p>
              <h1
                class="mt-sm font-display text-h2 font-extrabold leading-tight text-ink lg:text-h1"
              >
                CACES® &amp; conduite d'engins
              </h1>
              <p class="mt-md max-w-prose text-body text-ink-body">
                La conduite d'équipements de travail mobiles est encadrée par les recommandations
                CACES® de l'Assurance Maladie. Ces formations couvrent la délivrance initiale et le
                renouvellement, par catégorie d'engin, en centre ou sur site.
              </p>

              <ul class="mt-lg flex flex-wrap gap-sm">
                <Badge as="li" variant="chip">{{ formations.length }} formations</Badge>
                <Badge as="li" variant="chip">Recommandations R482 à R490</Badge>
                <Badge as="li" variant="chip">Initial &amp; recyclage</Badge>
                <Badge as="li" variant="success">
                  <span class="h-sm w-sm rounded-full bg-current" aria-hidden="true" />
                  Sessions ce mois-ci
                </Badge>
              </ul>
            </div>

            <figure
              class="flex aspect-video w-full items-center justify-center rounded-md border border-dashed border-outline bg-surface-alt lg:col-span-2 lg:aspect-4/3"
            >
              <figcaption class="px-lg text-center text-meta text-ink-muted">
                Photo réelle — plateau technique<br />engins de manutention (4:3)
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <!-- Parcourir par type d'engin -->
      <section
        class="mx-auto w-full max-w-container px-gutter-mobile py-section md:px-gutter"
        aria-labelledby="sous-familles-title"
      >
        <h2 id="sous-familles-title" class="font-sans text-h4 font-bold text-ink">
          Parcourir par type d'engin
        </h2>

        <ul class="mt-lg grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4">
          <li
            v-for="subFamily in subFamilies"
            :key="subFamily.key"
            class="flex flex-col gap-md rounded-md border border-rule bg-surface p-lg"
          >
            <div>
              <h3 class="font-semibold text-ink">{{ subFamily.label }}</h3>
              <p class="mt-xs text-small text-ink-muted">{{ subFamily.caption }}</p>
            </div>
            <button
              type="button"
              class="mt-auto self-start text-small font-semibold text-primary hover:underline"
              @click="selectSubFamily(subFamily.key)"
            >
              Voir la sous-famille →
            </button>
          </li>
        </ul>
      </section>

      <!-- Liste des formations + filtres -->
      <section
        id="liste-formations"
        class="mx-auto w-full max-w-container scroll-mt-lg px-gutter-mobile pb-section md:px-gutter"
        aria-labelledby="liste-title"
      >
        <div class="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
          <h2 id="liste-title" class="font-sans text-h4 font-bold text-ink">
            {{ filteredFormations.length }}
            {{ filteredFormations.length > 1 ? 'formations' : 'formation' }} dans cette famille
          </h2>

          <div class="flex flex-wrap gap-sm">
            <Select v-model="selectedSubFamily" aria-label="Filtrer par sous-famille">
              <SelectTrigger
                aria-label="Sous-famille"
                class="h-control w-auto gap-sm rounded-full border-outline bg-paper px-md text-small font-semibold text-ink-body shadow-none"
              >
                <span class="truncate">{{ subFamilyFilterLabel }}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in subFamilyOptions"
                  :key="option.value"
                  :value="option.value"
                  class="text-small"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="selectedModality" aria-label="Filtrer par modalité">
              <SelectTrigger
                aria-label="Modalité"
                class="h-control w-auto gap-sm rounded-full border-outline bg-paper px-md text-small font-semibold text-ink-body shadow-none"
              >
                <span class="truncate">{{ modalityFilterLabel }}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in modalityOptions"
                  :key="option.value"
                  :value="option.value"
                  class="text-small"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="selectedLocation" aria-label="Filtrer par localisation">
              <SelectTrigger
                aria-label="Localisation"
                class="h-control w-auto gap-sm rounded-full border-outline bg-paper px-md text-small font-semibold text-ink-body shadow-none"
              >
                <span class="truncate">{{ locationFilterLabel }}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in locationOptions"
                  :key="option.value"
                  :value="option.value"
                  class="text-small"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="selectedAvailability" aria-label="Filtrer par disponibilité">
              <SelectTrigger
                aria-label="Disponibilité"
                class="h-control w-auto gap-sm rounded-full border-outline bg-paper px-md text-small font-semibold text-ink-body shadow-none"
              >
                <span class="truncate">{{ availabilityFilterLabel }}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in availabilityOptions"
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

        <p class="mt-sm text-meta text-ink-subtle">
          Filtres limités au périmètre de la famille (RG-FAM-05) — pas de filtre « famille » ici.
          Famille conservée dans le contexte analytique (RG-FAM-06).
        </p>

        <!-- État vide -->
        <div
          v-if="filteredFormations.length === 0"
          class="mt-lg flex flex-col items-center rounded-md border border-dashed border-rule bg-surface-soft px-lg py-4xl text-center"
        >
          <IconSearchMinus :size="30" class="text-ink-muted" />
          <h3 class="mt-md font-sans text-h4 font-bold text-ink">
            Aucune formation ne correspond à ces critères.
          </h3>
          <p class="mt-sm max-w-prose text-small text-ink-body">
            Élargissez vos critères ou transmettez votre besoin : une réponse adaptée vous sera
            proposée.
          </p>
          <button
            type="button"
            class="mt-lg text-small font-semibold text-primary underline"
            @click="resetFilters"
          >
            Réinitialiser les filtres
          </button>
        </div>

        <!-- Grille résultats -->
        <ul v-else class="mt-lg grid grid-cols-1 gap-md md:grid-cols-2 lg:grid-cols-3">
          <li v-for="formation in visibleFormations" :key="formation.slug">
            <CenterFormationCard
              :family="formation.subFamilyLabel"
              :title="formation.title"
              :description="formation.description"
              :meta="formation.meta"
              :status="formation.status"
              :to="formation.to"
              class="h-full"
            />
          </li>
        </ul>

        <div v-if="hasMore" class="mt-2xl flex justify-center">
          <Button
            type="button"
            variant="outline"
            class="h-control rounded-full border-outline px-lg text-small font-semibold text-ink hover:bg-surface"
            @click="showMore"
          >
            Afficher les {{ filteredFormations.length - visibleFormations.length }} autres
            formations
          </Button>
        </div>
      </section>

      <!-- Blocs d'information -->
      <section
        class="mx-auto w-full max-w-container px-gutter-mobile pb-section md:px-gutter"
        aria-label="Informations sur la famille"
      >
        <div class="grid grid-cols-1 gap-lg md:grid-cols-2">
          <article class="rounded-md bg-surface p-lg">
            <h2 class="font-semibold text-ink">Qui est concerné ?</h2>
            <p class="mt-md text-small leading-relaxed text-ink-body">
              Tout salarié amené à conduire un engin de la famille concernée : caristes, conducteurs
              d'engins de chantier, opérateurs nacelle, grutiers. L'employeur délivre une
              autorisation de conduite sur la base du CACES®, de l'aptitude médicale et de la
              connaissance des lieux.
            </p>
          </article>

          <article class="rounded-md bg-surface p-lg">
            <h2 class="font-semibold text-ink">Validité et renouvellement</h2>
            <p class="mt-md text-small leading-relaxed text-ink-body">
              Les CACES® de cette famille sont valables 5 ans (10 ans pour le R482). Le
              renouvellement passe par une formation de recyclage et de nouveaux tests. Les sessions
              de recyclage sont identifiées comme telles dans la liste ci-dessus.
            </p>
          </article>
        </div>
      </section>

      <!-- Bandeau CTA -->
      <section class="mx-auto w-full max-w-container px-gutter-mobile pb-section md:px-gutter">
        <CtaBanner
          title="Quelle catégorie pour vos équipes ?"
          text="Décrivez vos engins et votre site : LEARN UP identifie les recommandations et catégories applicables."
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
            <NuxtLink :to="`/centres/demande-de-formation?famille=${famille}`"
              >Faire une demande</NuxtLink
            >
          </Button>
        </CtaBanner>
      </section>
    </template>

    <!-- État : erreur de chargement -->
    <LoadError
      v-else-if="loadError"
      title="Le contenu n'a pas pu être chargé."
      link-to="/formations"
      link-label="Voir le catalogue"
      @retry="retry"
    >
      Vérifiez votre connexion, puis réessayez. Si le problème persiste, le catalogue reste
      accessible.
    </LoadError>

    <!-- État : famille introuvable -->
    <NotFound
      v-else
      title="Cette famille de formations n'est pas disponible."
      primary-to="/formations"
      primary-label="Voir le catalogue"
      secondary-to="#"
      secondary-label="Être guidé dans mon choix"
      search-placeholder="Intitulé, compétence ou certification"
      search-label="Rechercher une formation"
      search-input-id="famille-search"
      @search="onErrorSearch"
    >
      <template #icon>
        <IconFileOff :size="32" class="text-ink" />
      </template>
      La page demandée n'existe pas ou n'est plus publiée. Le catalogue présente l'ensemble des
      familles de formations actuellement proposées.
    </NotFound>
  </div>
</template>

<script setup lang="ts">
interface FamilleFormationItem {
  slug: string
  subFamily: string
  subFamilyLabel: string
  title: string
  description: string
  meta: string
  modalities: string[]
  region: string
  status?: { type: 'success' | 'warning' | 'neutral'; label: string }
  to: string
}

definePageMeta({
  layout: 'with-breadcrumb',
  breadcrumb: [
    { label: 'Accueil', to: '/' },
    { label: 'Formations', to: '/formations' },
    { label: 'CACES & conduite d’engins' }
  ]
})

const route = useRoute()
const famille = route.params.famille as string

// Maquette : seule la famille CACES existe tant que le catalogue familles
// n'est pas branché — null pour tout autre slug (état introuvable).
// ?error=1 simule une erreur de chargement pour prévisualiser l'état erreur.
const {
  data: familleData,
  error: loadError,
  refresh
} = await useAsyncData(`famille-${famille}`, () => {
  if (route.query.error === '1') {
    return Promise.reject(new Error('Famille load failed'))
  }
  return Promise.resolve(famille === 'caces-conduite-engins' ? { slug: famille } : null)
})

type PageState = 'found' | 'not-found' | 'error'
const pageState = computed<PageState>(() => {
  if (loadError.value) return 'error'
  return familleData.value ? 'found' : 'not-found'
})

// Statut HTTP côté SSR selon l'état affiché.
const requestEvent = useRequestEvent()
if (requestEvent) {
  if (pageState.value === 'error') {
    setResponseStatus(requestEvent, 500, 'Erreur de chargement de la famille')
  } else if (pageState.value === 'not-found') {
    setResponseStatus(requestEvent, 404, 'Famille introuvable')
  }
}

// Breadcrumb adapté à l'état affiché. route.meta est partagé entre toutes
// les routes /formations/:famille : on réassigne la valeur à chaque
// changement d'état pour ne pas conserver le breadcrumb d'une famille précédente.
const defaultBreadcrumb = [
  { label: 'Accueil', to: '/' },
  { label: 'Formations', to: '/formations' },
  { label: 'CACES & conduite d’engins' }
]
const stateLabels: Record<Exclude<PageState, 'found'>, string> = {
  'not-found': 'Famille introuvable',
  error: 'Erreur de chargement'
}
watchEffect(() => {
  const stateLabel = pageState.value === 'found' ? null : stateLabels[pageState.value]
  route.meta.breadcrumb = stateLabel
    ? [
        { label: 'Accueil', to: '/' },
        { label: 'Formations', to: '/formations' },
        { label: stateLabel }
      ]
    : defaultBreadcrumb
})

const seoByState: Record<
  PageState,
  { seo_title: string; seo_description: string; seo_noindex?: boolean }
> = {
  found: {
    seo_title: 'CACES & conduite d’engins — Formations | LEARN UP ACADEMY',
    seo_description:
      'Formations CACES® initiales et recyclage, par catégorie d’engin, en centre ou sur site.'
  },
  'not-found': {
    seo_title: 'Famille introuvable',
    seo_description: "Cette famille de formations n'existe pas ou n'est plus publiée.",
    seo_noindex: true
  },
  error: {
    seo_title: 'Erreur de chargement',
    seo_description: "Le contenu de la famille n'a pas pu être chargé.",
    seo_noindex: true
  }
}
// Getter réactif : le SEO suit pageState si refresh() change l'état affiché.
useContentSeo(
  () => seoByState[pageState.value],
  () => seoByState[pageState.value].seo_title
)

function retry() {
  if (route.query.error) {
    // Retire le paramètre de simulation pour permettre un vrai rechargement.
    const { error: _error, ...query } = route.query
    navigateTo({ path: route.path, query })
  } else {
    refresh()
  }
}

function onErrorSearch(query: string) {
  navigateTo({ path: '/formations', query: query ? { q: query } : {} })
}

const subFamilies = [
  { key: 'chariots', label: 'Chariots & gerbeurs', caption: 'R489 · R485 — 3 formations' },
  { key: 'chantier', label: 'Engins de chantier', caption: 'R482 — 2 formations' },
  { key: 'nacelles', label: 'Nacelles — PEMP', caption: 'R486 — 2 formations' },
  { key: 'levage', label: 'Grues & levage', caption: 'R490 · R484 — 1 formation' }
]

const formations: FamilleFormationItem[] = [
  {
    slug: 'caces-r489-chariots-elevateurs',
    subFamily: 'chariots',
    subFamilyLabel: 'Chariots & gerbeurs',
    title: 'CACES R489 — chariots élévateurs',
    description: 'Conduite en sécurité des chariots de manutention, catégories 1A à 5.',
    meta: '2 à 5 jours · Inter / intra · CACES®',
    modalities: ['inter', 'intra', 'presentiel'],
    region: 'Île-de-France',
    status: { type: 'success', label: 'Sessions ce mois-ci' },
    to: '/formations/caces-conduite-engins/caces-r489-chariots-elevateurs'
  },
  {
    slug: 'caces-r485-gerbeurs',
    subFamily: 'chariots',
    subFamilyLabel: 'Chariots & gerbeurs',
    title: 'CACES R485 — gerbeurs à conducteur accompagnant',
    description: 'Catégories 1 et 2, levée supérieure à 1,20 m.',
    meta: '1 à 2 jours · Inter / intra · CACES®',
    modalities: ['inter', 'intra', 'presentiel'],
    region: 'National',
    status: { type: 'warning', label: 'Prochaine le 26/09' },
    to: '#'
  },
  {
    slug: 'caces-r482-engins-chantier',
    subFamily: 'chantier',
    subFamilyLabel: 'Engins de chantier',
    title: 'CACES R482 — engins de chantier',
    description: 'Catégories A à G : pelles, chargeuses, compacteurs, engins de transport.',
    meta: '2 à 10 jours · Inter / intra · CACES®',
    modalities: ['inter', 'intra', 'presentiel'],
    region: 'National',
    status: { type: 'success', label: 'Sessions ce mois-ci' },
    to: '#'
  },
  {
    slug: 'caces-r486-pemp',
    subFamily: 'nacelles',
    subFamilyLabel: 'Nacelles — PEMP',
    title: 'CACES R486 — plateformes élévatrices',
    description: 'Catégories A et B, conduite hors production et vérifications.',
    meta: '2 à 3 jours · Inter / intra · CACES®',
    modalities: ['inter', 'intra', 'presentiel'],
    region: 'Île-de-France',
    status: { type: 'success', label: 'Sessions ce mois-ci' },
    to: '#'
  },
  {
    slug: 'caces-r490-grues',
    subFamily: 'levage',
    subFamilyLabel: 'Grues & levage',
    title: 'CACES R490 — grues de chargement',
    description: 'Grues auxiliaires de chargement de véhicules, avec ou sans télécommande.',
    meta: '2 à 3 jours · Inter / intra · CACES®',
    modalities: ['inter', 'intra', 'presentiel'],
    region: 'National',
    status: { type: 'neutral', label: 'Sur demande' },
    to: '#'
  },
  {
    slug: 'caces-r489-recyclage',
    subFamily: 'chariots',
    subFamilyLabel: 'Chariots & gerbeurs',
    title: 'Recyclage CACES R489 — toutes catégories',
    description: 'Renouvellement avant échéance de validité, théorie et pratique.',
    meta: '2 jours · Inter / intra · CACES®',
    modalities: ['inter', 'intra', 'presentiel'],
    region: 'Île-de-France',
    status: { type: 'warning', label: '2 places le 19/09' },
    to: '#'
  },
  {
    slug: 'caces-r482-recyclage',
    subFamily: 'chantier',
    subFamilyLabel: 'Engins de chantier',
    title: 'Recyclage CACES R482 — engins de chantier',
    description: 'Maintien des compétences et renouvellement de la recommandation.',
    meta: '1 à 3 jours · Inter / intra · CACES®',
    modalities: ['inter', 'intra', 'presentiel'],
    region: 'National',
    status: { type: 'neutral', label: 'Sur demande' },
    to: '#'
  },
  {
    slug: 'caces-r486-recyclage',
    subFamily: 'nacelles',
    subFamilyLabel: 'Nacelles — PEMP',
    title: 'Recyclage CACES R486 — PEMP',
    description: 'Renouvellement périodique pour opérateurs nacelle en poste.',
    meta: '1 à 2 jours · Inter / intra · CACES®',
    modalities: ['inter', 'intra', 'presentiel'],
    region: 'Occitanie',
    status: { type: 'success', label: 'Sessions ce mois-ci' },
    to: '#'
  }
]

const selectedSubFamily = ref('all')
const selectedModality = ref('all')
const selectedLocation = ref('all')
const selectedAvailability = ref('all')
const visibleCount = ref(6)

const subFamilyOptions = [
  { value: 'all', label: 'Sous-famille' },
  ...subFamilies.map((s) => ({ value: s.key, label: s.label }))
]
const modalityOptions = [
  { value: 'all', label: 'Modalité' },
  { value: 'inter', label: 'Inter' },
  { value: 'intra', label: 'Intra' },
  { value: 'presentiel', label: 'Présentiel' }
]
const locationOptions = [
  { value: 'all', label: 'Localisation' },
  { value: 'Île-de-France', label: 'Île-de-France' },
  { value: 'Occitanie', label: 'Occitanie' },
  { value: 'National', label: 'National' }
]
const availabilityOptions = [
  { value: 'all', label: 'Disponibilité' },
  { value: 'success', label: 'Sessions ce mois-ci' },
  { value: 'warning', label: 'Prochaine session' },
  { value: 'neutral', label: 'Sur demande' }
]

const subFamilyFilterLabel = computed(
  () => subFamilyOptions.find((o) => o.value === selectedSubFamily.value)?.label ?? 'Sous-famille'
)
const modalityFilterLabel = computed(
  () => modalityOptions.find((o) => o.value === selectedModality.value)?.label ?? 'Modalité'
)
const locationFilterLabel = computed(
  () => locationOptions.find((o) => o.value === selectedLocation.value)?.label ?? 'Localisation'
)
const availabilityFilterLabel = computed(
  () =>
    availabilityOptions.find((o) => o.value === selectedAvailability.value)?.label ??
    'Disponibilité'
)

const filteredFormations = computed(() =>
  formations.filter((f) => {
    if (selectedSubFamily.value !== 'all' && f.subFamily !== selectedSubFamily.value) return false
    if (selectedModality.value !== 'all' && !f.modalities.includes(selectedModality.value)) {
      return false
    }
    if (selectedLocation.value !== 'all' && f.region !== selectedLocation.value) return false
    if (selectedAvailability.value !== 'all' && f.status?.type !== selectedAvailability.value) {
      return false
    }
    return true
  })
)

const visibleFormations = computed(() => filteredFormations.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleFormations.value.length < filteredFormations.value.length)

function selectSubFamily(key: string) {
  selectedSubFamily.value = key
  if (import.meta.client) {
    document.getElementById('liste-formations')?.scrollIntoView({ behavior: 'smooth' })
  }
}

function resetFilters() {
  selectedSubFamily.value = 'all'
  selectedModality.value = 'all'
  selectedLocation.value = 'all'
  selectedAvailability.value = 'all'
  visibleCount.value = 6
}

function showMore() {
  visibleCount.value += 6
}

watch([selectedSubFamily, selectedModality, selectedLocation, selectedAvailability], () => {
  visibleCount.value = 6
})
</script>
