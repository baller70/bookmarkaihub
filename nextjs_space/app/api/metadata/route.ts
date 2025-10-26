
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { fetchWebsiteMetadata } from "@/lib/metadata-service"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const metadata = await fetchWebsiteMetadata(url)

    if (!metadata) {
      return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 })
    }

    return NextResponse.json(metadata)
  } catch (error) {
    console.error("Error fetching metadata:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
