import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

// ---- Types you can align with your backend ----
type Service = { id: string; title: string; description: string; durationMin?: number; price?: number }
type CmsData = {
  site: { brand: string; phone: string; email: string; address: string }
  hero: { title: string; subtitle: string }
  about: { intro: string; approachText: string }
  services: Service[]
  media: { heroImage: string | null; gallery: string[] }
}

// ---- very small utility ----
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border-2 border-black/10 bg-white p-6">
    <h3 className="mb-4 text-lg font-semibold">{title}</h3>
    {children}
  </div>
)

export default function CmsPage() {
  const [initial, setInitial] = useState<CmsData | null>(null)

  const {
    register,
    control,
    getValues,
    reset,
    setValue,
    watch,
    formState: { isDirty, isSubmitting, dirtyFields },
    handleSubmit,
  } = useForm<CmsData>({
    defaultValues: {
      site: { brand: 'Serenity', phone: '+33 1 23 45 67 89', email: 'contact@example.com', address: 'Marseille, France' },
      hero: { title: 'Find Your Calm', subtitle: 'Therapeutic massage and holistic care' },
      about: { intro: 'Warm intro text here…', approachText: 'Our approach text here…' },
      services: [
        { id: 'swedish', title: 'Swedish', description: 'Gentle, relaxing', durationMin: 60, price: 70 },
        { id: 'deep', title: 'Deep Tissue', description: 'Targeted relief', durationMin: 60, price: 80 },
      ],
      media: { heroImage: null, gallery: [] },
    },
    mode: 'onChange',
  })

  // load from backend
  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const r = await fetch('/api/cms')
        if (!r.ok) throw new Error()
        const data = (await r.json()) as CmsData
        if (!ignore) {
          reset(data, { keepDefaultValues: false })
          setInitial(data)
        }
      } catch {
        // keep defaults if backend not ready
      }
    })()
    return () => { ignore = true }
  }, [reset])

  // image helpers
  const [heroPreview, setHeroPreview] = useState<string | null>(null)
  const handleHeroFile = (file?: File) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setHeroPreview(url)
    // In real flow: upload -> setValue('media.heroImage', uploadedUrl)
    // For now we store a blob URL so you see the preview
    setValue('media.heroImage', url, { shouldDirty: true })
  }

  const onSubmit = async (values: CmsData) => {
    try {
      const r = await fetch('/api/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!r.ok) throw new Error()
      toast.success('Saved')
      reset(values) // reset dirty state to clean
      setInitial(values)
    } catch {
      toast.error('Save failed')
    }
  }

  const resetAll = () => {
    if (initial) reset(initial)
  }

  // watch some fields to live-preview enables, if you want
  watch()

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h2 className="text-xl font-semibold">CMS</h2>
          {isDirty ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={resetAll} disabled={isSubmitting}>
                Reset
              </Button>
              <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save'}
              </Button>
            </div>
          ) : (
            <span className="text-sm text-black/50">All changes saved</span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <Section title="Site">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm">Brand</span>
              <input className="w-full rounded-xl border-2 border-black/10 px-3 py-2" {...register('site.brand')} />
            </label>
            <label className="space-y-1">
              <span className="text-sm">Phone</span>
              <input className="w-full rounded-xl border-2 border-black/10 px-3 py-2" {...register('site.phone')} />
            </label>
            <label className="space-y-1">
              <span className="text-sm">Email</span>
              <input type="email" className="w-full rounded-xl border-2 border-black/10 px-3 py-2" {...register('site.email')} />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm">Address</span>
              <input className="w-full rounded-xl border-2 border-black/10 px-3 py-2" {...register('site.address')} />
            </label>
          </div>
        </Section>

        <Section title="Hero">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm">Title</span>
              <input className="w-full rounded-xl border-2 border-black/10 px-3 py-2" {...register('hero.title')} />
            </label>
            <label className="space-y-1">
              <span className="text-sm">Subtitle</span>
              <input className="w-full rounded-xl border-2 border-black/10 px-3 py-2" {...register('hero.subtitle')} />
            </label>

            <div className="md:col-span-2">
              <span className="mb-2 block text-sm">Hero Image</span>
              <div className="flex items-center gap-4">
                <label className="inline-flex cursor-pointer items-center rounded-xl border-2 border-black/10 px-3 py-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleHeroFile(e.target.files?.[0])}
                  />
                  <span>Choose file…</span>
                </label>
                {(heroPreview || getValues('media.heroImage')) && (
                  <img
                    src={heroPreview || (getValues('media.heroImage') as string)}
                    className="h-16 w-24 rounded-lg object-cover"
                    alt="Hero preview"
                  />
                )}
              </div>
            </div>
          </div>
        </Section>

        <Section title="About">
          <div className="grid gap-4">
            <label className="space-y-1">
              <span className="text-sm">Intro</span>
              <textarea rows={3} className="w-full rounded-xl border-2 border-black/10 px-3 py-2" {...register('about.intro')} />
            </label>
            <label className="space-y-1">
              <span className="text-sm">Approach</span>
              <textarea rows={3} className="w-full rounded-xl border-2 border-black/10 px-3 py-2" {...register('about.approachText')} />
            </label>
          </div>
        </Section>

        <Section title="Services">
          <ServiceEditor />
        </Section>

        <Section title="Contact">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 md:col-span-1">
              <span className="text-sm">Phone</span>
              <input className="w-full rounded-xl border-2 border-black/10 px-3 py-2" {...register('site.phone')} />
            </label>
            <label className="space-y-1 md:col-span-1">
              <span className="text-sm">Email</span>
              <input type="email" className="w-full rounded-xl border-2 border-black/10 px-3 py-2" {...register('site.email')} />
            </label>
            <label className="space-y-1 md:col-span-1">
              <span className="text-sm">Address</span>
              <input className="w-full rounded-xl border-2 border-black/10 px-3 py-2" {...register('site.address')} />
            </label>
          </div>
        </Section>
      </main>
    </div>
  )
}

// inline services editor (minimal, extend if needed)
function ServiceEditor() {
  const [services, setServices] = useState<Service[]>([])
  // This component can read/write via useFormContext if you want deeper integration.
  // Kept minimal here to avoid boilerplate. You can replace with RHF fieldArray later.

  useEffect(() => {
    // load services from your main form (or backend)
    // placeholder; you can pass props to sync with RHF
  }, [])

  return (
    <div className="space-y-4">
      <p className="text-sm text-black/60">Basic service list editor (replace with FieldArray when ready).</p>
      <div className="rounded-xl border-2 border-black/10 p-4 text-sm text-black/50">
        Connect this to your RHF `services` array (useFieldArray) when you’re ready.
      </div>
    </div>
  )
}
