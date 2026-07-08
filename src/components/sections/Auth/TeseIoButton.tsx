import { TeseLogoMark } from '@/components/atoms/TeseLogo/TeseLogoMark'

type TeseIoButtonProps = {
  href: string
  label?: string
  testId?: string
}

export function TeseIoButton ({
  href,
  label = 'Continue with tese.io',
  testId = 'auth-continue-with-tese-io',
}: TeseIoButtonProps) {
  return (
    <a
      href={href}
      className="tese-auth-primary-btn"
      data-testid={testId}
    >
      <TeseLogoMark size={20} className="tese-auth-primary-btn-icon" />
      <span>{label}</span>
    </a>
  )
}
