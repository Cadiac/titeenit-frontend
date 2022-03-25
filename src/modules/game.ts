// module files follow ducks pattern
// a module holds actions, thunks and the reducer in the same file
// create a module for each aspect in your app that needs a state,
// for example auth, user, events...
import { Action, action } from 'easy-peasy';
import {
  NPC,
  RawNPC,
  Spell,
  ChatMessage,
  Profile,
  RawProfile,
  ExpMessage,
  Buff,
  BuffMessage,
  Zone,
  RawZone,
  DamageMessage,
  DamageList,
  LastDamageDealt,
  ChatMsgType,
  NpcResponse,
} from '../model';
import dayjs from 'dayjs';
import { v4 } from 'uuid';

// typed interface for the model/reducer.
// state variables, actions and thunks together
export interface GameModel {
  npc?: NPC;
  setNpc: Action<GameModel, RawNPC>;
  spells: Spell[];
  setSpells: Action<GameModel, Spell[]>;
  pushSpell: Action<GameModel, Spell>;
  activateSpell: Action<
    GameModel,
    { spellId: number; cooldown: string; cast_time: number; attacking?: boolean }
  >;
  setCds: Action<GameModel, { [id: string]: string }>;
  activeInfoSpell?: Spell;
  setActiveInfoSpell: Action<GameModel, number>;
  players: string[];
  setPlayers: Action<GameModel, string[]>;
  chatlog: ChatMessage[];
  combatlog: ChatMessage[];
  pushToChat: Action<GameModel, ChatMessage>;
  pushToCombatLog: Action<GameModel, ChatMessage>;
  profile?: Profile;
  setProfile: Action<GameModel, RawProfile>;
  resources: number;
  setResources: Action<GameModel, number>;
  gainExperience: Action<GameModel, ExpMessage>;
  buffs: Buff[];
  pushBuff: Action<GameModel, BuffMessage>;
  removeBuff: Action<GameModel, BuffMessage>;
  setBuffs: Action<GameModel, BuffMessage[]>;
  damageNpc: Action<GameModel, DamageMessage>;
  zone?: Zone;
  setZone: Action<GameModel, RawZone>;
  casting: number | null;
  setCasting: Action<GameModel, number | null>;
  damageList: DamageList[];
  damageListOthers: DamageList[];
  lastDamageDealt: LastDamageDealt;
  pastNpcList: NPC[];
  npcDefeated: Action<GameModel, RawNPC>;
  url: string;
  zonePlayers: string[];
  setZonePlayers: Action<GameModel, string[]>;
  attacking: boolean;
  setAttacking: Action<GameModel, boolean>;
}

function updateDamageList(
  damageList: DamageList[],
  payload: DamageMessage,
  doneByOthers: boolean
): DamageList[] {
  let newDamageList = damageList.slice();
  if (payload.damage) {
    if (payload.damage.is_crit) {
      newDamageList = newDamageList.map((one) => ({
        ...one,
        crit: false,
      }));
    }
    newDamageList.push({
      value: `${payload.damage.value.toString()}  ${
        doneByOthers ? '(' + payload.from.username + ')' : ''
      }`,
      key: v4(),
      color: payload.spell.type === 'autoattack' ? 'white' : 'yellow',
      crit: payload.damage.is_crit,
    });
  } else if (payload.effect) {
    newDamageList.push({
      value: `${payload.effect}  ${doneByOthers ? '(' + payload.from.username + ')' : ''}`,
      key: v4(),
      color: payload.spell.type === 'autoattack' ? 'white' : 'yellow',
      crit: false,
    });
  }

  if (newDamageList.length > 10) {
    newDamageList.shift();
  }

  return newDamageList;
}

// reducers use immer to provide easier state manipulation
// you can manipulate state directly, immer handles the immutability
export const gameReducer: GameModel = {
  url: 'https://titeenimusavisa.vercel.app',
  npc: undefined,
  setNpc: action((state, payload) => {
    state.npc = {
      hp: payload.hp,
      id: payload.id,
      maxHp: payload.max_hp,
      name: payload.name,
      imageUrl: payload.image_url,
      level: payload.level,
      isDead: payload.is_dead,
    };
  }),
  spells: [],
  setSpells: action((state, payload) => {
    state.spells = payload;
  }),
  pushSpell: action((state, payload) => {
    state.spells.push(payload);
  }),
  activateSpell: action((state, payload) => {
    const spell = state.spells.find((x) => x.id === payload.spellId);
    if (spell) {
      spell.activeCooldown = dayjs(payload.cooldown);
      spell.cast_time = payload.cast_time;
    }
    if (typeof payload.attacking === 'boolean') {
      state.attacking = payload.attacking;
    }
  }),
  setCds: action((state, payload) => {
    const newSpells = state.spells.map((spell) => {
      const cd = payload[spell.id.toString()];
      return {
        ...spell,
        activeCooldown: cd ? dayjs(cd) : undefined,
      };
    });
    state.spells = newSpells;
  }),
  activeInfoSpell: undefined,
  setActiveInfoSpell: action((state, payload) => {
    state.activeInfoSpell = state.spells.find((one) => one.id === payload);
  }),
  players: [],
  setPlayers: action((state, payload) => {
    state.players = payload;
  }),
  chatlog: [],
  pushToChat: action((state, payload) => {
    // remove the first item
    if (state.chatlog.length >= 100) {
      state.chatlog.shift();
    }
    // add timestamp
    state.chatlog.push({ ...payload, timestamp: dayjs() });
  }),
  pushToCombatLog: action((state, payload) => {
    // remove the first item
    if (state.combatlog.length >= 100) {
      state.combatlog.shift();
    }
    // add timestamp
    state.combatlog.push({ ...payload, timestamp: dayjs() });
  }),
  profile: undefined,
  setProfile: action((state, payload) => {
    state.profile = {
      experience: payload.experience,
      firstName: payload.first_name,
      guild: payload.guild
        ? {
            id: payload.guild.id,
            logoUrl: payload.guild.logo_url,
            name: payload.guild.name,
          }
        : null,
      id: payload.id,
      lastName: payload.last_name,
      level: payload.level,
      class: payload.class,
      photoUrl: payload.photo_url,
      totalExperience: payload.total_experience,
      experienceRequired: payload.experience_required,
      username: payload.username,
    };
  }),
  resources: 0,
  setResources: action((state, payload) => {
    state.resources = payload;
  }),
  gainExperience: action((state, payload) => {
    if (!state.profile) {
      return;
    }
    state.profile.experience = payload.experience;
    state.profile.experienceRequired = payload.experience_required;
    state.profile.level = payload.level;
    state.profile.totalExperience = payload.total_experience;
  }),
  buffs: [],
  pushBuff: action((state, payload) => {
    state.buffs.push({
      name: payload.name,
      cooldownMultiplier: payload.cooldown_multiplier,
      critMultiplier: payload.crit_multiplier,
      damageMultiplier: payload.damage_multiplier,
      duration: payload.duration_ms ? payload.duration_ms : 0,
      expiresAt: payload.expires_at ? dayjs(payload.expires_at) : undefined,
      id: payload.id,
      img: payload.icon_url,
      description: payload.description,
    });
  }),
  removeBuff: action((state, payload) => {
    state.buffs = state.buffs.filter((one) => one.id !== payload.id);
  }),
  setBuffs: action((state, payload) => {
    state.buffs = payload.map((one) => {
      return {
        name: one.name,
        cooldownMultiplier: one.cooldown_multiplier,
        critMultiplier: one.crit_multiplier,
        damageMultiplier: one.damage_multiplier,
        duration: one.duration_ms ? one.duration_ms : 0,
        expiresAt: one.expires_at ? dayjs(one.expires_at) : undefined,
        id: one.id,
        img: one.icon_url,
        description: one.description,
      };
    });
  }),
  damageList: [],
  damageListOthers: [],
  lastDamageDealt: { value: 0, timestamp: dayjs() },
  combatlog: [],
  damageNpc: action((state, payload) => {
    state.npc = {
      hp: payload.npc.hp,
      id: payload.npc.id,
      maxHp: payload.npc.max_hp,
      name: payload.npc.name,
      imageUrl: payload.npc.image_url,
      level: payload.npc.level,
      isDead: payload.npc.is_dead,
    };

    let newDamageList: DamageList[] = [];
    if (payload.from.id === state.profile?.id) {
      // damage dealt by the player
      newDamageList = updateDamageList(state.damageList, payload, false);
      state.damageList = newDamageList;
      // update combat log
      if (state.combatlog.length >= 100) {
        state.combatlog.shift();
      }
      if (payload.effect) {
        state.combatlog.push({
          type: ChatMsgType.Combat,
          text: `${state.profile.username}'s ${payload.spell.name}: ${payload.effect}`,
          timestamp: dayjs(),
        });
      } else if (payload.damage && payload.damage.value) {
        state.combatlog.push({
          type: ChatMsgType.Combat,
          text: `${state.profile.username}'s ${payload.spell.name} hits ${state.npc.name} for ${
            payload.damage.value
          }${payload.damage.is_crit ? ' (Critical).' : '.'}`,
          timestamp: dayjs(),
        });
        // The damage was dealt by us
        state.lastDamageDealt = { value: payload.damage.value, timestamp: dayjs() };
      }

      if (payload.spell.id === state.casting) {
        // We've completed casting the spell
        state.casting = null;
      }
    } else {
      // dealt by others
      newDamageList = updateDamageList(state.damageListOthers, payload, true);
      state.damageListOthers = newDamageList;
    }
  }),
  zone: undefined,
  setZone: action((state, payload) => {
    state.zone = {
      backgroundImageUrl: payload.background_image_url,
      cleared: payload.cleared,
      clearedAt: payload.cleared_at ? dayjs(payload.cleared_at) : null,
      currentKills: payload.current_kills,
      maxLevel: payload.max_level,
      minLevel: payload.min_level,
      name: payload.name,
      requiredKills: payload.required_kills,
      unlocked: payload.unlocked,
      unlockedAt: payload.unlocked_at ? dayjs(payload.unlocked_at) : null,
      id: payload.id,
      isBoss: payload.is_boss,
    };
    state.damageList = [];
    state.damageListOthers = [];
  }),
  casting: null,
  setCasting: action((state, payload) => {
    state.casting = payload;
  }),
  pastNpcList: [],
  npcDefeated: action((state, payload) => {
    if (state.pastNpcList.length >= 1) {
      state.pastNpcList.shift();
    }
    state.pastNpcList.push({
      hp: payload.hp,
      id: payload.id,
      maxHp: payload.max_hp,
      name: payload.name,
      imageUrl: payload.image_url,
      level: payload.level,
      isDead: payload.is_dead,
    });
  }),
  zonePlayers: [],
  setZonePlayers: action((state, payload) => {
    state.zonePlayers = payload;
  }),
  attacking: false,
  setAttacking: action((state, payload) => {
    state.attacking = payload;
  }),
};
