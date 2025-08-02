import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
export default function CertifyPage() {
  return (
    <div className="flex flex-col min-h-screen p-4 max-w-7xl mx-auto">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Certify</h1>
        <p className="text-gray-300">This is the certification page where users can take typing tests to earn certificates.</p>
      </main>
      <Footer />
    </div>
  )
}
