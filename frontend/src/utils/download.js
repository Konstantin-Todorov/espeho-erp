import api from '../api/axios'
import toast from 'react-hot-toast'

// Files need the login token, so they are fetched as a blob instead of a plain <a href> link.
export async function downloadFile(fileId, name) {
  try {
    const res = await api.get(`/files/download/${fileId}`, { responseType: 'blob', timeout: 120000 })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = name || 'file'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  } catch (err) {
    let msg = 'Файлът не може да бъде свален'
    try { msg = JSON.parse(await err.response.data.text()).error || msg } catch { /* not JSON */ }
    toast.error(msg)
  }
}
