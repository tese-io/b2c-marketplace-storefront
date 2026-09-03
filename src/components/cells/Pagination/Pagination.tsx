"use client"
import { PaginationButton } from "@/components/atoms"
import { CollapseIcon, MeatballsMenuIcon } from "@/icons"
import { useTranslations } from "next-intl"

export const Pagination = ({
  pages,
  setPage,
  currentPage,
}: {
  pages: number
  setPage: (page: number) => void
  currentPage: number
}) => {
  const t = useTranslations("pagination")

  const renderPaginationButtons = () => {
    const buttons = [] as React.ReactNode[]

    if (currentPage > 2) {
      buttons.push(
        <PaginationButton key={`gap-left`} disabled aria-label={t("morePages")} data-testid="pagination-ellipsis-left">
          <MeatballsMenuIcon />
        </PaginationButton>
      )
    }

    if (currentPage > 1) {
      buttons.push(
        <PaginationButton
          key={`page-${currentPage - 1}`}
          aria-label={`Go to page ${currentPage - 1}`}
          onClick={() => setPage(currentPage - 1)}
          data-testid={`pagination-button-${currentPage - 1}`}
        >
          {currentPage - 1}
        </PaginationButton>
      )
    }

    buttons.push(
      <PaginationButton
        key={`page-${currentPage}`}
        isActive
        aria-label={`Current page, page ${currentPage}`}
        data-testid={`pagination-button-current-${currentPage}`}
      >
        {currentPage}
      </PaginationButton>
    )

    if (currentPage < pages) {
      buttons.push(
        <PaginationButton
          key={`page-${currentPage + 1}`}
          aria-label={`Go to page ${currentPage + 1}`}
          onClick={() => setPage(currentPage + 1)}
          data-testid={`pagination-button-${currentPage + 1}`}
        >
          {currentPage + 1}
        </PaginationButton>
      )
    }

    if (currentPage < pages - 1) {
      buttons.push(
        <PaginationButton key={`gap-right`} disabled aria-label={t("morePages")} data-testid="pagination-ellipsis-right">
          <MeatballsMenuIcon />
        </PaginationButton>
      )
    }

    return buttons
  }

  return (
    <div className="flex items-center" data-testid="pagination">
      <PaginationButton
        disabled={Boolean(currentPage === 1)}
        onClick={() => setPage(currentPage - 1)}
        className="border-none"
        aria-label={t("previousPage")}
        data-testid="pagination-previous"
      >
        <CollapseIcon size={20} className="rotate-90" />
      </PaginationButton>

      {renderPaginationButtons()}

      <PaginationButton
        disabled={Boolean(currentPage === pages)}
        onClick={() => setPage(currentPage + 1)}
        className="border-none"
        aria-label={t("nextPage")}
        data-testid="pagination-next"
      >
        <CollapseIcon size={20} className="-rotate-90" />
      </PaginationButton>
    </div>
  )
}
