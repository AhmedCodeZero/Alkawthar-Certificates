import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

export function downloadDataUrl(item: { dataUrl: string; fileName: string }): void {
  const a = document.createElement("a")
  a.href = item.dataUrl
  a.download = item.fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
}
