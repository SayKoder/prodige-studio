import { writeFile, unlink, mkdir } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function saveFile(file: File, categorie: string): Promise<{ storagePath: string; urlPublique: string }> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${categorie}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  await mkdir(UPLOAD_DIR, { recursive: true })

  const bytes = await file.arrayBuffer()
  await writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(bytes))

  return {
    storagePath: filename,
    urlPublique: `/uploads/${filename}`,
  }
}

export async function removeFile(storagePath: string): Promise<void> {
  try {
    await unlink(path.join(UPLOAD_DIR, path.basename(storagePath)))
  } catch {
    // Fichier inexistant — on ignore
  }
}
