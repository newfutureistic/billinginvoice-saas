'use client'

import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { useProfile, useUpdateProfile } from '@/lib/api/hooks/use-current-user'
import { http } from '@/lib/api/http'
import { ApiError } from '@/lib/api/errors'

/** Prominent inline save banner so the user always sees whether an action worked. */
function SaveBanner({ msg }: { msg: { ok: boolean; text: string } }) {
  return (
    <div
      role={msg.ok ? 'status' : 'alert'}
      className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${
        msg.ok ? 'border-success/30 bg-success/10 text-success' : 'border-destructive/30 bg-destructive/10 text-destructive'
      }`}
    >
      {msg.ok ? <CheckCircle2 className="size-5 shrink-0" /> : <AlertCircle className="size-5 shrink-0" />}
      {msg.text}
    </div>
  )
}

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Australia/Sydney',
]

export default function ProfilePage() {
  const { data: user, isPending } = useProfile()
  const updateProfile = useUpdateProfile()
  const changePassword = useMutation<{ ok: true }, unknown, { currentPassword: string; newPassword: string }>({
    mutationFn: (body) => http.post('/auth/change-password', body),
  })

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const [curPw, setCurPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Populate the form once the profile loads.
  useEffect(() => {
    if (!user) return
    const parts = (user.name ?? '').trim().split(/\s+/).filter(Boolean)
    setFirstName(parts[0] ?? '')
    setLastName(parts.slice(1).join(' '))
    setTimezone(user.timezone || 'UTC')
  }, [user])

  if (isPending || !user) {
    return (
      <div className="space-y-6 p-6 sm:p-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="mt-2 text-muted-foreground">Manage your personal information and preferences.</p>
        </div>
        <div className="max-w-2xl h-40 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    )
  }

  const initials = ((firstName[0] ?? '') + (lastName[0] ?? '') || user.email[0]).toUpperCase()

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileMsg(null)
    const name = `${firstName} ${lastName}`.trim()
    try {
      await updateProfile.mutateAsync({ name: name || undefined, timezone })
      setProfileMsg({ ok: true, text: 'Profile saved.' })
    } catch (err) {
      setProfileMsg({ ok: false, text: err instanceof ApiError ? err.message : 'Could not save profile' })
    }
  }

  async function changeAvatar() {
    const url = window.prompt('Paste an image URL for your avatar:')
    if (!url) return
    setProfileMsg(null)
    try {
      await updateProfile.mutateAsync({ image: url.trim() })
      setProfileMsg({ ok: true, text: 'Avatar updated.' })
    } catch (err) {
      setProfileMsg({ ok: false, text: err instanceof ApiError ? err.message : 'Could not update avatar (must be a valid URL)' })
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg(null)
    if (newPw !== confirmPw) {
      setPwMsg({ ok: false, text: 'New passwords do not match' })
      return
    }
    if (newPw === curPw) {
      setPwMsg({ ok: false, text: 'New password must be different from the current one' })
      return
    }
    try {
      await changePassword.mutateAsync({ currentPassword: curPw, newPassword: newPw })
      setPwMsg({ ok: true, text: 'Password updated.' })
      setCurPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (err) {
      setPwMsg({ ok: false, text: err instanceof ApiError ? err.message : 'Could not update password' })
    }
  }

  const inputCls = 'mt-2 w-full rounded-lg border border-border bg-background px-3 py-2'

  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="mt-2 text-muted-foreground">Manage your personal information and preferences.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <div className="flex items-start gap-6">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="Avatar" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand text-2xl font-bold text-brand-foreground">
                {initials}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-foreground">{user.name || user.email}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <button
                onClick={changeAvatar}
                disabled={updateProfile.isPending}
                className="mt-4 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
              >
                Change Avatar
              </button>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <form onSubmit={saveProfile} className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Personal Information</h3>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">First Name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <input type="email" value={user.email} disabled className={`${inputCls} opacity-60`} />
              <p className="mt-1 text-xs text-muted-foreground">Email is used to sign in and can’t be changed here.</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Timezone</label>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputCls}>
                {(TIMEZONES.includes(timezone) ? TIMEZONES : [timezone, ...TIMEZONES]).map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            {profileMsg && <SaveBanner msg={profileMsg} />}
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="mt-2 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
            >
              {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Password */}
        <form onSubmit={submitPassword} className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Current Password</label>
              <input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">New Password</label>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Confirm Password</label>
              <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required className={inputCls} />
            </div>
            {pwMsg && <SaveBanner msg={pwMsg} />}
            <button
              type="submit"
              disabled={changePassword.isPending}
              className="mt-2 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
            >
              {changePassword.isPending ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
