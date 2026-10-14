'use client';

import { useEffect, useState } from 'react';

import { HttpTypes } from '@medusajs/types';

import { IconButton } from '@/components/atoms';
import { HeaderCategoryNavbar } from '@/components/molecules';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import { HOME_SERVICES } from '@/data/homepage';
import { SECTORS } from '@/data/sectors';
import { CloseIcon, HamburgerMenuIcon } from '@/icons';
import { buildCatalogQuery } from '@/lib/helpers/sector-preferences';

import { MobileCategoryNavbar } from './components';
import { useTranslations } from 'next-intl'
import { useTranslatedSectors } from '@/lib/i18n/sector-copy'

export const MobileNavbar = ({
  categories,
  parentCategories
}: {
  categories: HttpTypes.StoreProductCategory[];
  parentCategories: HttpTypes.StoreProductCategory[];
}) => {
  const tServices = useTranslations('home.services')
  const translatedSectors = useTranslatedSectors(SECTORS)
  const [isOpen, setIsOpen] = useState(false);

  const closeMenuHandler = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div
      className="lg:hidden"
      data-testid="mobile-navbar"
    >
      <div
        onClick={() => setIsOpen(true)}
        data-testid="mobile-menu-toggle"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white text-primary cursor-pointer hover:border-tese-lime/50 transition"
        aria-label="Open menu"
      >
        <HamburgerMenuIcon />
      </div>
      {isOpen && (
        <div
          className="fixed left-0 top-0 z-20 h-full w-full bg-primary"
          data-testid="mobile-menu-drawer"
        >
          <div
            className="flex items-center justify-between border-b p-4"
            data-testid="mobile-menu-header"
          >
            <h2 className="heading-md uppercase text-primary">Menu</h2>
            <IconButton
              icon={<CloseIcon size={20} />}
              onClick={() => closeMenuHandler()}
              variant="icon"
              size="small"
              data-testid="mobile-menu-close-button"
            />
          </div>
          <div className="">
            <nav
              className="flex flex-col border-b border-white/10 px-4 py-3 gap-1"
              aria-label="Main navigation"
            >
              <LocalizedClientLink
                href="/categories"
                onClick={closeMenuHandler}
                className="label-md uppercase px-2 py-2.5 text-primary hover:opacity-80"
              >
                Products
              </LocalizedClientLink>
              <p className="px-2 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-secondary">
                Services
              </p>
              {HOME_SERVICES.map((service) => (
                <LocalizedClientLink
                  key={service.id}
                  href={service.href}
                  onClick={closeMenuHandler}
                  className="px-2 py-2 text-sm text-primary hover:opacity-80"
                >
                  {tServices(`${service.key}.title`)}
                </LocalizedClientLink>
              ))}
              <LocalizedClientLink
                href={`/categories${buildCatalogQuery('all', undefined, 'service')}`}
                onClick={closeMenuHandler}
                className="px-2 py-2 text-sm font-semibold text-tese-ice hover:opacity-80"
              >
                View all services →
              </LocalizedClientLink>
              <p className="px-2 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-secondary">
                Industries
              </p>
              {translatedSectors.filter((s) => s.id !== 'all').map((sector) => (
                <LocalizedClientLink
                  key={sector.id}
                  href={`/categories${buildCatalogQuery(sector.id)}`}
                  onClick={closeMenuHandler}
                  className="px-2 py-2 text-sm text-primary hover:opacity-80"
                >
                  {sector.label}
                </LocalizedClientLink>
              ))}
              <LocalizedClientLink
                href="/sourcing"
                onClick={closeMenuHandler}
                className="label-md uppercase px-2 py-2.5 mt-2 text-primary hover:opacity-80"
              >
                AI Sourcing
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/categories"
                onClick={closeMenuHandler}
                className="label-md uppercase px-2 py-2.5 text-primary hover:opacity-80"
              >
                Catalogue
              </LocalizedClientLink>
            </nav>
            <HeaderCategoryNavbar
              onClose={closeMenuHandler}
              categories={categories}
              parentCategories={parentCategories}
            />
            <div className="p-4">
              <MobileCategoryNavbar
                onClose={closeMenuHandler}
                categories={categories}
                parentCategories={parentCategories}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
