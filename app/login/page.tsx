import { GoogleIcon } from "@/components/google-icon"
import { Button } from "@/components/ui/button"
import { API_URL } from "@/lib/config"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect } = await searchParams
  const redirectPath = redirect || "/admin"

  const url = new URL("/api/auth/login", API_URL)
  url.searchParams.append("state", redirectPath)

  return (
    <div className="grid min-h-svh place-items-center">
      <Button
        variant="outline"
        size="lg"
        nativeButton={false}
        render={<a href={url.toString()} />}
      >
        <GoogleIcon className="h-5 w-5" />
        Login with Google
      </Button>
    </div>
  )
}
