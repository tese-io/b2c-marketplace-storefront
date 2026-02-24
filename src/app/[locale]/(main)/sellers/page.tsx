import { Breadcrumbs } from "@/components/atoms"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Vendors",
  description: "Browse verified sustainable vendors and sellers on tese.io marketplace",
}

export default async function SellersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", path: "/" },
          { label: "Vendors", path: "/sellers" },
        ]}
      />

      <div className="mt-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Our Verified Vendors
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Discover trusted sustainable vendors and sellers committed to ESG principles.
        </p>

        {/* Placeholder for sellers listing */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Vendors Directory Coming Soon
            </h3>
            <p className="text-sm text-gray-500">
              We're working on bringing you a comprehensive directory of verified sustainable vendors.
              Check back soon!
            </p>
          </div>
        </div>

        {/* Future: Add sellers listing component here */}
        {/* <SellersListing locale={locale} /> */}
      </div>
    </div>
  )
}
