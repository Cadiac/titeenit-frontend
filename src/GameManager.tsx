import { AxiosResponse } from 'axios';
import { Actions, useStoreActions } from 'easy-peasy';
import { Channel, Socket } from 'phoenix';
import qs from 'query-string';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { Game } from './components/Game';
import './components/Game.scss';
import { Help } from './components/Help';
import Konami from './components/Konami';
import { Leaderboard } from './components/Leaderboard';
import { Loading } from './components/Loading';
import { GuildLobby, ClassLobby } from './components/Lobby';
import { Map } from './components/Map';
import { NetworkError } from './components/NetworkError';
import {
  BuffMessage,
  ChatMsgType,
  DamageMessage,
  ExpMessage,
  GameStatus,
  NpcResponse,
  PlayerResponse,
  RawChatMessage,
  RawProfile,
  ServerMessage,
  ResourcesMessage,
  Spell,
} from './model';
import { apiclient } from './restapi';
import { StoreModel } from './store';
import { LoginWidget } from './components/LoginWidget';

const Dispatches = (actions: Actions<StoreModel>) => ({
  setNpc: actions.game.setNpc,
  pushChat: actions.game.pushToChat,
  pushCombatLog: actions.game.pushToCombatLog,
  setProfile: actions.game.setProfile,
  setResources: actions.game.setResources,
  gainExperience: actions.game.gainExperience,
  pushBuff: actions.game.pushBuff,
  removeBuff: actions.game.removeBuff,
  damageNpc: actions.game.damageNpc,
  setBuffs: actions.game.setBuffs,
  setCds: actions.game.setCds,
  setZone: actions.game.setZone,
  setSpells: actions.game.setSpells,
  pushSpell: actions.game.pushSpell,
  npcDefeated: actions.game.npcDefeated,
  setZonePlayers: actions.game.setZonePlayers,
});

export enum ViewMode {
  NetworkError = 'network',
  Loading = 'loading',
  GuildLobby = 'guildLobby',
  ClassLobby = 'classLobby',
  Game = 'game',
  Map = 'map',
  Help = 'help',
  Leaderboard = 'leaderboard',
  Login = 'login',
}

export function GameManager() {
  const {
    setNpc,
    pushChat,
    pushCombatLog,
    setProfile,
    setResources,
    gainExperience,
    pushBuff,
    removeBuff,
    damageNpc,
    setBuffs,
    setCds,
    setZone,
    setSpells,
    pushSpell,
    npcDefeated,
    setZonePlayers,
  } = useStoreActions(Dispatches);
  const [token, setToken] = useState<string | undefined>();
  const [gameSocket, setGameSocket] = useState<Socket | null>(null);
  const [gameChannel, setGameChannel] = useState<Channel | null>(null);
  const [userChannel, setUserChannel] = useState<Channel | null>(null);
  const [chatChannel, setChatChannel] = useState<Channel | null>(null);
  const [viewMode, setViewMode] = useState(ViewMode.Loading);
  const [levelup, setLevelup] = useState('');

  const joinChannel = useCallback(
    (zone: number) => {
      if (!gameSocket) {
        setViewMode(ViewMode.NetworkError);
        return;
      }
      const playerId = localStorage.getItem('player_id');
      const guildId = localStorage.getItem('guild_id');
      const classId = localStorage.getItem('class_id');
      if (!playerId || !guildId || !classId) {
        setViewMode(ViewMode.NetworkError);
        return;
      }
      localStorage.setItem('zone_id', zone.toString());
      const gamechannel = gameSocket.channel(`game:${guildId}:${zone}`, {});

      gamechannel.onClose((resp) => {
        if (resp !== 'leave') {
          console.error('Game channel closed: ', resp);
        }
      });

      // Join the channel
      gamechannel
        .join(5000)
        .receive('ok', (resp: GameStatus) => {
          setGameChannel(gamechannel);
          setViewMode(ViewMode.Game);
          setNpc(resp.npc);
          setBuffs(resp.buffs);
          setSpells(resp.spells);
          setCds(resp.cooldowns);
          setZone(resp.zone);
          setZonePlayers(resp.players);
          setResources(resp.resources);
        })
        .receive('timeout', (resp) => {
          console.log('Join timed out', resp);
        })
        .receive('error', (resp) => {
          console.error('Unable to join', resp);
        });

      gamechannel.on('game:npc_updated', (payload: NpcResponse) => {
        setNpc(payload.npc);
      });

      gamechannel.on('game:npc_defeated', (payload: any) => {
        setZone(payload.zone);
        npcDefeated(payload.npc);
      });

      gamechannel.on('game:buff_gained', (payload: BuffMessage) => {
        pushBuff(payload);
      });

      gamechannel.on('game:buff_faded', (payload: BuffMessage) => {
        removeBuff(payload);
      });

      gamechannel.on('game:damage_npc', (payload: DamageMessage) => {
        damageNpc(payload);
      });

      gamechannel.on('game:player_connected', (payload: PlayerResponse) => {
        pushChat({ text: `${payload.username} joined the fight`, type: ChatMsgType.Join });
        setZonePlayers(payload.players);
      });

      gamechannel.on('game:player_disconnected', (payload: PlayerResponse) => {
        pushChat({ text: `${payload.username} left the fight`, type: ChatMsgType.Quit });
        setZonePlayers(payload.players);
      });

      gamechannel.on('game:server_message', (payload: ServerMessage) => {
        pushChat({ text: payload.text, type: payload.type });
      });
    },
    [
      pushChat,
      setNpc,
      gameSocket,
      pushBuff,
      removeBuff,
      damageNpc,
      setBuffs,
      setCds,
      setZone,
      setSpells,
    ]
  );

  // Slightly obfuscated insertion to IndexedDB
  useEffect(() => {
    const run = async () => {
      if (!('indexedDB' in window)) {
        return;
      }

      // Let us open our database
      const DBOpenRequest = window.indexedDB.open('Super Secret Stuff', 420);

      DBOpenRequest.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        const objectStore = db.createObjectStore('Still a secret', { keyPath: 'name' });
        objectStore.createIndex('code', 'code', { unique: true });
      };

      let db = await new Promise<IDBDatabase>((res, rej) => {
        DBOpenRequest.onsuccess = () => {
          res(DBOpenRequest.result);
        };
        DBOpenRequest.onerror = () => {
          rej(DBOpenRequest.error);
        };
      });

      // Create a new item to add in to the object store
      const newItem = {
        name: '\u0052\u0061\u006c\u006c\u0079\u0069\u006e\u0067\u0020\u0043\u0072\u0079\u0020\u006f\u0066\u0020\u0074\u0068\u0065\u0020\u0044\u0072\u0061\u0067\u006f\u006e\u0073\u006c\u0061\u0079\u0065\u0072',
        code: '\u0054\u004f\u0050\u0036\u004b\u0065\u0075\u0030\u0079\u0048\u006b\u0045\u004d\u0043\u0036\u006b',
      };

      // open a read/write db transaction, ready for adding the data
      const transaction = db.transaction(['Still a secret'], 'readwrite');
      const objectStore = transaction.objectStore('Still a secret');
      objectStore.add(newItem);
    };

    run();

    localStorage.setItem(
      '\u006d\u0069\u0073\u0063',
      '\u0064\u004d\u004f\u006b\u0063\u0033\u0050\u0044\u0070\u0047\u0039\u0075\u0064\u0047\u006c\u0030\u005a\u0057\u0056\u0075\u0061\u0058\u0042\u006c\u0062\u0047\u006c\u0072\u0062\u0032\u0039\u006b\u0061\u0051\u003d\u003d'
    );
  }, []);

  // run once socket updates
  useEffect(() => {
    if (!gameSocket) {
      return;
    }

    const setupChatChannel = () => {
      const chatchannel = gameSocket.channel(`chat:global`, {});
      // Join the channel
      chatchannel
        .join(5000)
        .receive('ok', (resp) => {
          setChatChannel(chatchannel);
        })
        .receive('timeout', (resp) => {
          console.log('chat timed out', resp);
        })
        .receive('error', (resp) => {
          console.error('Unable to chat', resp);
        });
      chatchannel.on('chat:chat_message', (payload: RawChatMessage) => {
        const isGM =
          payload.from.id === 10204284 ||
          payload.from.id === 21747342 ||
          payload.from.id === 602332659;
        pushChat({
          user: payload.from.username,
          text: `[${payload.from.level}:${isGM ? '<GM>' : ''}_USER_]: ${payload.text}`,
          type: ChatMsgType.Chat,
          guildId: payload.from.guild_id,
        });
      });
      chatchannel.on('chat:server_message', (payload: ServerMessage) => {
        pushChat({ text: payload.text, type: payload.type });
      });
    };

    const setupUserChannel = (playerId: number) => {
      const userchannel = gameSocket.channel(`user:${playerId}`, {});
      // Join the channel
      userchannel
        .join(5000)
        .receive('ok', (resp) => {
          setUserChannel(userchannel);
        })
        .receive('timeout', (resp) => {
          console.log('Join timed out', resp);
        })
        .receive('error', (resp) => {
          console.error('Unable to join', resp);
        });
      userchannel.on('user:exp_updated', (payload: ExpMessage) => {
        pushCombatLog({ text: payload.message, type: ChatMsgType.Combat });
        if (payload.is_levelup) {
          setLevelup(v4());
        }
        setTimeout(() => {
          setLevelup('');
        }, 4100);
        gainExperience(payload);
      });
      userchannel.on('user:buff_gained', (payload: BuffMessage) => {
        pushBuff(payload);
        pushCombatLog({ text: `You gain ${payload.name}`, type: ChatMsgType.Combat });
      });

      userchannel.on('user:buff_faded', (payload: BuffMessage) => {
        removeBuff(payload);
        pushCombatLog({ text: `${payload.name} fades`, type: ChatMsgType.Combat });
      });
      userchannel.on('user:spell_unlocked', (payload: Spell) => {
        pushSpell(payload);
        pushCombatLog({ text: `Spell ${payload.name} learned!`, type: ChatMsgType.Combat });
      });
      userchannel.on('user:server_message', (payload: ServerMessage) => {
        pushChat({ text: payload.text, type: payload.type });
      });
      userchannel.on('user:resources_updated', (payload: ResourcesMessage) => {
        setResources(payload.resources);
      });
    };

    const getProfile = async (config: any) => {
      try {
        const profileResponse: AxiosResponse<RawProfile> = await apiclient.get(
          '/api/profile',
          config
        );
        setProfile(profileResponse.data);

        setupUserChannel(profileResponse.data.id);
        setupChatChannel();

        if (!profileResponse.data.guild) {
          setViewMode(ViewMode.GuildLobby);
          return;
        } else if (!profileResponse.data.class) {
          setViewMode(ViewMode.ClassLobby);
          return;
        } else {
          localStorage.setItem('player_id', profileResponse.data.id.toString());
          localStorage.setItem('guild_id', profileResponse.data.guild.id.toString());
          localStorage.setItem('class_id', profileResponse.data.class.toString());
          const zoneId = localStorage.getItem('zone_id');
          joinChannel(zoneId ? Number(zoneId) : 1);
        }
      } catch (e) {
        console.error('kukkuu: ', e);
      }
    };

    // Get socket
    gameSocket.onError(() => {
      console.error('Socket errored');
    });
    gameSocket.onOpen(() => {
      // check for id and guild_id from localstorage
      const config = { headers: { authorization: `bearer: ${token}` } };
      getProfile(config);
    });
    // Small timeout is needed, otherwise iOS fails to connect to the socket for some unknown reason.
    // Once it has connected once this isn't needed anymore, but I think its better to wait for a second always.
    setTimeout(() => {
      gameSocket.connect();
    }, 1000);
    return function () {
      gameSocket?.disconnect();
    };
  }, [
    gameSocket,
    token,
    joinChannel,
    setProfile,
    pushChat,
    gainExperience,
    pushBuff,
    removeBuff,
    damageNpc,
    pushSpell,
  ]);

  // set gameSocket
  useEffect(() => {
    // take token
    if (window.location.search) {
      const parsed = qs.parse(window.location.search);
      const token = parsed?.token;
      if (token) {
        localStorage.setItem('token', token.toString());
        window.location.replace('/');
      }
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setViewMode(ViewMode.Login);
    } else {
      setToken(token);

      let socket = new Socket(`${import.meta.env.VITE_BACKEND_WEBSOCKET_URL}/socket`, {
        params: { token },
        reconnectAfterMs: (tries) => {
          return [10, 50, 100, 150, 200, 250, 500, 1000, 2000][tries - 1] || 5000;
        },
        rejoinAfterMs: (tries) => {
          return [1000, 2000, 5000][tries - 1] || 10000;
        },
      });
      setGameSocket(socket);
    }
  }, []);

  React.useEffect(() => {
    console.log(`                                      Titeenien
                                  taistottulevattän
                              äviikonloppunaTampereell
                      ejatässävieläin           foaTiTen
                   jäsenilleviik                  onlopun
                 tapahtumista!Ti                   teenit
                 alkavatvirallise                   stiTi
                 teenigaalal laHerv    annankampuk  senvä
                 estösuojaBommarissa perjantaina.Gaa laon
                 vainlipunsinnelun  astaneille.Olemmeavan
                neetl  isäpaikkoja  Titeenigaalaan!Lipunv
               oitlunastaaitsellesi TiTentiskil lä!Luvass
              aeeppinenshow,livem   usiikkiajaruokaa,lisä
             ksiillanpääesiintyjänähdäänBUSINESSC  ITY!L
            ipuno          staneilleonlähetet     tyeril
           linen                      infopak     etti,m
          uttajo                                 setole
         lipust                                 asihuo
        limatt                                  atätäs
        aanut                      ,ota        thanyh
        teyt                      tä!Va lit   ettava
        stir                      uokatilaus  onjol                         ähtenyt,j
       otene                      mmevoitaa  taett                        äkaikkialler
       giatt                     uleehuomio iduks                       ijosil    moit
       taudu                     ttässävai  heess                     a.Voitv    armis
       taaer                    ikosruoka  valios                   iTiteen     imaju
       risto                    lta.Viik   onlopunaikanatuleema   hdollis     uusus
        eaan                   otteesee    nsaunoajapaljuilla.Aikataulu      jenvu
        oksi                   emmepys     tyjär   jestä   määnerilli      siävuo
        roja                  erisukup      uol   ille,jotensaunomi      nentap
        ahtuu               sekas aunas         sa,jossakaikillatu     leeolla
         uikk             aritp  äällä!V         araathanmukaansiisu   ikkaritj
         apyyh            keenjoshaluats                     aunoatai    paljuilla
          !Koko            viikonlopull              ekan       nattaa  vara tamyö
          skätei              stä.                   Tite        enient  aistottu
           levatt                                änä              viiko    nlop
            punaTamp                            eree              lleja     täss
               ävieläi       5zhrT7qVS+LooAHc   nfoa              TiTenjäsenille
     vii        konlopunta                       paht           umista!Titeenit
    alkavat    virallisestiTitee                  nig         aalalla    H
    ervannankampuk senväestösuojaBommari           ssap    erjanta
    ina. Gaalaonvainlip    unsinnelunastan eille.Olemmeavanneetl
     isäp  aikkojaTit         eenigaalaan !Lipunvoitlunastaai
      tsel   lesiTi         Tentiskillä! Luvas saeeppinens
       how,livemu           siikkiajaru  okaa
        ,lisäks              iillanpä   äesi
          int                yjänäh    dään
                              BUSINE  SSCI
                               TY!Lipunos
                                 taneill
                                   eon  `);
    if (Math.random() > 0.95) {
      pushChat({
        text: '\u006f\u0061\u0064\u0069\u006e\u0067\u0020\u0063\u0068\u0061\u0074\u002e\u0074\u0078\u0074',
        type: ChatMsgType.Server,
      });
    }
  }, []);

  const handleError = useCallback(() => setViewMode(ViewMode.NetworkError), []);
  const handleZoneChange = useCallback(
    (zone: number) => {
      gameChannel
        ?.leave(5000)
        .receive('ok', () => {
          setTimeout(() => joinChannel(zone), 500);
        })
        .receive('error', () => {
          console.error('error changing zones');
        });
    },
    [joinChannel, gameChannel]
  );

  let content = null;

  switch (viewMode) {
    case ViewMode.Loading:
      content = <Loading />;
      break;
    case ViewMode.NetworkError:
      content = <NetworkError />;
      break;
    case ViewMode.GuildLobby:
      content = (
        <GuildLobby
          token={token}
          onSuccess={() => setViewMode(ViewMode.ClassLobby)}
          onError={handleError}
        />
      );
      break;
    case ViewMode.ClassLobby:
      content = <ClassLobby token={token} onSuccess={() => joinChannel(1)} onError={handleError} />;
      break;
    case ViewMode.Game:
      content = (
        <Game
          gamechannel={gameChannel!}
          chatchannel={chatChannel!}
          levelup={levelup}
          onMapButton={() => setViewMode(ViewMode.Map)}
          onHelpButton={() => setViewMode(ViewMode.Help)}
          onLeaderButton={() => setViewMode(ViewMode.Leaderboard)}
        />
      );
      break;
    case ViewMode.Map:
      content = (
        <Map
          token={token}
          onBack={() => setViewMode(ViewMode.Game)}
          onChange={(zone: number) => handleZoneChange(zone)}
          onLeaderboard={() => setViewMode(ViewMode.Leaderboard)}
        />
      );
      break;
    case ViewMode.Help:
      content = <Help onBack={() => setViewMode(ViewMode.Game)} />;
      break;
    case ViewMode.Leaderboard:
      content = <Leaderboard onBack={() => setViewMode(ViewMode.Game)} />;
      break;
    case ViewMode.Login:
      content = <LoginWidget />;
      break;
    default:
      content = <Loading />;
      break;
  }

  if (viewMode === ViewMode.Game && (!userChannel || !chatChannel || !gameChannel)) {
    content = <Loading />;
  }

  return (
    <div className="app">
      <div id="gamecontainer" className="gamecontainer">
        {content}
        <Konami />
      </div>
    </div>
  );
}
