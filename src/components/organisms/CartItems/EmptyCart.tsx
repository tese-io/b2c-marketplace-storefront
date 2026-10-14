import { Button } from '@/components/atoms';
import { Carousel } from '@/components/cells';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import { CategoryCard } from '@/components/organisms';
import { listCategories } from '@/lib/data/categories';
import { getTranslations } from 'next-intl/server'

export const EmptyCart = async () => {
  const t = await getTranslations("cart")
  const { categories } = await listCategories();

  return (
    <div>
      <div
        className="mb-16 flex h-full w-full flex-col items-center justify-center py-4 md:mx-auto md:w-[426px]"
        data-testid="empty-cart"
      >
        <h4 className="heading-md text-center uppercase text-primary">{t("shoppingCart")}</h4>
        <p className="py-2 text-center text-lg">{t("empty")}</p>
        <LocalizedClientLink
          href="/categories"
          className="mt-6 w-full"
        >
          <Button className="w-full py-3 uppercase md:px-24">{t("explore")}</Button>
        </LocalizedClientLink>
      </div>
      <Carousel
        items={categories?.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
          />
        ))}
      />
    </div>
  );
};
