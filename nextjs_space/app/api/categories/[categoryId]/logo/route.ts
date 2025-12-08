export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getDevSession } from "@/lib/dev-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { uploadFile, deleteFile } from "@/lib/s3"

// Upload or update category logo
export async function POST(request: Request, { params }: { params: { categoryId: string } }) {
  try {
    const session = await getDevSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { categoryId } = params

    // Verify category ownership
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category || category.userId !== session.user.id) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 })
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    // Delete old logo if it exists
    if (category.logo) {
      try {
        await deleteFile(category.logo)
      } catch (error) {
        console.error("Failed to delete old logo:", error)
      }
    }

    // Upload new logo to S3
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = `category-logos/${categoryId}-${Date.now()}.${file.name.split(".").pop()}`
    const logoUrl = await uploadFile(buffer, fileName, true) // Public file

    // Update category in database
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { logo: logoUrl },
    })

    return NextResponse.json({ success: true, logoUrl: updatedCategory.logo })
  } catch (error) {
    console.error("Error uploading category logo:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete category logo
export async function DELETE(request: Request, { params }: { params: { categoryId: string } }) {
  try {
    const session = await getDevSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { categoryId } = params

    // Verify category ownership
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category || category.userId !== session.user.id) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    if (!category.logo) {
      return NextResponse.json({ error: "No logo to delete" }, { status: 400 })
    }

    // Delete logo from S3
    try {
      await deleteFile(category.logo)
    } catch (error) {
      console.error("Failed to delete logo from S3:", error)
    }

    // Update category in database
    await prisma.category.update({
      where: { id: categoryId },
      data: { logo: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category logo:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
