const CACHE_NAME = "gov-admin-pwa-v1"
const urlsToCache = ["/", "/static/js/bundle.js", "/static/css/main.css", "/manifest.json"]

// Declare getOfflineData and removeOfflineData functions
async function getOfflineData() {
  // Placeholder for logic to retrieve offline data
  return []
}

async function removeOfflineData(id) {
  // Placeholder for logic to remove offline data by id
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})

// Background sync for offline form submissions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(syncOfflineData())
  }
})

async function syncOfflineData() {
  // Sync offline form submissions when back online
  const offlineData = await getOfflineData()
  for (const data of offlineData) {
    try {
      await fetch("/api/sync", {
        method: "POST",
        body: JSON.stringify(data),
      })
      await removeOfflineData(data.id)
    } catch (error) {
      console.error("Sync failed:", error)
    }
  }
}
