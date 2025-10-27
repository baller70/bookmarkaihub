
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
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  if (!profile) {
    return <div className="flex items-center justify-center p-8">Failed to load profile</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Tell us about yourself</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="avatar-upload">
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
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Custom Photo
                  </span>
                </Button>
              </label>
              <Button variant="ghost" size="sm" onClick={() => handleUpdate('avatar', '')}>
                Remove Logo
              </Button>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={profile.fullName || ''}
              onChange={(e) => handleUpdate('fullName', e.target.value)}
              placeholder="Your full name"
            />
          </div>

          {/* Organization */}
          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              value={profile.organization || ''}
              onChange={(e) => handleUpdate('organization', e.target.value)}
              placeholder="Your company or organization"
            />
          </div>

          {/* Industries */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry1">Favorite Industry</Label>
              <Select value={profile.favoriteIndustry || ''} onValueChange={(val) => handleUpdate('favoriteIndustry', val)}>
                <SelectTrigger id="industry1">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(ind => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry2">Favorite Industry #2</Label>
              <Select value={profile.favoriteIndustry2 || ''} onValueChange={(val) => handleUpdate('favoriteIndustry2', val)}>
                <SelectTrigger id="industry2">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(ind => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio || ''}
              onChange={(e) => handleUpdate('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Content Preferences</CardTitle>
          <CardDescription>Customize your content experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Link Source Preference</Label>
              <Select value={profile.linkSourcePref || ''} onValueChange={(val) => handleUpdate('linkSourcePref', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  {LINK_SOURCE_PREFERENCES.map(pref => (
                    <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Language Preference</Label>
              <Select value={profile.languagePref || ''} onValueChange={(val) => handleUpdate('languagePref', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Media Format Priority</Label>
              <Select value={profile.mediaFormatPriority || ''} onValueChange={(val) => handleUpdate('mediaFormatPriority', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {MEDIA_FORMATS.map(format => (
                    <SelectItem key={format} value={format}>{format}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content Freshness</Label>
              <Select value={profile.contentFreshness || ''} onValueChange={(val) => handleUpdate('contentFreshness', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select freshness" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_FRESHNESS.map(fresh => (
                    <SelectItem key={fresh} value={fresh}>{fresh}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Source Credibility</Label>
              <Select value={profile.sourceCredibility || ''} onValueChange={(val) => handleUpdate('sourceCredibility', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select credibility" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_CREDIBILITY.map(cred => (
                    <SelectItem key={cred} value={cred}>{cred}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Primary Use Case</Label>
              <Select value={profile.primaryUseCase || ''} onValueChange={(val) => handleUpdate('primaryUseCase', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select use case" />
                </SelectTrigger>
                <SelectContent>
                  {PRIMARY_USE_CASES.map(useCase => (
                    <SelectItem key={useCase} value={useCase}>{useCase}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links & Social Profiles */}
      <Card>
        <CardHeader>
          <CardTitle>Links & Social Profiles</CardTitle>
          <CardDescription>Connect your online presence</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={profile.website || ''} onChange={(e) => handleUpdate('website', e.target.value)} placeholder="https://your-website.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input id="linkedin" value={profile.linkedin || ''} onChange={(e) => handleUpdate('linkedin', e.target.value)} placeholder="linkedin.com/in/username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input id="twitter" value={profile.twitter || ''} onChange={(e) => handleUpdate('twitter', e.target.value)} placeholder="@username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok</Label>
              <Input id="tiktok" value={profile.tiktok || ''} onChange={(e) => handleUpdate('tiktok', e.target.value)} placeholder="@username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" value={profile.instagram || ''} onChange={(e) => handleUpdate('instagram', e.target.value)} placeholder="@username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input id="facebook" value={profile.facebook || ''} onChange={(e) => handleUpdate('facebook', e.target.value)} placeholder="facebook.com/username" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interests & Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Interests & Skills</CardTitle>
          <CardDescription>Share your expertise and passions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sub-Industry & Skills */}
          <div className="space-y-2">
            <Label>Sub-Industry & Skills</Label>
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
                placeholder="Add sub-industry or skill..."
              />
              <Button size="icon" variant="outline" onClick={() => { addTag('subIndustrySkills', subIndustryInput); setSubIndustryInput('') }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(profile.subIndustrySkills || []).map(skill => (
                <Badge key={skill} variant="secondary" className="gap-1">
                  {skill}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag('subIndustrySkills', skill)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Skills & Expertise */}
          <div className="space-y-2">
            <Label>Skills & Expertise</Label>
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
                placeholder="Add skill or expertise..."
              />
              <Button size="icon" variant="outline" onClick={() => { addTag('skillsExpertise', skillsInput); setSkillsInput('') }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(profile.skillsExpertise || []).map(skill => (
                <Badge key={skill} variant="secondary" className="gap-1">
                  {skill}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag('skillsExpertise', skill)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Personal Interests */}
          <div className="space-y-2">
            <Label>Personal Interests</Label>
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
                placeholder="Add interest..."
              />
              <Button size="icon" variant="outline" onClick={() => { addTag('personalInterests', interestsInput); setInterestsInput('') }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(profile.personalInterests || []).map(interest => (
                <Badge key={interest} variant="secondary" className="gap-1">
                  {interest}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag('personalInterests', interest)} />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Preferences</CardTitle>
          <CardDescription>Optimize your learning experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Learning Style</Label>
              <Select value={profile.learningStyle || ''} onValueChange={(val) => handleUpdate('learningStyle', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {LEARNING_STYLES.map(style => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content Depth Preference</Label>
              <Select value={profile.contentDepthPref || ''} onValueChange={(val) => handleUpdate('contentDepthPref', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select depth" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_DEPTH.map(depth => (
                    <SelectItem key={depth} value={depth}>{depth}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time Commitment</Label>
              <Select value={profile.timeCommitment || ''} onValueChange={(val) => handleUpdate('timeCommitment', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select commitment" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_COMMITMENTS.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Goal-Setting Style</Label>
              <Select value={profile.goalSettingStyle || ''} onValueChange={(val) => handleUpdate('goalSettingStyle', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_SETTING_STYLES.map(style => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Preferences</CardTitle>
          <CardDescription>Control your privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Profile Visibility</Label>
              <Select value={profile.profileVisibility || 'private'} onValueChange={(val) => handleUpdate('profileVisibility', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  {PROFILE_VISIBILITY.map(vis => (
                    <SelectItem key={vis} value={vis}>{vis.charAt(0).toUpperCase() + vis.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notification Frequency</Label>
              <Select value={profile.notificationFreq || 'daily'} onValueChange={(val) => handleUpdate('notificationFreq', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_FREQUENCY.map(freq => (
                    <SelectItem key={freq} value={freq}>{freq.charAt(0).toUpperCase() + freq.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showActivity">Show Activity</Label>
              <Switch
                id="showActivity"
                checked={profile.showActivity ?? true}
                onCheckedChange={(checked) => handleUpdate('showActivity', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allowRec">Allow Recommendations</Label>
              <Switch
                id="allowRec"
                checked={profile.allowRecommendations ?? true}
                onCheckedChange={(checked) => handleUpdate('allowRecommendations', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  )
}
