'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { X, Plus, Upload, User } from 'lucide-react'
import { DNAProfileData, INDUSTRIES, LINK_SOURCE_PREFERENCES, LANGUAGES, MEDIA_FORMATS, CONTENT_FRESHNESS, SOURCE_CREDIBILITY, PRIMARY_USE_CASES, LEARNING_STYLES, CONTENT_DEPTH, TIME_COMMITMENTS, GOAL_SETTING_STYLES, PROFILE_VISIBILITY, NOTIFICATION_FREQUENCY } from '@/lib/types'

export default function AboutYou() {
  const [profile, setProfile] = useState<DNAProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Skill/Interest input states
  const [subIndustryInput, setSubIndustryInput] = useState('')
  const [skillsInput, setSkillsInput] = useState('')
  const [interestsInput, setInterestsInput] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 uppercase">About You</h1>
          <p className="text-base text-gray-600">Tell us about yourself to get personalized bookmark recommendations</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-black text-white hover:bg-gray-800 px-6 py-2 h-auto"
        >
          <span className="flex items-center gap-2">
            <span>💾</span>
            Save Profile
          </span>
        </Button>
      </div>

      {/* Basic Information */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-700" />
            <CardTitle className="text-lg font-semibold text-gray-900 uppercase">Basic Information</CardTitle>
          </div>
          <CardDescription className="text-sm text-gray-600">Your basic profile information and avatar</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Avatar and Name Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center border-2 border-gray-200 text-3xl font-medium text-gray-600">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>U</span>
                )}
              </div>
              <div className="flex flex-col gap-2 w-full">
                <label htmlFor="avatar-upload" className="w-full">
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          handleUpdate('avatar', reader.result as string)
                          toast.success('Avatar uploaded! Remember to save your profile.')
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <Button variant="outline" size="sm" asChild className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50 text-xs">
                    <span className="cursor-pointer flex items-center justify-center gap-2">
                      <Upload className="w-3 h-3" />
                      Upload Custom Photo
                    </span>
                  </Button>
                </label>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => handleUpdate('avatar', '')} 
                  className="text-gray-500 hover:text-gray-700 text-xs h-auto p-0"
                >
                  Remove Logo (Reset to Default)
                </Button>
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
                    <SelectValue placeholder="Select your fave" />
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
                <Label htmlFor="industry2" className="text-sm font-medium text-gray-700">Favorite Industry #2</Label>
                <Select value={profile.favoriteIndustry2 || ''} onValueChange={(val) => handleUpdate('favoriteIndustry2', val)}>
                  <SelectTrigger id="industry2" className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Select second fave" />
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

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio || ''}
              onChange={(e) => handleUpdate('bio', e.target.value)}
              placeholder="Tell us about yourself, your interests, and what you're looking to learn..."
              rows={3}
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Preferences */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg font-semibold text-gray-900 uppercase">Content Preferences</CardTitle>
          <CardDescription className="text-sm text-gray-600">Help us understand your content and source preferences</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Link Source Preference</Label>
              <Select value={profile.linkSourcePref || ''} onValueChange={(val) => handleUpdate('linkSourcePref', val)}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select your preferred sources" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {LINK_SOURCE_PREFERENCES.map(pref => (
                    <SelectItem key={pref} value={pref} className="text-gray-900">{pref}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Language Preference</Label>
              <Select value={profile.languagePref || ''} onValueChange={(val) => handleUpdate('languagePref', val)}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select your language preference" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang} value={lang} className="text-gray-900">{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Media Format Priority</Label>
              <Select value={profile.mediaFormatPriority || ''} onValueChange={(val) => handleUpdate('mediaFormatPriority', val)}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select preferred format" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {MEDIA_FORMATS.map(format => (
                    <SelectItem key={format} value={format} className="text-gray-900">{format}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Content Freshness</Label>
              <Select value={profile.contentFreshness || ''} onValueChange={(val) => handleUpdate('contentFreshness', val)}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select freshness preference" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {CONTENT_FRESHNESS.map(fresh => (
                    <SelectItem key={fresh} value={fresh} className="text-gray-900">{fresh}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Source Credibility</Label>
              <Select value={profile.sourceCredibility || ''} onValueChange={(val) => handleUpdate('sourceCredibility', val)}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select credibility preference" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {SOURCE_CREDIBILITY.map(cred => (
                    <SelectItem key={cred} value={cred} className="text-gray-900">{cred}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Primary Use Case</Label>
              <Select value={profile.primaryUseCase || ''} onValueChange={(val) => handleUpdate('primaryUseCase', val)}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select or enter content use case" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {PRIMARY_USE_CASES.map(useCase => (
                    <SelectItem key={useCase} value={useCase} className="text-gray-900">{useCase}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links & Social Profiles */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg font-semibold text-gray-900 uppercase">Links & Social Profiles</CardTitle>
          <CardDescription className="text-sm text-gray-600">Connect your professional profiles and websites</CardDescription>
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

      {/* Interests & Skills */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg font-semibold text-gray-900 uppercase">Interests & Skills</CardTitle>
          <CardDescription className="text-sm text-gray-600">Add your areas of interest and professional skills</CardDescription>
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
                placeholder="Add an industry..."
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
                placeholder="Add a skill..."
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
                placeholder="Add an interest..."
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
          <CardTitle className="text-lg font-semibold text-gray-900 uppercase">Learning Preferences</CardTitle>
          <CardDescription className="text-sm text-gray-600">Tell us how you like to learn and consume content</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Learning Style</Label>
              <Select value={profile.learningStyle || ''} onValueChange={(val) => handleUpdate('learningStyle', val)}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select learning style" />
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
                  <SelectValue placeholder="Select content depth" />
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
                  <SelectValue placeholder="Select time commitment" />
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
                  <SelectValue placeholder="Select goal-setting style" />
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
          <CardTitle className="text-lg font-semibold text-gray-900 uppercase">Privacy & Preferences</CardTitle>
          <CardDescription className="text-sm text-gray-600">Control your privacy settings and notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Profile Visibility</Label>
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
            </div>
          </div>
          
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-gray-900">Show Activity</Label>
                <p className="text-xs text-gray-600">Allow others to see your reading activity and bookmarks</p>
              </div>
              <Switch 
                checked={profile.showActivity || false}
                onCheckedChange={(checked) => handleUpdate('showActivity', checked)}
                className="data-[state=checked]:bg-black"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-gray-900">Allow Recommendations</Label>
                <p className="text-xs text-gray-600">Receive personalized content recommendations based on your profile</p>
              </div>
              <Switch 
                checked={profile.allowRecommendations !== false}
                onCheckedChange={(checked) => handleUpdate('allowRecommendations', checked)}
                className="data-[state=checked]:bg-black"
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
  )
}
