/* Thin promise wrapper over the browser Geolocation API.
   Used by the "near me" filters that call MapService's nearby search. */

export function getCurrentPosition(options = { timeout: 8000, maximumAge: 60000 }) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('geolocation-unavailable'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(err),
      options,
    )
  })
}
