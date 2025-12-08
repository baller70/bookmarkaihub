
import { redirect } from "next/navigation"

export default async function HomePage() {
  // DEV MODE: Skip auth check
  redirect("/dashboard")
}
