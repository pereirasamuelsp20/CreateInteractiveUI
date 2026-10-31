'use client'

import { useCallback, useEffect, useMemo, useState, useTransition, type ReactNode } from 'react'
import {
  createAnnouncement,
  createMeshChannel,
  createMeshMessage,
  createResponderMessage,
  createSOS,
  getReliefData,
} from './actions'

type Role = 'citizen' | 'responder'
type CitizenTab = 'home' | 'map' | 'chats' | 'profile'
type ResponderTab = 'dashboard' | 'sos' | 'inbox' | 'profile'
type IconName =
  | 'home' | 'map' | 'chat' | 'user' | 'shield' | 'signal' | 'pin' | 'alert'
  | 'send' | 'plus' | 'megaphone' | 'inbox' | 'logout' | 'users' | 'chevron'

type RecordData = {
  id: string | number
  createdAt?: string
  title?: string
  body?: string
  severity?: string
  area?: string
  senderName?: string
  citizenName?: string
  need?: string
  details?: string
  priority?: string
  status?: string
  name?: string
  description?: string
  channelType?: string
  channelName?: string
  senderRole?: string
  transmission?: string
  urgency?: string
}

type ReliefData = {
  announcements: RecordData[]
  alerts: RecordData[]
  responderMessages: RecordData[]
  channels: RecordData[]
  meshMessages: RecordData[]
}

const emptyData: ReliefData = {
  announcements: [],
  alerts: [],
  responderMessages: [],
  channels: [],
  meshMessages: [],
}

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" /><path d="M9 3v15m6-12v15" /></>,
    chat: <><path d="M21 12a8 8 0 0 1-8 8H5l-3 2 1-5a9 9 0 1 1 18-5Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.7-5 3.3-7 8-7s7.3 2 8 7" /></>,
    shield: <><path d="M12 2 4.5 5v6c0 5 3 8.5 7.5 11 4.5-2.5 7.5-6 7.5-11V5Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
    signal: <><path d="M4 14a11 11 0 0 1 16 0M7 17a7 7 0 0 1 10 0" /><circle cx="12" cy="20" r="1" /></>,
    pin: <><path d="M20 10c0 5.5-8 12-8 12S4 15.5 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    alert: <><path d="M12 3 2 21h20Z" /><path d="M12 9v5m0 3h.01" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    megaphone: <><path d="m3 11 14-6v14L3 13Z" /><path d="m8 15 2 6h4l-2-7M19 9c2 2 2 4 0 6" /></>,
    inbox: <><path d="M4 4h16v16H4Z" /><path d="M4 14h5l2 3h2l2-3h5" /></>,
    logout: <><path d="M10 4H4v16h6M14 8l4 4-4 4m4-4H8" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
  }
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function StatusBar({ syncing }: { syncing?: boolean }) {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    update()
    const timer = window.setInterval(update, 30000)
    return () => window.clearInterval(timer)
  }, [])
  return <div className="flex h-11 items-center justify-between px-6 pt-2 text-[11px] font-semibold"><span>{time}</span><span className="flex items-center gap-2 text-stone-300"><Icon name="signal" size={15} />{syncing ? 'SYNCING' : 'BLE MESH'}</span></div>
}

function AppLogo() {
  return <div className="relative grid size-36 place-items-center rounded-full border border-red-500/20 bg-[radial-gradient(circle,rgba(255,55,55,.25),transparent_66%)] text-red-400 shadow-[0_0_60px_rgba(242,37,53,.28)]"><span className="absolute size-28 rounded-full border-t-2 border-red-400" /><span className="absolute size-20 rounded-full border-t-2 border-orange-400" /><Icon name="shield" size={58} /></div>
}

function Welcome({ enter }: { enter: (role: Role) => void }) {
  return <main className="flex h-full flex-col">
    <StatusBar />
    <section className="flex flex-1 flex-col items-center px-7 pb-8 pt-12 text-center">
      <AppLogo />
      <div className="mt-7 text-[32px] font-extrabold uppercase leading-[1.06] tracking-wide"><span className="block">Disaster</span><strong className="text-red-500">Relief</strong> Mesh</div>
      <p className="mt-4 text-[8px] font-semibold uppercase tracking-[.18em] text-stone-400">Connected people · safer tomorrows</p>
      <div className="mt-12"><h1 className="text-lg font-extrabold uppercase tracking-wide">Help can travel</h1><p className="mt-1 text-xs text-stone-400">even when the network cannot.</p></div>
      <div className="mt-9 grid w-full gap-3">
        <button type="button" onClick={() => enter('citizen')} className="primary-action">Continue as citizen <Icon name="chevron" size={17} /></button>
        <button type="button" onClick={() => enter('responder')} className="secondary-action"><Icon name="shield" size={17} /> I’m a responder</button>
      </div>
      <div className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl border border-red-950 bg-black/20 py-3 text-[9px] font-bold uppercase tracking-widest text-stone-400"><Icon name="signal" size={15} /> Offline-first · mesh ready</div>
    </section>
  </main>
}

function ShellHeader({ eyebrow, title, subtitle, syncing }: { eyebrow: string; title: string; subtitle?: string; syncing?: boolean }) {
  return <><StatusBar syncing={syncing} /><header className="px-6 pb-4 pt-2"><p className="eyebrow">{eyebrow}</p><h1 className="mt-1 text-[23px] font-extrabold tracking-tight">{title}</h1>{subtitle && <p className="mt-1 text-[11px] text-stone-400">{subtitle}</p>}</header></>
}

function BottomNav({ role, tab, go }: { role: Role; tab: string; go: (tab: string) => void }) {
  const items = role === 'citizen'
    ? [{ id: 'home', label: 'Home', icon: 'home' }, { id: 'map', label: 'Mesh map', icon: 'map' }, { id: 'chats', label: 'BLE chats', icon: 'chat' }, { id: 'profile', label: 'Profile', icon: 'user' }]
    : [{ id: 'dashboard', label: 'Overview', icon: 'home' }, { id: 'sos', label: 'SOS feed', icon: 'alert' }, { id: 'inbox', label: 'Inbox', icon: 'inbox' }, { id: 'profile', label: 'Profile', icon: 'user' }]
  return <nav className="absolute inset-x-0 bottom-0 z-20 grid h-[74px] grid-cols-4 border-t border-red-950 bg-[#0d0909]/95 px-2 pb-2 backdrop-blur-xl" aria-label={`${role} navigation`}>
    {items.map((item) => <button key={item.id} type="button" onClick={() => go(item.id)} className={`flex flex-col items-center justify-center gap-1 rounded-xl text-[7px] font-bold uppercase tracking-wider transition ${tab === item.id ? 'bg-red-500/10 text-red-400' : 'text-stone-500 hover:text-stone-200'}`}><Icon name={item.icon as IconName} size={19} />{item.label}</button>)}
  </nav>
}

function AnnouncementStrip({ announcement }: { announcement?: RecordData }) {
  if (!announcement) return null
  return <article className={`mx-6 mb-3 rounded-2xl border p-3 ${announcement.severity === 'critical' ? 'border-red-500/50 bg-red-500/15' : 'border-orange-500/30 bg-orange-500/10'}`}>
    <div className="flex gap-3"><Icon name="megaphone" size={18} /><div><p className="text-[8px] font-extrabold uppercase tracking-widest text-orange-300">Official announcement · {announcement.area}</p><strong className="mt-1 block text-[11px]">{announcement.title}</strong><p className="mt-1 text-[9px] leading-relaxed text-stone-300">{announcement.body}</p></div></div>
  </article>
}

function CitizenHome({ data, go, sendSOS }: { data: ReliefData; go: (tab: CitizenTab) => void; sendSOS: () => void }) {
  return <div className="pb-24">
    <ShellHeader eyebrow="Disaster relief" title="Stay safe, Aarya." subtitle="Your community is within reach." />
    <AnnouncementStrip announcement={data.announcements[0]} />
    <button type="button" className="mx-6 flex w-[calc(100%-3rem)] items-center gap-3 rounded-2xl border border-red-900/60 bg-red-950/35 p-3 text-left"><span className="pulse-dot" /><span className="flex-1"><b className="block text-[8px] uppercase tracking-widest text-red-400">Limited connectivity</b><small className="text-[10px] text-stone-300">6 BLE nodes available nearby</small></span><Icon name="chevron" size={16} /></button>
    <section className="flex flex-col items-center py-7">
      <p className="mb-3 text-[9px] font-bold uppercase tracking-widest text-stone-300">Need urgent help?</p>
      <button type="button" onClick={sendSOS} className="grid size-36 place-items-center rounded-full border border-red-400 bg-[radial-gradient(circle,#ff5e4f_0_42%,#e91e3a_43%_57%,rgba(121,20,34,.55)_58%_63%,transparent_64%)] shadow-[0_0_55px_rgba(242,37,53,.45)]"><span><b className="block text-3xl">SOS</b><small className="text-[8px] font-bold uppercase tracking-wider">Tap to request</small></span></button>
      <p className="mt-5 text-[9px] text-stone-500">Relays through nearby devices when offline</p>
    </section>
    <p className="section-label px-6">Quick access</p>
    <div className="grid grid-cols-2 gap-3 px-6">
      <button type="button" onClick={() => go('map')} className="quick-card"><Icon name="pin" /><b>Safe zones</b><small>Nearby relief and shelter points</small></button>
      <button type="button" onClick={() => go('chats')} className="quick-card"><Icon name="chat" /><b>BLE chats</b><small>Groups and communities nearby</small></button>
    </div>
    <div className="mx-6 mt-3 rounded-2xl border border-red-950 bg-black/20 p-3"><div className="flex justify-between border-b border-white/5 pb-2 text-[8px] font-bold uppercase tracking-widest"><span className="flex gap-2"><Icon name="signal" size={14} />Mesh status</span><b className="text-emerald-400">● Active</b></div><div className="grid grid-cols-3 pt-3 text-center text-[8px] text-stone-500"><span><b className="block text-base text-white">06</b>nearby nodes</span><span><b className="block text-base text-white">02</b>relay hops</span><span><b className="block text-base text-white">OK</b>local queue</span></div></div>
  </div>
}

function MapView() {
  return <div className="pb-24"><ShellHeader eyebrow="Safer routes" title="MeshMap" subtitle="Nearby relays, relief points and safer routes" /><div className="relative mx-5 h-[510px] overflow-hidden rounded-3xl border border-red-950 bg-[#101515]">
    <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(17deg,transparent_48%,#51433e_49%,#51433e_51%,transparent_52%),linear-gradient(96deg,transparent_48%,#443b39_49%,#443b39_52%,transparent_53%)] [background-size:150px_170px]" />
    <div className="absolute left-10 top-20 size-3 rounded-full bg-red-500 shadow-[0_0_0_7px_rgba(255,70,70,.12),0_0_15px_#ff453f]" /><div className="absolute right-20 top-44 size-3 rounded-full bg-red-500 shadow-[0_0_15px_#ff453f]" /><div className="absolute bottom-32 left-32 size-3 rounded-full bg-red-500 shadow-[0_0_15px_#ff453f]" />
    <div className="absolute right-11 top-20 text-center text-red-400"><Icon name="shield" size={38} /><b className="block text-[7px] uppercase">Relief camp</b></div>
    <div className="absolute bottom-36 left-14 flex items-center gap-2 text-[8px] font-bold uppercase"><span className="size-4 rounded-full border-4 border-red-500 bg-white shadow-[0_0_0_7px_rgba(255,70,70,.12)]" />You · est.</div>
    <div className="absolute bottom-5 left-4 right-4 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/70 p-3 text-[8px] text-stone-400"><span>● Your approximate area</span><span className="text-red-400">● Nearby BLE relay</span><span className="text-orange-300">— Suggested safe route</span></div>
  </div><article className="mx-5 mt-3 flex items-center gap-3 rounded-2xl border border-red-950 bg-[#181111] p-3"><span className="rounded-xl bg-red-500/10 p-2 text-red-400"><Icon name="shield" /></span><span className="flex-1"><small className="block text-[7px] font-bold uppercase tracking-widest text-red-400">Nearest relief point</small><b className="text-[10px]">Community Relief Camp</b><small className="block text-[8px] text-stone-500">Approx. 1.2 km · route estimate</small></span><button type="button" className="rounded-lg border border-red-900 px-2 py-2 text-[7px] font-bold uppercase text-red-400">Safe route</button></article></div>
}

function SOSComposer({ close, submitted }: { close: () => void; submitted: () => void }) {
  const [need, setNeed] = useState('Medical')
  const [details, setDetails] = useState('')
  const [pending, startTransition] = useTransition()
  const submit = () => startTransition(async () => {
    const result = await createSOS({ need, details })
    if (result.ok) submitted()
  })
  return <div className="absolute inset-0 z-30 overflow-y-auto bg-[#0b0808] p-6 pt-14">
    <button type="button" onClick={close} className="mb-5 text-sm text-stone-400">← Back</button>
    <p className="eyebrow">SOS alert</p><h2 className="mt-1 text-2xl font-extrabold">Request emergency help</h2><p className="mt-1 text-[11px] text-stone-400">Your request can relay without internet.</p>
    <p className="section-label mt-8">What do you need?</p><div className="grid grid-cols-2 gap-2">{['Medical', 'Trapped', 'Supplies', 'Evacuation'].map((item) => <button type="button" key={item} onClick={() => setNeed(item)} className={`rounded-2xl border p-4 text-left text-xs font-bold ${need === item ? 'border-red-400 bg-red-500/15 text-red-300' : 'border-red-950 bg-white/5'}`}>{item}</button>)}</div>
    <label className="mt-7 block"><span className="section-label">Details (optional)</span><textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={500} placeholder="Describe what happened or what you need…" className="mt-2 h-28 w-full resize-none rounded-2xl border border-red-950 bg-black/30 p-4 text-xs outline-none focus:border-red-500" /></label>
    <div className="mt-5 flex items-center gap-3 rounded-2xl border border-red-950 bg-white/5 p-4"><Icon name="pin" /><span><b className="block text-[10px]">Approximate location available</b><small className="text-[9px] text-stone-500">Andheri East, Mumbai · estimate</small></span></div>
    <button type="button" disabled={pending} onClick={submit} className="primary-action mt-7 w-full">{pending ? 'Queuing alert…' : 'Send SOS alert'} <Icon name="send" size={17} /></button>
  </div>
}

function ChatsView({ data, refresh, notify }: { data: ReliefData; refresh: () => void; notify: (m: string) => void }) {
  const channels = data.channels
  const messages = data.meshMessages
  const [active, setActive] = useState<RecordData | null>(null)
  const [creating, setCreating] = useState(false)
  const [responderOpen, setResponderOpen] = useState(false)
  const [text, setText] = useState('')
  const [pending, startTransition] = useTransition()
  const channelMessages = useMemo(() => messages.filter((message) => message.channelName === active?.name), [active, messages])

  if (active) return <div className="flex h-full flex-col pb-[74px]">
    <StatusBar /><header className="flex items-center gap-3 border-b border-red-950 px-5 py-3"><button type="button" onClick={() => setActive(null)} className="text-xl">←</button><span className="grid size-10 place-items-center rounded-full bg-red-500/15 text-red-400"><Icon name={active.channelType === 'community' ? 'signal' : 'users'} /></span><span className="flex-1"><b className="block text-sm">{active.name}</b><small className="text-[8px] text-emerald-400">BLE mesh · 6 nodes online</small></span></header>
    <div className="flex-1 space-y-3 overflow-y-auto p-4 [background-image:radial-gradient(rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:18px_18px]">
      <p className="mx-auto w-fit rounded-full bg-black/40 px-3 py-1 text-[8px] text-stone-500">Messages are relayed device-to-device</p>
      {channelMessages.map((message) => <article key={message.id} className={`max-w-[82%] rounded-2xl px-3 py-2 ${message.senderName === 'Aarya Mehta' ? 'ml-auto rounded-br-sm bg-red-600' : 'rounded-bl-sm border border-red-950 bg-[#211717]'}`}><b className={`block text-[8px] ${message.senderRole === 'responder' ? 'text-orange-300' : 'text-red-300'}`}>{message.senderName}</b><p className="mt-1 text-[11px] leading-relaxed">{message.body}</p><small className="mt-1 flex justify-end gap-1 text-[7px] text-stone-300/70">{message.transmission?.toUpperCase()} · relayed</small></article>)}
    </div>
    <form className="flex gap-2 border-t border-red-950 bg-[#100b0b] p-3" onSubmit={(event) => { event.preventDefault(); if (!text.trim()) return; startTransition(async () => { const result = await createMeshMessage({ channelName: active.name || '', body: text, senderRole: 'citizen' }); if (result.ok) { setText(''); refresh() } else notify(result.error) }) }}><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Message over BLE…" className="h-11 flex-1 rounded-full border border-red-950 bg-white/5 px-4 text-xs outline-none focus:border-red-500" /><button type="submit" disabled={pending} className="grid size-11 place-items-center rounded-full bg-red-500 text-white"><Icon name="send" size={17} /></button></form>
  </div>

  return <div className="pb-24"><ShellHeader eyebrow="Offline messaging" title="BLE chats" subtitle="Private groups and nearby communities" syncing={pending} /><div className="mx-6 mb-4 flex items-center gap-3 rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-3"><span className="pulse-dot !bg-emerald-400" /><span className="flex-1"><b className="block text-[9px] uppercase tracking-wider text-emerald-400">BLE available</b><small className="text-[9px] text-stone-400">Messages hop across 6 nearby devices</small></span></div>
    <button type="button" onClick={() => setResponderOpen(true)} className="mx-6 mb-4 flex w-[calc(100%-3rem)] items-center gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-3 text-left"><span className="grid size-10 place-items-center rounded-full bg-orange-400/15 text-orange-300"><Icon name="shield" /></span><span className="flex-1"><b className="block text-xs">Message responders</b><small className="text-[9px] text-stone-400">Non-emergency questions and local updates</small></span><Icon name="chevron" size={16} /></button>
    <div className="flex items-center justify-between px-6"><p className="section-label">Chats & communities</p><button type="button" onClick={() => setCreating(true)} className="flex items-center gap-1 rounded-lg bg-red-500/15 px-2 py-1.5 text-[8px] font-bold uppercase text-red-400"><Icon name="plus" size={14} /> New</button></div>
    <div className="mt-2 divide-y divide-red-950/70">{channels.map((channel) => { const last = [...messages].reverse().find((message) => message.channelName === channel.name); return <button type="button" key={channel.id} onClick={() => setActive(channel)} className="flex w-full items-center gap-3 px-6 py-3 text-left hover:bg-white/5"><span className="grid size-11 place-items-center rounded-full bg-red-500/10 text-red-400"><Icon name={channel.channelType === 'community' ? 'signal' : 'users'} /></span><span className="min-w-0 flex-1"><b className="block truncate text-xs">{channel.name}</b><small className="block truncate text-[9px] text-stone-500">{last?.body || channel.description}</small></span><span className="text-[8px] text-stone-600">BLE ›</span></button> })}{channels.length === 0 && <div className="px-6 py-3"><EmptyState icon="chat" title="No channels in range" copy="Create a group or community to start a BLE conversation." /></div>}</div>
    {creating && <ChannelModal close={() => setCreating(false)} created={() => { setCreating(false); refresh() }} notify={notify} />}
    {responderOpen && <ResponderMessageModal close={() => setResponderOpen(false)} sent={() => { setResponderOpen(false); refresh(); notify('Message relayed to the responder inbox.') }} notify={notify} />}
  </div>
}

function ResponderMessageModal({ close, sent, notify }: { close: () => void; sent: () => void; notify: (m: string) => void }) {
  const [body, setBody] = useState('')
  const [pending, startTransition] = useTransition()
  return <div className="absolute inset-0 z-30 flex flex-col bg-[#0b0808] pt-12"><header className="flex items-center gap-3 border-b border-red-950 px-5 py-3"><button type="button" onClick={close} className="text-xl">←</button><span className="grid size-10 place-items-center rounded-full bg-orange-400/15 text-orange-300"><Icon name="shield" /></span><span><b className="block text-sm">Relief responders</b><small className="text-[8px] text-emerald-400">Available through nearby mesh</small></span></header><div className="flex-1 p-5"><div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 text-[10px] leading-relaxed text-stone-300"><b className="mb-1 block text-orange-300">Not for immediate danger</b>Use SOS for urgent medical, rescue, or evacuation needs. Send general updates and questions here.</div><div className="mt-6 max-w-[85%] rounded-2xl rounded-bl-sm border border-red-950 bg-[#211717] p-3"><b className="text-[8px] text-orange-300">Relief Control</b><p className="mt-1 text-[11px]">How can the response team help?</p></div></div><form className="flex gap-2 border-t border-red-950 p-3" onSubmit={(event) => { event.preventDefault(); startTransition(async () => { const result = await createResponderMessage(body); if (result.ok) sent(); else notify(result.error) }) }}><input value={body} onChange={(event) => setBody(event.target.value)} placeholder="Message responders…" className="h-11 flex-1 rounded-full border border-red-950 bg-white/5 px-4 text-xs outline-none focus:border-red-500" /><button type="submit" disabled={pending} className="grid size-11 place-items-center rounded-full bg-red-500"><Icon name="send" size={17} /></button></form></div>
}

function ChannelModal({ close, created, notify }: { close: () => void; created: () => void; notify: (m: string) => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [channelType, setChannelType] = useState('group')
  const [pending, startTransition] = useTransition()
  return <div className="absolute inset-0 z-30 grid place-items-end bg-black/70 p-3"><section className="w-full rounded-3xl border border-red-900 bg-[#1a1111] p-5"><div className="flex justify-between"><div><p className="eyebrow">New BLE space</p><h2 className="mt-1 text-lg font-bold">Create a group</h2></div><button type="button" onClick={close} className="text-xl text-stone-400">×</button></div><div className="mt-5 grid grid-cols-2 gap-2">{['group', 'community'].map((type) => <button key={type} type="button" onClick={() => setChannelType(type)} className={`rounded-xl border p-3 text-xs capitalize ${channelType === type ? 'border-red-400 bg-red-500/10' : 'border-red-950'}`}>{type}</button>)}</div><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" className="field mt-4" /><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What is this space for?" className="field mt-2 h-20 resize-none py-3" /><button type="button" disabled={pending} onClick={() => startTransition(async () => { const result = await createMeshChannel({ name, description, channelType }); if (result.ok) created(); else notify(result.error) })} className="primary-action mt-4 w-full">{pending ? 'Creating…' : `Create ${channelType}`}</button></section></div>
}

function ProfileView({ role, logout }: { role: Role; logout: () => void }) {
  const responder = role === 'responder'
  return <div className="pb-24"><ShellHeader eyebrow={responder ? 'Verified responder' : 'Citizen profile'} title="Your profile" subtitle="Stored locally and available offline" /><section className="mx-6 mt-4 flex flex-col items-center rounded-3xl border border-red-950 bg-white/5 p-6 text-center"><span className="grid size-20 place-items-center rounded-full bg-red-500/15 text-red-400"><Icon name={responder ? 'shield' : 'user'} size={36} /></span><h2 className="mt-4 text-lg font-bold">{responder ? 'Relief Control · Unit 7' : 'Aarya Mehta'}</h2><p className="mt-1 text-[10px] text-stone-500">{responder ? 'Verified responder · Mumbai West' : 'Citizen · Andheri East, Mumbai'}</p><div className="mt-6 grid w-full grid-cols-2 gap-2 text-left"><div className="rounded-xl bg-black/20 p-3"><small className="block text-[7px] uppercase text-stone-500">Mesh identity</small><b className="text-[10px]">RM-{responder ? 'R74X' : 'A19C'}</b></div><div className="rounded-xl bg-black/20 p-3"><small className="block text-[7px] uppercase text-stone-500">Local status</small><b className="text-[10px] text-emerald-400">Verified</b></div></div><button type="button" onClick={logout} className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-red-500/60 bg-red-500/10 text-[10px] font-extrabold uppercase tracking-wider text-red-400 hover:bg-red-500/20"><Icon name="logout" size={17} /> Log out</button><p className="mt-3 text-[8px] text-stone-600">This ends your current {role} session on this device.</p></section></div>
}

function ResponderDashboard({ data, go, compose }: { data: ReliefData; go: (tab: ResponderTab) => void; compose: () => void }) {
  return <div className="pb-24"><ShellHeader eyebrow="Responder network" title="Operations overview" subtitle="Relief Control · Unit 7" /><div className="mx-6 mb-4 flex items-center gap-3 rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-3"><span className="pulse-dot !bg-emerald-400" /><span><b className="block text-[9px] uppercase tracking-wider text-emerald-400">Responder online</b><small className="text-[9px] text-stone-400">Synced across BLE mesh and cloud</small></span></div>
    <div className="grid grid-cols-3 gap-2 px-6"><button type="button" onClick={() => go('sos')} className="stat-card"><b className="text-red-400">{data.alerts.length}</b><small>Open SOS</small></button><button type="button" onClick={() => go('inbox')} className="stat-card"><b>{data.responderMessages.length}</b><small>Messages</small></button><div className="stat-card"><b className="text-emerald-400">06</b><small>Mesh nodes</small></div></div>
    <button type="button" onClick={compose} className="mx-6 mt-4 flex w-[calc(100%-3rem)] items-center gap-3 rounded-2xl bg-gradient-to-br from-red-400 via-red-500 to-rose-700 p-4 text-left shadow-[0_12px_30px_rgba(207,20,45,.25)]"><span className="grid size-10 place-items-center rounded-xl bg-white/15"><Icon name="megaphone" /></span><span className="flex-1"><b className="block text-xs">Send announcement</b><small className="text-[9px] text-red-100">Broadcast to citizens in your area</small></span><Icon name="chevron" /></button>
    <div className="mt-6 flex items-center justify-between px-6"><p className="section-label">Latest SOS alerts</p><button type="button" onClick={() => go('sos')} className="text-[8px] font-bold uppercase text-red-400">View all</button></div><div className="mt-2 space-y-2 px-6">{data.alerts.slice(0, 3).map((alert) => <SOSCard key={alert.id} alert={alert} />)}{data.alerts.length === 0 && <EmptyState icon="alert" title="No live SOS alerts" copy="New alerts will appear here as they move through the mesh." />}</div>
    <p className="section-label mt-6 px-6">Recent broadcast</p><div className="mt-2"><AnnouncementStrip announcement={data.announcements[0]} />{!data.announcements.length && <div className="px-6"><EmptyState icon="megaphone" title="No announcements yet" copy="Create a broadcast for nearby citizens." /></div>}</div>
  </div>
}

function SOSCard({ alert }: { alert: RecordData }) {
  return <article className="rounded-2xl border border-red-950 bg-[#181111] p-3"><div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-red-500/15 text-red-400"><Icon name="alert" /></span><span className="min-w-0 flex-1"><span className="flex items-center justify-between"><b className="text-xs">{alert.need} needed</b><em className="rounded-full bg-red-500/15 px-2 py-1 text-[7px] font-bold not-italic text-red-400">{alert.priority || 'urgent'}</em></span><p className="mt-1 line-clamp-2 text-[9px] text-stone-400">{alert.details || 'No additional details provided.'}</p><small className="mt-2 flex items-center gap-1 text-[8px] text-stone-500"><Icon name="pin" size={11} />{alert.area} · {relativeTime(alert.createdAt)}</small></span></div></article>
}

function SOSFeed({ data }: { data: ReliefData }) {
  const [filter, setFilter] = useState('all')
  const visible = filter === 'all' ? data.alerts : data.alerts.filter((alert) => alert.need === filter)
  return <div className="pb-24"><ShellHeader eyebrow="Live mesh feed" title="SOS alerts" subtitle={`${data.alerts.length} requests received by nearby relays`} /><div className="flex gap-2 overflow-x-auto px-6 pb-3">{['all', 'Medical', 'Trapped', 'Supplies'].map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`whitespace-nowrap rounded-full px-3 py-2 text-[8px] font-bold uppercase ${filter === item ? 'bg-red-500 text-white' : 'border border-red-950 bg-white/5 text-stone-400'}`}>{item}</button>)}</div><div className="space-y-2 px-6">{visible.map((alert) => <SOSCard key={alert.id} alert={alert} />)}{visible.length === 0 && <EmptyState icon="alert" title="Feed is clear" copy="Incoming citizen alerts will sync here automatically." />}</div></div>
}

function InboxView({ data }: { data: ReliefData }) {
  return <div className="pb-24"><ShellHeader eyebrow="Citizen contact" title="Responder inbox" subtitle="Messages addressed to the response team" /><div className="space-y-2 px-6">{data.responderMessages.map((message) => <article key={message.id} className="rounded-2xl border border-red-950 bg-white/5 p-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-red-500/15 text-red-400"><Icon name="user" /></span><span className="flex-1"><b className="block text-xs">{message.senderName}</b><small className="text-[8px] text-stone-500">{message.area} · {relativeTime(message.createdAt)}</small></span>{message.urgency === 'urgent' && <em className="text-[7px] font-bold uppercase not-italic text-red-400">Urgent</em>}</div><p className="mt-3 rounded-xl bg-black/20 p-3 text-[10px] leading-relaxed text-stone-300">{message.body}</p></article>)}{data.responderMessages.length === 0 && <EmptyState icon="inbox" title="Inbox is clear" copy="Citizen messages meant for responders will appear here." />}</div></div>
}

function AnnouncementModal({ close, sent, notify }: { close: () => void; sent: () => void; notify: (m: string) => void }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [severity, setSeverity] = useState('warning')
  const [pending, startTransition] = useTransition()
  return <div className="absolute inset-0 z-30 overflow-y-auto bg-[#0b0808] p-6 pt-14"><button type="button" onClick={close} className="mb-5 text-sm text-stone-400">← Cancel</button><p className="eyebrow">Area broadcast</p><h2 className="mt-1 text-2xl font-extrabold">Send announcement</h2><p className="mt-1 text-[11px] text-stone-400">Citizens receive this over BLE, mesh, or internet.</p><label className="mt-7 block"><span className="section-label">Headline</span><input value={title} onChange={(event) => setTitle(event.target.value)} className="field mt-2" placeholder="e.g. Relief camp now open" /></label><label className="mt-4 block"><span className="section-label">Message</span><textarea value={body} onChange={(event) => setBody(event.target.value)} className="field mt-2 h-32 resize-none py-3" placeholder="Give clear, actionable instructions…" /></label><p className="section-label mt-5">Priority</p><div className="grid grid-cols-3 gap-2">{['info', 'warning', 'critical'].map((item) => <button key={item} type="button" onClick={() => setSeverity(item)} className={`rounded-xl border p-3 text-[9px] font-bold uppercase ${severity === item ? 'border-red-400 bg-red-500/15 text-red-300' : 'border-red-950 text-stone-400'}`}>{item}</button>)}</div><div className="mt-5 flex items-center gap-3 rounded-2xl border border-red-950 bg-white/5 p-4"><Icon name="pin" /><span><b className="block text-[10px]">Broadcast area</b><small className="text-[9px] text-stone-500">Andheri East, Mumbai</small></span></div><button type="button" disabled={pending} onClick={() => startTransition(async () => { const result = await createAnnouncement({ title, body, severity, area: 'Andheri East, Mumbai' }); if (result.ok) sent(); else notify(result.error) })} className="primary-action mt-7 w-full">{pending ? 'Broadcasting…' : 'Broadcast announcement'} <Icon name="send" size={17} /></button></div>
}

function EmptyState({ icon, title, copy }: { icon: IconName; title: string; copy: string }) {
  return <div className="rounded-2xl border border-dashed border-red-950 p-6 text-center"><span className="mx-auto grid size-11 place-items-center rounded-full bg-white/5 text-stone-500"><Icon name={icon} /></span><b className="mt-3 block text-xs">{title}</b><p className="mt-1 text-[9px] leading-relaxed text-stone-500">{copy}</p></div>
}

function relativeTime(date?: string) {
  if (!date) return 'just now'
  const minutes = Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 60000))
  return minutes < 60 ? `${minutes}m ago` : `${Math.floor(minutes / 60)}h ago`
}

export default function ReliefMeshApp() {
  const [role, setRole] = useState<Role | null>(null)
  const [citizenTab, setCitizenTab] = useState<CitizenTab>('home')
  const [responderTab, setResponderTab] = useState<ResponderTab>('dashboard')
  const [data, setData] = useState<ReliefData>(emptyData)
  const [sosOpen, setSosOpen] = useState(false)
  const [announcementOpen, setAnnouncementOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [syncing, startSync] = useTransition()

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }
  const refresh = useCallback(() => {
    startSync(async () => {
      try {
        setData(await getReliefData() as ReliefData)
      } catch {
        notify('Offline mode: changes will retry when a relay is available.')
      }
    })
  }, [])

  useEffect(() => {
    if (!role) return
    refresh()
    const timer = window.setInterval(refresh, 15000)
    return () => window.clearInterval(timer)
  }, [role, refresh])

  const logout = () => {
    setRole(null)
    setCitizenTab('home')
    setResponderTab('dashboard')
    setData(emptyData)
    notify('You have been logged out.')
  }

  return <div className="relief-page"><div className="app-frame">
    {!role && <Welcome enter={(nextRole) => setRole(nextRole)} />}
    {role === 'citizen' && <main className="h-full overflow-y-auto">
      {citizenTab === 'home' && <CitizenHome data={data} go={setCitizenTab} sendSOS={() => setSosOpen(true)} />}
      {citizenTab === 'map' && <MapView />}
      {citizenTab === 'chats' && <ChatsView data={data} refresh={refresh} notify={notify} />}
      {citizenTab === 'profile' && <ProfileView role="citizen" logout={logout} />}
      <BottomNav role="citizen" tab={citizenTab} go={(tab) => setCitizenTab(tab as CitizenTab)} />
      {sosOpen && <SOSComposer close={() => setSosOpen(false)} submitted={() => { setSosOpen(false); refresh(); notify('SOS queued and shared with nearby responders.') }} />}
    </main>}
    {role === 'responder' && <main className="h-full overflow-y-auto">
      {responderTab === 'dashboard' && <ResponderDashboard data={data} go={setResponderTab} compose={() => setAnnouncementOpen(true)} />}
      {responderTab === 'sos' && <SOSFeed data={data} />}
      {responderTab === 'inbox' && <InboxView data={data} />}
      {responderTab === 'profile' && <ProfileView role="responder" logout={logout} />}
      <BottomNav role="responder" tab={responderTab} go={(tab) => setResponderTab(tab as ResponderTab)} />
      {announcementOpen && <AnnouncementModal close={() => setAnnouncementOpen(false)} sent={() => { setAnnouncementOpen(false); refresh(); notify('Announcement synchronized across the mesh.') }} notify={notify} />}
    </main>}
    {syncing && <div className="absolute right-4 top-12 z-40 rounded-full bg-black/70 px-3 py-1 text-[7px] font-bold uppercase tracking-widest text-stone-400">Syncing…</div>}
  </div>{toast && <div role="status" className="fixed bottom-6 left-1/2 z-50 flex w-[min(350px,calc(100%-2rem))] -translate-x-1/2 items-center gap-2 rounded-2xl border border-red-900 bg-[#211515] p-3 text-[10px] shadow-2xl"><Icon name="signal" size={16} /><span className="flex-1">{toast}</span><button type="button" onClick={() => setToast('')}>×</button></div>}</div>
}
