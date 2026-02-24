import { Button } from "@/components/atoms"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import Image from "next/image"

export const BannerSection = () => {
  return (
    <section className="bg-tertiary container text-tertiary">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
        <div className="py-6 px-6 flex flex-col h-full justify-between border border-secondary rounded-sm">
          <div className="mb-8 lg:mb-48">
            <span className="text-sm inline-block px-4 py-1 border border-secondary rounded-sm">
              #ESG & IMPACT
            </span>
            <h2 className="display-sm">
              TRUSTED VENDORS FOR A SUSTAINABLE FUTURE
            </h2>
            <p className="text-lg text-tertiary max-w-lg">
              Connect with verified providers of ESG audits, sustainability
              consulting, and impact solutions. Quality and transparency built in.
            </p>
          </div>
          <LocalizedClientLink href="/categories">
            <Button size="large" className="w-fit bg-secondary/10">
              EXPLORE VENDORS
            </Button>
          </LocalizedClientLink>
        </div>
        <div className="relative aspect-[4/3] lg:aspect-[4/3] lg:max-w-[560px] lg:max-h-[420px] lg:ml-auto flex justify-end rounded-sm overflow-hidden">
          <Image
            loading="lazy"
            fetchPriority="high"
            src="/images/banner-section/Image.jpg"
            alt="Sustainability and ESG – trusted marketplace for responsible business"
            width={700}
            height={525}
            className="object-cover object-top rounded-sm w-full h-full"
            sizes="(min-width: 1024px)  min(50vw, 560px), 100vw"
          />
        </div>
      </div>
    </section>
  )
}
