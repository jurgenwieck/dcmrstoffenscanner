<script setup lang="ts">
</script>

<template>
  <main>
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-4">Welkom bij DCMR</h1>
        <p class="text-gray-600 mb-6">
          Inspectiesysteem voor gevaarlijke stoffen met ADR-validatie
        </p>

        <!-- Primary CTA -->
        <div class="bg-primary-50 border-2 border-primary-200 rounded-lg p-6 mb-6">
          <h2 class="text-xl font-semibold text-primary-900 mb-2">Start een nieuwe inspectie</h2>
          <p class="text-primary-700 mb-4">
            Maak meerdere foto's, detecteer stoffen en valideer tegen ADR-limieten
          </p>
          <UButton :to="{ name: 'InspectionSession' }" color="primary" size="xl">
            <UIcon name="i-lucide-camera" class="h-5 w-5 mr-2"  />
            Inspectie starten
          </UButton>
        </div>

        <!-- Secondary options -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UCard>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <UIcon name="i-lucide-clipboard-list" class="h-6 w-6 text-blue-600"  />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Inspectie overzicht</h3>
                  <p class="text-sm text-gray-600">Bekijk actieve inspectie</p>
                </div>
              </div>
              <UButton :to="{ name: 'InspectionOverview' }" color="neutral" variant="outline" block>
                Naar overzicht
              </UButton>
            </div>
          </UCard>

          <UCard>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <UIcon name="i-lucide-flask-conical" class="h-6 w-6 text-green-600"  />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Enkele foto scannen</h3>
                  <p class="text-sm text-gray-600">Snelle stof detectie</p>
                </div>
              </div>
              <UButton :to="{ name: 'SubstanceScan' }" color="neutral" variant="outline" block>
                Scan starten
              </UButton>
            </div>
          </UCard>
        </div>

        <!-- Legacy tools -->
        <details class="mt-6">
          <summary class="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
            Oudere tools tonen
          </summary>
          <div class="mt-3">
            <UButton :to="{ name: 'ScanPOC' }" color="neutral" variant="ghost" size="sm">
              <UIcon name="i-lucide-camera" class="h-4 w-4 mr-2"  />
              Product Scanner (POC)
            </UButton>
          </div>
        </details>
      </div>
    </div>
  </main>
</template>
