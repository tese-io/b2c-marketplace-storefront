import { Button } from '@/components/atoms/Button/Button'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { WorkspaceAccountPage } from '@/components/sections/SourcingAppShell/WorkspaceAccountPage'

export default async function RequestSuccessPage ({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <WorkspaceAccountPage>
      <div className="tese-sourcing-account-empty">
        <h1 className="tese-sourcing-account-empty-title">Return requested</h1>
        <p className="tese-sourcing-account-empty-desc">
          Your return request has been submitted. Once the seller confirms it,
          you will receive a confirmation email.
        </p>
        <div className="tese-sourcing-account-empty-actions">
          <LocalizedClientLink href={`/user/returns${id ? `?return=${id}` : ''}`}>
            <Button className="label-md uppercase px-12 py-3">
              Return details
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </WorkspaceAccountPage>
  )
}
