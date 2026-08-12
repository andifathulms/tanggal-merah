import { redirect } from 'next/navigation'
import { LOCALE_DEFAULT } from '@/lib/i18n'

export default function RootPage() {
  redirect(`/${LOCALE_DEFAULT}/tahun/`)
}
