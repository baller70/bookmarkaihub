/**
 * Production Readiness Checklist Tests
 * Verifies all critical production requirements are met
 */

import fs from 'fs'
import path from 'path'

describe('Production Readiness Checklist', () => {
  const rootDir = path.join(__dirname, '../..')

  describe('✅ Security Configuration', () => {
    it('should have security headers configured in next.config.js', () => {
      const configPath = path.join(rootDir, 'next.config.js')
      const config = fs.readFileSync(configPath, 'utf8')
      
      expect(config).toContain('Strict-Transport-Security')
      expect(config).toContain('X-Frame-Options')
      expect(config).toContain('X-Content-Type-Options')
      expect(config).toContain('Content-Security-Policy')
      expect(config).toContain('Referrer-Policy')
    })

    it('should have rate limiting middleware', () => {
      const middlewarePath = path.join(rootDir, 'middleware.ts')
      expect(fs.existsSync(middlewarePath)).toBe(true)
      
      const middleware = fs.readFileSync(middlewarePath, 'utf8')
      expect(middleware).toContain('RATE_LIMIT')
      expect(middleware).toContain('429')
    })

    it('should have input validation schemas', () => {
      const validationsPath = path.join(rootDir, 'lib/validations/index.ts')
      expect(fs.existsSync(validationsPath)).toBe(true)
      
      const validations = fs.readFileSync(validationsPath, 'utf8')
      expect(validations).toContain('createBookmarkSchema')
      expect(validations).toContain('urlSchema')
      expect(validations).toContain('validateInput')
    })

    it('should disable X-Powered-By header', () => {
      const configPath = path.join(rootDir, 'next.config.js')
      const config = fs.readFileSync(configPath, 'utf8')
      expect(config).toContain('poweredByHeader: false')
    })
  })

  describe('✅ Error Tracking', () => {
    it('should have Sentry client config', () => {
      const sentryClientPath = path.join(rootDir, 'sentry.client.config.ts')
      expect(fs.existsSync(sentryClientPath)).toBe(true)
    })

    it('should have Sentry server config', () => {
      const sentryServerPath = path.join(rootDir, 'sentry.server.config.ts')
      expect(fs.existsSync(sentryServerPath)).toBe(true)
    })

    it('should have Sentry edge config', () => {
      const sentryEdgePath = path.join(rootDir, 'sentry.edge.config.ts')
      expect(fs.existsSync(sentryEdgePath)).toBe(true)
    })

    it('should have global error handler', () => {
      const globalErrorPath = path.join(rootDir, 'app/global-error.tsx')
      expect(fs.existsSync(globalErrorPath)).toBe(true)
    })
  })

  describe('✅ Monitoring', () => {
    it('should have health check endpoint', () => {
      const healthPath = path.join(rootDir, 'app/api/health/route.ts')
      expect(fs.existsSync(healthPath)).toBe(true)
      
      const healthRoute = fs.readFileSync(healthPath, 'utf8')
      expect(healthRoute).toContain('database')
      expect(healthRoute).toContain('memory')
    })

    it('should have structured logging utility', () => {
      const loggerPath = path.join(rootDir, 'lib/logger.ts')
      expect(fs.existsSync(loggerPath)).toBe(true)
      
      const logger = fs.readFileSync(loggerPath, 'utf8')
      expect(logger).toContain('info')
      expect(logger).toContain('error')
      expect(logger).toContain('warn')
    })
  })

  describe('✅ Performance', () => {
    it('should have caching utilities', () => {
      const cachePath = path.join(rootDir, 'lib/cache.ts')
      expect(fs.existsSync(cachePath)).toBe(true)
      
      const cache = fs.readFileSync(cachePath, 'utf8')
      expect(cache).toContain('unstable_cache')
      expect(cache).toContain('revalidateTag')
    })

    it('should have database indexes defined', () => {
      const schemaPath = path.join(rootDir, 'prisma/schema.prisma')
      expect(fs.existsSync(schemaPath)).toBe(true)
      
      const schema = fs.readFileSync(schemaPath, 'utf8')
      expect(schema).toContain('@@index')
    })
  })

  describe('✅ CI/CD', () => {
    it('should have GitHub Actions workflow', () => {
      const ciPath = path.join(rootDir, '../.github/workflows/ci.yml')
      expect(fs.existsSync(ciPath)).toBe(true)
      
      const ci = fs.readFileSync(ciPath, 'utf8')
      expect(ci).toContain('lint')
      expect(ci).toContain('test')
      expect(ci).toContain('build')
    })
  })

  describe('✅ Documentation', () => {
    it('should have Cloudflare setup guide', () => {
      const cloudflareDocPath = path.join(rootDir, 'docs/CLOUDFLARE_SETUP.md')
      expect(fs.existsSync(cloudflareDocPath)).toBe(true)
    })

    it('should have Sentry environment example', () => {
      const sentryEnvPath = path.join(rootDir, '.env.sentry.example')
      expect(fs.existsSync(sentryEnvPath)).toBe(true)
    })
  })

  describe('✅ Application Configuration', () => {
    it('should have TypeScript configured', () => {
      const tsconfigPath = path.join(rootDir, 'tsconfig.json')
      expect(fs.existsSync(tsconfigPath)).toBe(true)
    })

    it('should have Jest test configuration', () => {
      const jestConfigPath = path.join(rootDir, 'jest.config.js')
      expect(fs.existsSync(jestConfigPath)).toBe(true)
    })

    it('should have Prisma schema', () => {
      const prismaPath = path.join(rootDir, 'prisma/schema.prisma')
      expect(fs.existsSync(prismaPath)).toBe(true)
    })
  })
})

describe('Critical Files Integrity', () => {
  const rootDir = path.join(__dirname, '../..')

  it('should have package.json with required scripts', () => {
    const pkgPath = path.join(rootDir, 'package.json')
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
    
    expect(pkg.scripts.build).toBeDefined()
    expect(pkg.scripts.start).toBeDefined()
    expect(pkg.scripts.dev).toBeDefined()
    expect(pkg.scripts.test).toBeDefined()
    expect(pkg.scripts.lint).toBeDefined()
  })

  it('should have Sentry as a dependency', () => {
    const pkgPath = path.join(rootDir, 'package.json')
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
    
    expect(pkg.dependencies['@sentry/nextjs']).toBeDefined()
  })

  it('should have Zod for validation', () => {
    const pkgPath = path.join(rootDir, 'package.json')
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
    
    expect(pkg.dependencies['zod']).toBeDefined()
  })
})

