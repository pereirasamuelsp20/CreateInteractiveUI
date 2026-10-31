'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

type ActionResult = { ok: true } | { ok: false; error: string }

const clean = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

const fail = (error: string): ActionResult => ({ ok: false, error })
const success = (): ActionResult => ({ ok: true })

export async function getReliefData() {
  const payload = await getPayload({ config })
  const [announcements, alerts, responderMessages, channels, meshMessages] =
    await Promise.all([
      payload.find({
        collection: 'announcements',
        limit: 20,
        sort: '-createdAt',
        overrideAccess: false,
      }),
      payload.find({
        collection: 'sos-alerts',
        limit: 30,
        sort: '-createdAt',
        overrideAccess: false,
      }),
      payload.find({
        collection: 'responder-messages',
        limit: 30,
        sort: '-createdAt',
        overrideAccess: false,
      }),
      payload.find({
        collection: 'mesh-channels',
        limit: 30,
        sort: '-createdAt',
        overrideAccess: false,
      }),
      payload.find({
        collection: 'mesh-messages',
        limit: 100,
        sort: 'createdAt',
        overrideAccess: false,
      }),
    ])

  return {
    announcements: announcements.docs,
    alerts: alerts.docs,
    responderMessages: responderMessages.docs,
    channels: channels.docs,
    meshMessages: meshMessages.docs,
  }
}

export async function createAnnouncement(input: {
  title: string
  body: string
  severity: string
  area: string
}): Promise<ActionResult> {
  const title = clean(input.title, 100)
  const body = clean(input.body, 500)
  const area = clean(input.area, 100)
  const severity: 'info' | 'warning' | 'critical' =
    input.severity === 'warning' || input.severity === 'critical'
      ? input.severity
      : 'info'
  if (!title || !body || !area) return fail('Complete all announcement fields.')

  const payload = await getPayload({ config })
  await payload.create({
    collection: 'announcements',
    data: { title, body, area, severity, senderName: 'Relief Control · Unit 7' },
    overrideAccess: false,
  })
  return success()
}

export async function createSOS(input: {
  need: string
  details: string
}): Promise<ActionResult> {
  const need: 'Medical' | 'Trapped' | 'Supplies' | 'Evacuation' | 'Other' =
    input.need === 'Medical' ||
    input.need === 'Trapped' ||
    input.need === 'Supplies' ||
    input.need === 'Evacuation'
      ? input.need
      : 'Other'
  const details = clean(input.details, 500)
  const payload = await getPayload({ config })
  await payload.create({
    collection: 'sos-alerts',
    data: {
      citizenName: 'Aarya Mehta',
      need,
      details,
      area: 'Andheri East, Mumbai · estimate',
      priority: need === 'Medical' || need === 'Trapped' ? 'urgent' : 'high',
      status: 'new',
    },
    overrideAccess: false,
  })
  return success()
}

export async function createResponderMessage(bodyInput: string): Promise<ActionResult> {
  const body = clean(bodyInput, 500)
  if (!body) return fail('Write a message first.')
  const payload = await getPayload({ config })
  await payload.create({
    collection: 'responder-messages',
    data: {
      senderName: 'Aarya Mehta',
      body,
      area: 'Andheri East, Mumbai',
      urgency: 'normal',
    },
    overrideAccess: false,
  })
  return success()
}

export async function createMeshChannel(input: {
  name: string
  description: string
  channelType: string
}): Promise<ActionResult> {
  const name = clean(input.name, 80)
  const description = clean(input.description, 240)
  const channelType = input.channelType === 'community' ? 'community' : 'group'
  if (!name) return fail('Give the channel a name.')
  const payload = await getPayload({ config })
  await payload.create({
    collection: 'mesh-channels',
    data: { name, description, channelType, createdBy: 'Aarya Mehta' },
    overrideAccess: false,
  })
  return success()
}

export async function createMeshMessage(input: {
  channelName: string
  body: string
  senderRole: 'citizen' | 'responder'
}): Promise<ActionResult> {
  const channelName = clean(input.channelName, 80)
  const body = clean(input.body, 1000)
  if (!channelName || !body) return fail('Write a message first.')
  const payload = await getPayload({ config })
  await payload.create({
    collection: 'mesh-messages',
    data: {
      channelName,
      body,
      senderRole: input.senderRole,
      senderName: input.senderRole === 'responder' ? 'Relief Control · Unit 7' : 'Aarya Mehta',
      transmission: 'ble',
    },
    overrideAccess: false,
  })
  return success()
}
