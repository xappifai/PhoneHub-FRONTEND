"use client"
import { initializeApp, getApps } from 'firebase/app'

// Validate required environment variables
const requiredEnvVars = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Firebase environment variables: ${missingVars.join(', ')}. ` +
    `Please add them to your .env.local file.`
  )
}

const firebaseConfig = {
  apiKey: requiredEnvVars.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: requiredEnvVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: requiredEnvVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: requiredEnvVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: requiredEnvVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: requiredEnvVars.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: requiredEnvVars.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

export function getFirebaseApp() {
  if (!getApps().length) {
    initializeApp(firebaseConfig)
  }
  return getApps()[0]!
}

// Ensure we are authenticated (anonymous) for buckets that require auth
let authReady: Promise<void> | null = null
async function ensureAuth() {
  if (typeof window === 'undefined') return
  if (!authReady) {
    authReady = (async () => {
      try {
        const { getAuth, onAuthStateChanged, signInAnonymously } = await import('firebase/auth')
        const app = getFirebaseApp()
        const auth = getAuth(app)
        await new Promise<void>((resolve) => {
          const unsub = onAuthStateChanged(auth, () => {
            unsub()
            resolve()
          })
        })
        if (!auth.currentUser) {
          await signInAnonymously(auth)
        }
      } catch (e) {
        // If anonymous auth is disabled, continue; Storage rules might be public.
        // Surface details in console for debugging.
        console.warn('Firebase anonymous auth not available, proceeding without auth.', e)
      }
    })()
  }
  await authReady
}

export async function uploadFileToFirebase(file: File, destinationPrefix: string): Promise<string> {
  // Dynamically import browser storage SDK to avoid node build (undici) on client bundles
  const { getStorage, ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage')
  await ensureAuth()
  const app = getFirebaseApp()
  
  // Simplified: Use default bucket (config.storageBucket is already set correctly)
  const storage = getStorage(app)  // No second arg needed for default
  
  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')
  const path = `${destinationPrefix}/${Date.now()}-${safeName}`
  const storageRef = ref(storage, path)
  try {
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type || 'image/jpeg',
      cacheControl: 'public, max-age=31536000'
    })
    // Fail fast if Firebase retries too long
    const UPLOAD_TIMEOUT_MS = 20000
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        try { (uploadTask as any).cancel?.() } catch {}
        reject(new Error('storage/upload-timeout'))
      }, UPLOAD_TIMEOUT_MS)
      uploadTask.on('state_changed', undefined, (err) => {
        clearTimeout(timer)
        reject(err)
      }, () => {
        clearTimeout(timer)
        resolve()
      })
    })
    const url = await getDownloadURL(uploadTask.snapshot.ref)
    return url
  } catch (err: any) {
    const message = err?.code || err?.message || String(err)
    console.error('Firebase upload failed:', { message, fileName: file.name, path, bucket: firebaseConfig.storageBucket })
    throw new Error(`Upload failed: ${message}. Ensure Storage rules allow this client and the bucket (${firebaseConfig.storageBucket}) exists.`)
  }
}

export async function deleteFileFromFirebase(fileUrl: string): Promise<void> {
  const { getStorage, ref, deleteObject } = await import('firebase/storage')
  await ensureAuth()
  const app = getFirebaseApp()
  const storage = getStorage(app)
  // fileUrl is a download URL; ref can accept a full URL
  try {
    const r = ref(storage, fileUrl)
    await deleteObject(r)
  } catch (err) {
    console.warn('Firebase delete failed (continuing):', err)
  }
}

// Compress an image file in the browser before upload to reduce latency and bandwidth
export async function compressImageForUpload(
  file: File,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
  const { maxDimension = 1600, quality = 0.8 } = options
  if (!file || !file.type?.startsWith('image/')) return file

  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const img: HTMLImageElement = await new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = dataUrl
  })

  let targetW = img.width
  let targetH = img.height
  if (img.width > maxDimension || img.height > maxDimension) {
    const ratio = Math.min(maxDimension / img.width, maxDimension / img.height)
    targetW = Math.round(img.width * ratio)
    targetH = Math.round(img.height * ratio)
  }

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')
  ctx?.drawImage(img, 0, 0, targetW, targetH)

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  )
  if (!blob) return file
  const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  return new File([blob], newName, { type: 'image/jpeg' })
}