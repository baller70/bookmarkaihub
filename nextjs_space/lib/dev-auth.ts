// DEV MODE: Bypass authentication for local development
// This file provides a mock session for all API routes

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

const DEV_MODE = process.env.NODE_ENV !== 'production'

export async function getDevSession() {
  // In production, use real auth
  if (!DEV_MODE) {
    return getServerSession(authOptions)
  }

  // In dev mode, try real session first
  const realSession = await getServerSession(authOptions)
  if (realSession?.user?.id) {
    return realSession
  }

  // Fall back to dev user
  let devUser = await prisma.user.findFirst({
    where: { email: 'test@test.com' }
  })

  // Create dev user if doesn't exist
  if (!devUser) {
    try {
      const bcrypt = require('bcryptjs')
      devUser = await prisma.user.create({
        data: {
          email: 'test@test.com',
          password: await bcrypt.hash('test123', 10),
          name: 'Dev User',
        }
      })
    } catch (error: any) {
      // If user already exists (race condition), fetch it
      if (error.code === 'P2002') {
        devUser = await prisma.user.findFirst({
          where: { email: 'test@test.com' }
        })
      } else {
        throw error
      }
    }
  }

  // Safety check: ensure devUser exists
  if (!devUser) {
    throw new Error('Failed to create or fetch dev user')
  }

  // Ensure dev user has a company
  const company = await prisma.company.findFirst({
    where: { ownerId: devUser.id }
  })

  if (!company) {
    try {
      await prisma.company.create({
        data: {
          name: 'Dev Company',
          ownerId: devUser.id,
        }
      })
    } catch (e) {
      // Ignore if company already exists
    }
  }

  return {
    user: {
      id: devUser.id,
      email: devUser.email,
      name: devUser.name,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }
}

