'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { X, Plus, Upload, User, Loader2, Sparkles, Info, AlertCircle } from 'lucide-react'
import { DNAProfileData, INDUSTRIES, LANGUAGES, PRIMARY_USE_CASES, LEARNING_STYLES, CONTENT_DEPTH, TIME_COMMITMENTS, GOAL_SETTING_STYLES, PROFILE_VISIBILITY, NOTIFICATION_FREQUENCY } from '@/lib/types'

// New content preference options for AI recommendation engine
const CONTENT_CATEGORIES = [
  'News & Current Events',
  'Technology & Innovation',
  'Business & Finance',
  'Science & Research',
  'Arts & Culture',
  'Health & Wellness',
  'Sports & Recreation',
  'Entertainment & Media',
  'Education & Learning',
  'Travel & Lifestyle'
] as const

const CONTENT_TONE = [
  'Professional & Formal',
  'Casual & Conversational',
  'Technical & Detailed',
  'Simple & Easy to Read',
  'Inspirational & Motivational',
  'Data-Driven & Analytical'
] as const

const READING_FREQUENCY = [
  'Multiple times daily',
  'Once daily',
  'Few times a week',
  'Weekly',
  'Occasionally'
] as const

const CONTENT_LENGTH = [
  'Quick reads (< 3 min)',
  'Short articles (3-7 min)',
  'Medium articles (7-15 min)',
  'Long-form content (15+ min)',
  'No preference'
] as const

const SOURCE_TYPE = [
  'Major news outlets',
  'Industry blogs',
  'Academic & research papers',
  'Social media & forums',
  'Company & official blogs',
  'Independent creators',
  'All sources welcome'
] as const

const DISCOVERY_STYLE = [
  'Trending & popular content',
  'Niche & specialized content',
  'Evergreen & timeless content',
  'Breaking news & updates',
  'Curated & editorial picks',
  'Mix of everything'
] as const

export default function AboutYou() {
  const { data: session, update: updateSession } = useSession() || {}
  const [profile, setProfile] = useState<DNAProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [enhancingBio, setEnhancingBio] = useState(false)

  // Skill/Interest input states
  const [subIndustryInput, setSubIndustryInput] = useState('')
  const [skillsInput, setSkillsInput] = useState('')
  const [interestsInput, setInterestsInput] = useState('')

  useEffect(() => {
    fetchProfile()
    fetchCustomLogo()
  }, [])

  // Calculate profile completion percentage
  const profileCompletion = useMemo(() => {
    if (!profile) return 0
    
    const fields = [
      profile.fullName,
      profile.favoriteIndustry,
      profile.organization,
      profile.favoriteIndustry2,
      profile.bio,
      customLogoUrl,
      profile.languagePref,
      profile.primaryUseCase,
      profile.contentCategory,
      profile.contentTone,
      profile.readingFrequency,
      profile.contentLength,
      profile.sourceType,
      profile.discoveryStyle,
      (profile.subIndustrySkills || []).length > 0,
      (profile.skillsExpertise || []).length > 0,
      (profile.personalInterests || []).length > 0,
      profile.learningStyle,
      profile.contentDepthPref,
      profile.timeCommitment,
      profile.goalSettingStyle,
    ]
    
    const completedFields = fields.filter(Boolean).length
    return Math.round((completedFields / fields.length) * 100)
  }, [profile, customLogoUrl])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/dna-profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomLogo = async () => {
    try {
      const res = await fetch('/api/user/custom-logo')
      if (res.ok) {
        const data = await res.json()
        if (data.customLogoUrl) {
          setCustomLogoUrl(data.customLogoUrl)
        }
      }
    } catch (error) {
      console.error('Failed to load custom logo')
    }
  }

  const handleLogoUpload = async (file: File) => {
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed')
      return
    }

    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/user/custom-logo', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        if (data.customLogoUrl) {
          setCustomLogoUrl(data.customLogoUrl)
        }
        toast.success('Custom logo uploaded! This will now appear on all your bookmarks.')
        // Optionally refresh the session to update user data
        if (updateSession) {
          await updateSession()
        }
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to upload logo')
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Failed to upload logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleLogoRemove = async () => {
    setUploadingLogo(true)
    try {
      const res = await fetch('/api/user/custom-logo', {
        method: 'DELETE'
      })

      if (res.ok) {
        setCustomLogoUrl(null)
        toast.success('Custom logo removed. Bookmarks will now show their original favicons.')
        if (updateSession) {
          await updateSession()
        }
      } else {
        toast.error('Failed to remove logo')
      }
    } catch (error) {
      console.error('Error removing logo:', error)
      toast.error('Failed to remove logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleUpdate = (field: keyof DNAProfileData, value: any) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : null)
  }

  const addTag = (field: 'subIndustrySkills' | 'skillsExpertise' | 'personalInterests', value: string) => {
    if (!value.trim() || !profile) return
    const currentTags = profile[field] || []
    if (!currentTags.includes(value.trim())) {
      handleUpdate(field, [...currentTags, value.trim()])
    }
  }

  const removeTag = (field: 'subIndustrySkills' | 'skillsExpertise' | 'personalInterests', value: string) => {
    if (!profile) return
    const currentTags = profile[field] || []
    handleUpdate(field, currentTags.filter(t => t !== value))
  }

  const handleEnhanceBio = async () => {
    if (!profile?.bio || profile.bio.trim().length < 10) {
      toast.error('Please write at least a few sentences in your bio first')
      return
    }

    setEnhancingBio(true)
    try {
      const res = await fetch('/api/ai/enhance-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: profile.bio })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.enhancedBio) {
          handleUpdate('bio', data.enhancedBio)
          toast.success('Bio enhanced! The AI can now better understand your profile.')
        }
      } else {
        // Fallback: enhance locally if API not available
        const enhancedBio = `${profile.bio}\n\n[AI-Optimized Profile: This user is interested in ${profile.favoriteIndustry || 'various industries'} and ${profile.favoriteIndustry2 || 'related fields'}. They work at ${profile.organization || 'their organization'} and are looking for content that matches their expertise and interests.]`
        handleUpdate('bio', enhancedBio)
        toast.success('Bio enhanced for better AI understanding!')
      }
    } catch (error) {
      // Fallback enhancement
      const enhancedBio = `${profile.bio}\n\n[AI-Optimized: Interested in ${profile.favoriteIndustry || 'various topics'}]`
      handleUpdate('bio', enhancedBio)
      toast.success('Bio enhanced!')
    } finally {
      setEnhancingBio(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const res = await fetch('/api/dna-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      if (res.ok) {
        toast.success('Profile saved successfully!')
      } else {
        toast.error('Failed to save profile')
      }
    } catch (error) {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8 text-gray-900">Loading...</div>
  }

  if (!profile) {
    return <div className="flex items-center justify-center p-8 text-gray-900">Failed to load profile</div>
  }

  return (
    <div className="flex gap-6">
      {/* Left Sidebar - Progress Bar */}
      <div className="hidden lg:block w-48 flex-shrink-0">
        <div className="sticky top-6 space-y-4">
          <Card className="bg-gradient-to-b from-gray-50 to-white border border-gray-200 shadow-sm">
            <CardContent className="pt-6 pb-6">
              <div className="text-center space-y-4">
                <div className="relative mx-auto w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke={profileCompletion === 100 ? '#22C55E' : '#3B82F6'}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(profileCompletion / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-bold ${profileCompletion === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                      {profileCompletion}%
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Profile Progress</h4>
                  {profileCompletion < 100 ? (
                    <p className="text-xs text-gray-500 mt-1">
                      Complete your profile for better AI recommendations
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      ✓ Profile Complete!
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {profileCompletion < 100 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  The more you fill out, the better our AI can find bookmarks tailored to you!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-0 pb-6 border-b border-gray-200">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase">About You</h1>
            <p className="text-sm sm:text-base text-gray-600">Tell us about yourself to get personalized bookmark recommendations</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-black text-white hover:bg-gray-800 px-6 py-2.5 h-auto flex-shrink-0"
          >
            <span className="flex items-center gap-2">
              <span>💾</span>
              Save Profile
            </span>
          </Button>
        </div>

        {/* Mobile Progress */}
        <div className="lg:hidden">
          <Card className="bg-gray-50 border border-gray-200">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Profile Progress</span>
                    <span className={`text-sm font-bold ${profileCompletion === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                      {profileCompletion}%
                    </span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                </div>
              </div>
              {profileCompletion < 100 && (
                <p className="text-xs text-gray-500 mt-2">Complete your profile for better AI recommendations</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Basic Information */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 space-y-2">
            <div className="flex items-center gap-2.5">
              <User className="w-5 h-5 text-gray-700" />
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 uppercase">BASIC INFORMATION</CardTitle>
            </div>
            <CardDescription className="text-sm text-gray-600">Your basic profile information helps the AI understand who you are</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Custom Logo and Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Custom Logo Section - Universal Branding */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-lg bg-gray-50 flex items-center justify-center border-2 border-gray-200 overflow-hidden">
                  {customLogoUrl ? (
                    <img src={customLogoUrl} alt="Custom Logo" className="w-full h-full object-contain" />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <label htmlFor="logo-upload" className="w-full">
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingLogo}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleLogoUpload(file)
                        }
                      }}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild 
                      className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                      disabled={uploadingLogo}
                    >
                      <span className="cursor-pointer flex items-center justify-center gap-2">
                        {uploadingLogo ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3 h-3" />
                            Upload Custom Logo
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                  {customLogoUrl && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={handleLogoRemove} 
                      disabled={uploadingLogo}
                      className="text-gray-500 hover:text-gray-700 text-xs h-auto p-0"
                    >
                      Remove Logo
                    </Button>
                  )}
                </div>
                {/* Logo explanation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      <strong>Your custom logo will replace all bookmark favicons.</strong> If no logo is uploaded, bookmarks will display their original website icons.
                    </p>
                  </div>
                </div>
              </div>

              {/* Name and Industries */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile.fullName || ''}
                    onChange={(e) => handleUpdate('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry1" className="text-sm font-medium text-gray-700">Favorite Industry</Label>
                  <Select value={profile.favoriteIndustry || ''} onValueChange={(val) => handleUpdate('favoriteIndustry', val)}>
                    <SelectTrigger id="industry1" className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select your favorite" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {INDUSTRIES.map(ind => (
                        <SelectItem key={ind} value={ind} className="text-gray-900">{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-sm font-medium text-gray-700">Organization</Label>
                  <Input
                    id="organization"
                    value={profile.organization || ''}
                    onChange={(e) => handleUpdate('organization', e.target.value)}
                    placeholder="Company or organization"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry2" className="text-sm font-medium text-gray-700">Alternate Favorite Industry</Label>
                  <Select value={profile.favoriteIndustry2 || ''} onValueChange={(val) => handleUpdate('favoriteIndustry2', val)}>
                    <SelectTrigger id="industry2" className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select alternate" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {INDUSTRIES.map(ind => (
                        <SelectItem key={ind} value={ind} className="text-gray-900">{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Bio with Enhance Button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEnhanceBio}
                  disabled={enhancingBio || !profile.bio || profile.bio.trim().length < 10}
                  className="gap-2 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-blue-100 hover:border-purple-300"
                >
                  {enhancingBio ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      Enhance for AI
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="bio"
                value={profile.bio || ''}
                onChange={(e) => handleUpdate('bio', e.target.value)}
                placeholder="Tell us about yourself, your interests, goals, and what you're looking to learn. The more detail you provide, the better our AI can recommend bookmarks for you..."
                rows={4}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 resize-none"
              />
              <p className="text-xs text-gray-500">
                Your bio helps the AI understand your profile. Click "Enhance for AI" to optimize it for better recommendations.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Content Preferences - Redesigned */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-gray-900 uppercase">CONTENT PREFERENCES</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              These preferences help the AI find and recommend bookmarks tailored to your interests
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Language Preference</Label>
                <Select value={profile.languagePref || ''} onValueChange={(val) => handleUpdate('languagePref', val)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Select your language" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang} value={lang} className="text-gray-900">{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Primary Use</Label>
                <Select value={profile.primaryUseCase || ''} onValueChange={(val) => handleUpdate('primaryUseCase', val)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="How do you use bookmarks?" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {PRIMARY_USE_CASES.map(useCase => (
                      <SelectItem key={useCase} value={useCase} className="text-gray-900">{useCase}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Content Category</Label>
                <Select value={(profile as any).contentCategory || ''} onValueChange={(val) => handleUpdate('contentCategory' as any, val)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="What topics interest you?" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {CONTENT_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-gray-900">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Content Tone</Label>
                <Select value={(profile as any).contentTone || ''} onValueChange={(val) => handleUpdate('contentTone' as any, val)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Preferred writing style?" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {CONTENT_TONE.map(tone => (
                      <SelectItem key={tone} value={tone} className="text-gray-900">{tone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Reading Frequency</Label>
                <Select value={(profile as any).readingFrequency || ''} onValueChange={(val) => handleUpdate('readingFrequency' as any, val)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="How often do you read?" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {READING_FREQUENCY.map(freq => (
                      <SelectItem key={freq} value={freq} className="text-gray-900">{freq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Content Length</Label>
                <Select value={(profile as any).contentLength || ''} onValueChange={(val) => handleUpdate('contentLength' as any, val)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Preferred article length?" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {CONTENT_LENGTH.map(len => (
                      <SelectItem key={len} value={len} className="text-gray-900">{len}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Source Type</Label>
                <Select value={(profile as any).sourceType || ''} onValueChange={(val) => handleUpdate('sourceType' as any, val)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Preferred source types?" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {SOURCE_TYPE.map(src => (
                      <SelectItem key={src} value={src} className="text-gray-900">{src}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Discovery Style</Label>
                <Select value={(profile as any).discoveryStyle || ''} onValueChange={(val) => handleUpdate('discoveryStyle' as any, val)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="How do you discover content?" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {DISCOVERY_STYLE.map(style => (
                      <SelectItem key={style} value={style} className="text-gray-900">{style}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interests & Skills */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-gray-900 uppercase">INTERESTS & SKILLS</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Help the AI understand your expertise areas to recommend relevant bookmarks
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Sub-Industry & Skills */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Sub-Industry & Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={subIndustryInput}
                  onChange={(e) => setSubIndustryInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag('subIndustrySkills', subIndustryInput)
                      setSubIndustryInput('')
                    }
                  }}
                  placeholder="Add an industry (e.g., SaaS, FinTech, AI/ML)..."
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => { 
                    if (subIndustryInput.trim()) {
                      addTag('subIndustrySkills', subIndustryInput); 
                      setSubIndustryInput('') 
                    }
                  }} 
                  className="bg-white border-gray-300 hover:bg-gray-50 flex-shrink-0"
                >
                  <Plus className="w-4 h-4 text-gray-700" />
                </Button>
              </div>
              {(profile.subIndustrySkills || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.subIndustrySkills?.map(skill => (
                    <Badge key={skill} variant="secondary" className="gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200">
                      {skill}
                      <X className="w-3 h-3 cursor-pointer hover:text-gray-900" onClick={() => removeTag('subIndustrySkills', skill)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Skills & Expertise */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Skills & Expertise</Label>
              <div className="flex gap-2">
                <Input
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag('skillsExpertise', skillsInput)
                      setSkillsInput('')
                    }
                  }}
                  placeholder="Add a skill (e.g., JavaScript, Marketing, Data Analysis)..."
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => { 
                    if (skillsInput.trim()) {
                      addTag('skillsExpertise', skillsInput); 
                      setSkillsInput('') 
                    }
                  }} 
                  className="bg-white border-gray-300 hover:bg-gray-50 flex-shrink-0"
                >
                  <Plus className="w-4 h-4 text-gray-700" />
                </Button>
              </div>
              {(profile.skillsExpertise || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.skillsExpertise?.map(skill => (
                    <Badge key={skill} variant="secondary" className="gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200">
                      {skill}
                      <X className="w-3 h-3 cursor-pointer hover:text-gray-900" onClick={() => removeTag('skillsExpertise', skill)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Personal Interests */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Personal Interests</Label>
              <div className="flex gap-2">
                <Input
                  value={interestsInput}
                  onChange={(e) => setInterestsInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag('personalInterests', interestsInput)
                      setInterestsInput('')
                    }
                  }}
                  placeholder="Add an interest (e.g., Photography, Travel, Gaming)..."
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => { 
                    if (interestsInput.trim()) {
                      addTag('personalInterests', interestsInput); 
                      setInterestsInput('') 
                    }
                  }} 
                  className="bg-white border-gray-300 hover:bg-gray-50 flex-shrink-0"
                >
                  <Plus className="w-4 h-4 text-gray-700" />
                </Button>
              </div>
              {(profile.personalInterests || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.personalInterests?.map(interest => (
                    <Badge key={interest} variant="secondary" className="gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200">
                      {interest}
                      <X className="w-3 h-3 cursor-pointer hover:text-gray-900" onClick={() => removeTag('personalInterests', interest)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Learning Preferences */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-gray-900 uppercase">LEARNING PREFERENCES</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Help the AI understand how you learn best to recommend the right type of content
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Learning Style</Label>
                <Select value={profile.learningStyle || ''} onValueChange={(val) => handleUpdate('learningStyle', val)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="How do you learn best?" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {LEARNING_STYLES.map(style => (
                      <SelectItem key={style} value={style} className="text-gray-900">{style}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Content Depth Preference</Label>
                <Select value={profile.contentDepthPref || ''} onValueChange={(val) => handleUpdate('contentDepthPref', val)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="How deep should content go?" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {CONTENT_DEPTH.map(depth => (
                      <SelectItem key={depth} value={depth} className="text-gray-900">{depth}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Time Commitment</Label>
                <Select value={profile.timeCommitment || ''} onValueChange={(val) => handleUpdate('timeCommitment', val)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="How much time can you dedicate?" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {TIME_COMMITMENTS.map(time => (
                      <SelectItem key={time} value={time} className="text-gray-900">{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Goal-Setting Style</Label>
                <Select value={profile.goalSettingStyle || ''} onValueChange={(val) => handleUpdate('goalSettingStyle', val)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="How do you set goals?" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {GOAL_SETTING_STYLES.map(style => (
                      <SelectItem key={style} value={style} className="text-gray-900">{style}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Preferences */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-gray-900 uppercase">PRIVACY & PREFERENCES</CardTitle>
            <CardDescription className="text-sm text-gray-600">Control your privacy settings and how you receive recommendations</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Default Bookmark Visibility</Label>
                <Select value={profile.profileVisibility || 'private'} onValueChange={(val) => handleUpdate('profileVisibility', val)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Private (only you)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {PROFILE_VISIBILITY.map(vis => (
                      <SelectItem key={vis} value={vis} className="text-gray-900">{vis.charAt(0).toUpperCase() + vis.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">You can change individual bookmark visibility anytime</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Notification Frequency</Label>
                <Select value={profile.notificationFreq || 'daily'} onValueChange={(val) => handleUpdate('notificationFreq', val)}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Daily Digest" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {NOTIFICATION_FREQUENCY.map(freq => (
                      <SelectItem key={freq} value={freq} className="text-gray-900">{freq.charAt(0).toUpperCase() + freq.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">How often AI sends you bookmark recommendations via email</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-900">Show Activity</Label>
                  <p className="text-xs text-gray-600">Allow others to see your reading activity and public bookmarks</p>
                </div>
                <Switch 
                  checked={profile.showActivity || false}
                  onCheckedChange={(checked) => handleUpdate('showActivity', checked)}
                  className="data-[state=checked]:bg-black"
                />
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-gray-900">Allow Recommendations</Label>
                    <Badge variant="secondary" className="text-[10px] bg-purple-100 text-purple-700">AI-Powered</Badge>
                  </div>
                  <p className="text-xs text-gray-600">
                    Receive personalized bookmark recommendations via email based on your profile. The AI will analyze your preferences and send you curated links that match your interests.
                  </p>
                </div>
                <Switch 
                  checked={profile.allowRecommendations !== false}
                  onCheckedChange={(checked) => handleUpdate('allowRecommendations', checked)}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links & Social Profiles */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-gray-900 uppercase">LINKS & SOCIAL PROFILES</CardTitle>
            <CardDescription className="text-sm text-gray-600">Connect your professional profiles (helps AI understand your network)</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-medium text-gray-700">Website</Label>
                <Input 
                  id="website" 
                  value={profile.website || ''} 
                  onChange={(e) => handleUpdate('website', e.target.value)} 
                  placeholder="https://yourwebsite.com" 
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-sm font-medium text-gray-700">LinkedIn</Label>
                <Input 
                  id="linkedin" 
                  value={profile.linkedin || ''} 
                  onChange={(e) => handleUpdate('linkedin', e.target.value)} 
                  placeholder="https://linkedin.com/in/yourprofile" 
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-sm font-medium text-gray-700">Twitter/X</Label>
                <Input 
                  id="twitter" 
                  value={profile.twitter || ''} 
                  onChange={(e) => handleUpdate('twitter', e.target.value)} 
                  placeholder="https://twitter.com/yourusername" 
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok" className="text-sm font-medium text-gray-700">TikTok</Label>
                <Input 
                  id="tiktok" 
                  value={profile.tiktok || ''} 
                  onChange={(e) => handleUpdate('tiktok', e.target.value)} 
                  placeholder="https://tiktok.com/@yourusername" 
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-sm font-medium text-gray-700">Instagram</Label>
                <Input 
                  id="instagram" 
                  value={profile.instagram || ''} 
                  onChange={(e) => handleUpdate('instagram', e.target.value)} 
                  placeholder="https://instagram.com/yourusername" 
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook" className="text-sm font-medium text-gray-700">Facebook</Label>
                <Input 
                  id="facebook" 
                  value={profile.facebook || ''} 
                  onChange={(e) => handleUpdate('facebook', e.target.value)} 
                  placeholder="https://facebook.com/yourprofile" 
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-2 pb-8">
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            size="lg" 
            className="bg-black hover:bg-gray-800 text-white px-8"
          >
            {saving ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
