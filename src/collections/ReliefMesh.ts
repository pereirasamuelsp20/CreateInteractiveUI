import type { CollectionConfig } from 'payload'

const isAdmin = ({ req }: { req: { user?: { collection?: string } | null } }) =>
  req.user?.collection === 'admins'

const sharedAccess = {
  create: () => true,
  read: () => true,
  update: isAdmin,
  delete: isAdmin,
}

export const Announcements: CollectionConfig = {
  slug: 'announcements',
  admin: { group: 'Relief operations', useAsTitle: 'title' },
  access: sharedAccess,
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 100 },
    { name: 'body', type: 'textarea', required: true, maxLength: 500 },
    {
      name: 'severity',
      type: 'select',
      required: true,
      defaultValue: 'info',
      options: ['info', 'warning', 'critical'],
    },
    { name: 'area', type: 'text', required: true, maxLength: 100 },
    { name: 'senderName', type: 'text', required: true, maxLength: 80 },
  ],
}

export const SOSAlerts: CollectionConfig = {
  slug: 'sos-alerts',
  admin: { group: 'Relief operations', useAsTitle: 'citizenName' },
  access: sharedAccess,
  fields: [
    { name: 'citizenName', type: 'text', required: true, maxLength: 80 },
    {
      name: 'need',
      type: 'select',
      required: true,
      options: ['Medical', 'Trapped', 'Supplies', 'Evacuation', 'Other'],
    },
    { name: 'details', type: 'textarea', maxLength: 500 },
    { name: 'area', type: 'text', required: true, maxLength: 120 },
    {
      name: 'priority',
      type: 'select',
      required: true,
      defaultValue: 'urgent',
      options: ['urgent', 'high', 'normal'],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: ['new', 'acknowledged', 'dispatched', 'resolved'],
      access: { create: () => false, update: isAdmin },
    },
  ],
}

export const ResponderMessages: CollectionConfig = {
  slug: 'responder-messages',
  admin: { group: 'Relief operations', useAsTitle: 'senderName' },
  access: sharedAccess,
  fields: [
    { name: 'senderName', type: 'text', required: true, maxLength: 80 },
    { name: 'body', type: 'textarea', required: true, maxLength: 500 },
    { name: 'area', type: 'text', required: true, maxLength: 120 },
    {
      name: 'urgency',
      type: 'select',
      required: true,
      defaultValue: 'normal',
      options: ['normal', 'important', 'urgent'],
    },
  ],
}

export const MeshChannels: CollectionConfig = {
  slug: 'mesh-channels',
  admin: { group: 'BLE network', useAsTitle: 'name' },
  access: sharedAccess,
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: 80 },
    {
      name: 'channelType',
      type: 'select',
      required: true,
      options: ['group', 'community'],
    },
    { name: 'description', type: 'textarea', maxLength: 240 },
    { name: 'createdBy', type: 'text', required: true, maxLength: 80 },
  ],
}

export const MeshMessages: CollectionConfig = {
  slug: 'mesh-messages',
  admin: { group: 'BLE network', useAsTitle: 'senderName' },
  access: sharedAccess,
  fields: [
    { name: 'channelName', type: 'text', required: true, index: true, maxLength: 80 },
    { name: 'senderName', type: 'text', required: true, maxLength: 80 },
    {
      name: 'senderRole',
      type: 'select',
      required: true,
      options: ['citizen', 'responder'],
    },
    { name: 'body', type: 'textarea', required: true, maxLength: 1000 },
    {
      name: 'transmission',
      type: 'select',
      required: true,
      defaultValue: 'ble',
      options: ['ble', 'mesh', 'internet'],
    },
  ],
}
