import JSZip from 'jszip'
import robotFiles from '../data/robotFiles.json'

export async function downloadRobot(): Promise<boolean> {
  const plan = localStorage.getItem('qe_purchased_plan')
  if (!plan) return false

  const zip = new JSZip()
  for (const [path, content] of Object.entries(robotFiles)) {
    zip.file(path, content as string)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Quantum-Edge-V2.0.zip'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return true
}
