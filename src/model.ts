import { Dayjs } from 'dayjs';

export interface RawNPC {
  hp: number;
  id: string;
  max_hp: number;
  name: string;
  image_url: string;
  level: number;
  is_dead: boolean;
}

export interface NPC {
  hp: number;
  id: string;
  maxHp: number;
  name: string;
  imageUrl: string;
  level: number;
  isDead: boolean;
}

export interface GameStatus {
  guild: string;
  id: string;
  max_players: number;
  npc: RawNPC;
  cooldowns: { [id: string]: string };
  buffs: BuffMessage[];
  players: string[];
  zone: RawZone;
  zone_id: number;
  resources: number;
  spells: Spell[];
}

export interface CastResponse {
  cooldown: string;
  cast_time: number;
  attacking?: boolean;
}

export interface Spell {
  cast_time: number;
  cooldown: number;
  cost: number;
  icon_url: string;
  id: number;
  name: string;
  required_level: number;
  type: string;
  description: string;
  activeCooldown?: Dayjs;
}

export interface PlayerResponse {
  id: string;
  username: string;
  players: string[];
}

export interface ServerMessage {
  text: string;
  type: ChatMsgType;
}

export interface ResourcesMessage {
  resources: number;
}

export interface ErrorMessage {
  reason: string;
}

export enum ChatMsgType {
  Chat = 'chat',
  Join = 'join',
  Quit = 'quit',
  Server = 'server',
  Combat = 'combat',
  Announcement = 'announcement',
  GM = 'gm',
}

export interface RawGuild {
  id: number;
  logo_url: string;
  name: string;
}

export interface Guild {
  id: number;
  logoUrl: string;
  name: string;
}

export interface RawHeroClass {
  id: string;
  icon: string;
  name: string;
}

export interface HeroClass {
  id: number;
  icon: string;
  name: string;
}

export interface ChatMessage {
  user?: string;
  text: string;
  type: ChatMsgType;
  timestamp?: Dayjs;
  guildId?: number;
}

export interface NpcResponse {
  npc: RawNPC;
}

export interface RawProfile {
  experience: number;
  first_name: string;
  guild: RawGuild | null;
  id: number;
  last_name: string;
  level: number;
  class: string;
  photo_url: string;
  total_experience: number;
  experience_required: number;
  username: string;
}

export interface Profile {
  experience: number;
  firstName: string;
  guild: Guild | null;
  id: number;
  lastName: string;
  level: number;
  class: string;
  photoUrl: string;
  totalExperience: number;
  experienceRequired: number;
  username: string;
}

export interface ExpMessage {
  experience: number;
  experience_required: number;
  experience_change: number;
  total_experience: number;
  level: number;
  is_levelup: boolean;
  message: string;
}

export interface RawChatMessage {
  from: {
    id: number;
    username: string;
    guild_id: number;
    level: number;
  };
  text: string;
  timestamp: string;
  type: string;
}

export interface Buff {
  name: string;
  cooldownMultiplier: number;
  critMultiplier: number;
  damageMultiplier: number;
  duration: number;
  expiresAt?: Dayjs;
  id: string;
  img: any;
  description?: string;
}

export interface BuffMessage {
  cooldown_multiplier: number;
  crit_multiplier: number;
  damage_multiplier: number;
  duration_ms?: number;
  expires_at?: string;
  name: string;
  id: string;
  icon_url: string;
  description?: string;
}

export interface DamageList {
  value: string;
  key: string;
  crit: boolean;
  color: string;
}

export interface LastDamageDealt {
  value: number;
  timestamp: Dayjs;
}

export interface DamageMessage {
  damage?: {
    value: number;
    is_crit: boolean;
    max_damage: number;
    min_damage: number;
  };
  effect?: string;
  npc: RawNPC;
  spell: {
    name: string;
    id: number;
    type: string;
  };
  from: {
    id: number;
    username: string;
  };
}

export interface RawZone {
  background_image_url: string;
  cleared: boolean;
  cleared_at: string;
  current_kills: number;
  max_level: number;
  min_level: number;
  name: string;
  required_kills: number;
  unlocked: boolean;
  unlocked_at: string;
  id: number;
  is_boss: boolean;
}

export interface Zone {
  backgroundImageUrl: string;
  cleared: boolean;
  clearedAt: Dayjs | null;
  currentKills: number;
  maxLevel: number;
  minLevel: number;
  name: string;
  requiredKills: number;
  unlocked: boolean;
  unlockedAt: Dayjs | null;
  id: number;
  isBoss: boolean;
}

export interface LeaderboardGuild {
  guild_id: string;
  logo_url: string;
  name: string;
  progress: LeaderboardZone[];
}

export interface LeaderboardZone {
  cleared: boolean;
  cleared_at: string;
  current_kills: number;
  required_kills: number;
  zone_id: number;
  zone_name: string;
  unlocked: boolean;
  unlocked_at: string;
}

export interface LeaderboardPlayer {
  experience: number;
  first_name: string;
  guild_id: number;
  id: number;
  last_name: string;
  level: number;
  photo_url: string;
  rank: number;
  total_experience: number;
  username: string;
}
