import React from 'react'

type Props = {
  title: string
  children: React.ReactNode
}

export function LegalPageLayout({ title, children }: Props) {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-charcoal">
          {title}
        </h1>
        <p className="mt-2 text-sm text-charcoal/70">
          Dernière mise à jour : <time dateTime="2026-01-19">19 janvier 2026</time>
        </p>
      </header>

      <div className="prose prose-neutral max-w-none prose-headings:font-heading prose-headings:text-charcoal prose-p:text-charcoal/80 prose-li:text-charcoal/80">
        {children}
      </div>
    </main>
  )
}
