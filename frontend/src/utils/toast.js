export function showToast(message, type = 'success') {
  window.dispatchEvent(
    new CustomEvent('app-toast', { detail: { message, type } })
  )
}
