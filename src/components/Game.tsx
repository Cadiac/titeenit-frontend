import dayjs from 'dayjs';
import { Channel } from 'phoenix';
import { useCallback, useEffect, useRef, useState } from 'react';
import fullscreen from '../assets/fullscreen-line.png';
import healthbar from '../assets/healthbar.png';
import skillbar from '../assets/skillbar.png';
import targetbar from '../assets/targetbar.png';
import { Buff, CastResponse, Spell } from '../model';
import { useStoreActions, useStoreState } from '../store';
import { DpsCounter } from '../utils/DpsCounter';
import {
  AttackButton,
  AutoAttackButton,
  getRandomArbitrary,
  LockedAttackButton,
} from './AttackButton';
import { ChatLog } from './ChatLog';
import './Game.scss';
import { Sidebar } from './Sidebar';

// import markeffect from "../assets/markeffect.png";
// import bloodlusteffect from "../assets/bloodlusteffect.png";

const dpsCounter = new DpsCounter();

export function Game(props: {
  gamechannel: Channel;
  chatchannel: Channel;
  levelup: any;
  onMapButton(): void;
  onHelpButton(): void;
  onLeaderButton(): void;
}) {
  // const [damagelist, setList] = useState<{ value: number; key: string; crit: boolean }[]>([]);
  const npc = useStoreState((state) => state.game.npc);
  const pastNpcs = useStoreState((state) => state.game.pastNpcList);
  const spells = useStoreState((state) => state.game.spells);
  const profile = useStoreState((state) => state.game.profile);
  const resources = useStoreState((state) => state.game.resources);
  const buffs = useStoreState((state) => state.game.buffs);
  const activeInfoSpell = useStoreState((state) => state.game.activeInfoSpell);
  const zone = useStoreState((state) => state.game.zone);
  const damageList = useStoreState((state) => state.game.damageList);
  const damageListOthers = useStoreState((state) => state.game.damageListOthers);
  const lastDamageDealt = useStoreState((state) => state.game.lastDamageDealt);
  const zonePlayers = useStoreState((state) => state.game.zonePlayers);
  const activateSpell = useStoreActions((state) => state.game.activateSpell);
  const setActiveInfoSpell = useStoreActions((state) => state.game.setActiveInfoSpell);
  const setCasting = useStoreActions((state) => state.game.setCasting);

  const [style, setStyle] = useState({});
  const [activebuff, setactivebuff] = useState<Buff | null>(null);
  const [dps, setDPS] = useState('');
  const [showSkill, setShowSkill] = useState(false);
  const buffInterval = useRef<any>();
  const [buffElements, setBuffElements] = useState<any>();
  const { gamechannel, chatchannel, levelup, onMapButton } = props;

  const handleAttack = useCallback(
    (spellId: number) => {
      gamechannel
        .push('game:begin_cast', { spell_id: spellId })
        .receive('ok', (payload: CastResponse) => {
          setActiveInfoSpell(spellId);
          activateSpell({
            spellId,
            cooldown: payload.cooldown,
            cast_time: payload.cast_time,
            attacking: payload.attacking,
          });
        })
        .receive('error', (reason: any) => {
          setCasting(null);
        });
    },
    [gamechannel, activateSpell, setActiveInfoSpell]
  );

  // Nudge the npc whenever it is damaged, even if its not by us
  useEffect(() => {
    if (npc?.isDead) {
      setStyle({
        transform: `translate(0px, 50px) rotate(${getRandomArbitrary(160, 200)}deg)`,
        transition: 'transform 330ms ease-in-out',
      });
    } else {
      setStyle({
        transform: `translate(${getRandomArbitrary(-3, 3)}px, ${getRandomArbitrary(
          -3,
          3
        )}px) rotate(${getRandomArbitrary(-5, 5)}deg)`,
      });
    }
  }, [damageList]);

  useEffect(() => {
    if (npc?.isDead) {
      setStyle({
        transform: `translate(0px, 50px) rotate(${getRandomArbitrary(160, 200)}deg)`,
        transition: 'transform 330ms ease-in-out',
      });
    }
  }, [npc]);

  useEffect(() => {
    dpsCounter.addDamage(lastDamageDealt.value);
    setDPS(dpsCounter.dps());
  }, [lastDamageDealt]);

  // update buffcontainer even if state is not updated
  useEffect(() => {
    buffInterval.current = setInterval(() => {
      setBuffElements(
        buffs.map((one) => {
          let remaining = '72h';

          if (one.expiresAt) {
            const seconds = one.expiresAt.diff(dayjs(), 'second');

            if (seconds < 0) {
              remaining = '0s';
            } else if (seconds >= 3600) {
              remaining = `${one.expiresAt.diff(dayjs(), 'hour')}h`;
            } else if (seconds >= 60) {
              remaining = `${one.expiresAt.diff(dayjs(), 'minute')}m`;
            } else {
              remaining = `${seconds}s`;
            }
          }

          return (
            <div className="buff" key={one.id} onClick={() => setactivebuff(one)}>
              <img src={one.img} alt="" />
              <span>{remaining}</span>
            </div>
          );
        })
      );
    }, 500);
    return function cleanup() {
      clearInterval(buffInterval.current);
    };
  }, [buffs]);

  function toggleFullscreen() {
    let elem = document.querySelector('.app');

    if (!document.fullscreenElement) {
      elem?.requestFullscreen().catch((err) => {
        alert(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  const ua = window.navigator.userAgent;
  const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);

  let resourceType;
  switch (profile?.class) {
    case 'warrior':
      resourceType = 'rage';
      break;
    case 'hunter':
      resourceType = 'focus';
      break;
    default:
      resourceType = 'mana';
      break;
  }

  return (
    <div className="game">
      {!iOS && (
        <button className="fullscreenbutton" onClick={() => toggleFullscreen()}>
          <img src={fullscreen} alt="" />
        </button>
      )}
      {zone && <img className="bg" src={zone.backgroundImageUrl} alt="" />}
      <div className="visuals">
        {levelup && (
          <div key={levelup} className="levelup">
            {`Level up ${profile?.level}!`}
          </div>
        )}
        <div className="buffcontainer">{buffElements}</div>
        <ChatLog chatchannel={chatchannel} />
        <Sidebar onMapButton={onMapButton} />
        <div className="zoneplayers">
          <div style={{ marginBottom: '5px' }}>{`Raid: ${zonePlayers.length}/50`}</div>
          {zonePlayers.map((x) => {
            return <span key={x}>{x}</span>;
          })}
        </div>
        {damageList.map((one) => (
          <div
            className={
              one.crit
                ? `damage critnumber damage-${one.color}`
                : `damage damagenumber damage-${one.color}`
            }
            key={one.key}
          >
            {one.value}
          </div>
        ))}

        {damageListOthers.map((one) => (
          <div className="otherdamage otherdamagenumber" key={one.key}>
            {one.value}
          </div>
        ))}
        <div className="dps">{`DPS: ${dps}`}</div>
        <div className="npc">
          <div className="targetbg" />
          <div className="targetpic">{npc?.imageUrl && <img src={npc?.imageUrl} alt="" />}</div>
          <span className="name">{npc?.name}</span>
          <span className="hp">{`${npc?.hp} / ${npc?.maxHp}`}</span>
          {npc && (
            <div
              className="hpmask"
              style={{ width: `calc(105px - (${npc.hp / npc.maxHp} * 105px))` }}
            ></div>
          )}
          {npc?.imageUrl && (
            <img
              style={style}
              className={`pic ${zone?.isBoss ? 'bosspic' : ''}`}
              src={npc?.imageUrl}
              alt=""
            />
          )}
          <span className="monsterlevel">{npc?.level}</span>
        </div>
        {pastNpcs.map((x) => {
          return (
            <div key={x.name + x.maxHp} className="pastnpc">
              {x?.imageUrl && <img src={x?.imageUrl} alt="" />}
            </div>
          );
        })}
      </div>
      <div className="controls">
        <div className="skillbarcontainer">
          {profile && (
            <div className="expcontainer">
              <span className="exptext">{`${profile.experience} / ${profile.experienceRequired}`}</span>
              <div
                className="expbar"
                style={{ width: `calc(100% * ${profile.experience / profile.experienceRequired}` }}
              />
            </div>
          )}
          <div className="icons">
            {[...Array(7).keys()].map((keybind) => {
              const spell: Spell | undefined = spells.find(
                (unlocked) => unlocked.id === keybind + 1
              );
              if (!spell) {
                return (
                  <LockedAttackButton key={`locked-${keybind}`} className={`position${keybind}`} />
                );
              } else if (spell.type === 'autoattack') {
                return (
                  <AutoAttackButton
                    key={spell.id}
                    className={`position${spell.id}`}
                    spell={spell}
                    onClick={handleAttack}
                  />
                );
              } else {
                return (
                  <AttackButton
                    key={spell.id}
                    className={`position${spell.id}`}
                    spell={spell}
                    onClick={handleAttack}
                  />
                );
              }
            })}
          </div>

          <img className="skillbar" src={skillbar} alt="" />
        </div>

        <button className="skillinfobutton" onClick={() => setShowSkill(true)}>
          ?
        </button>
        {showSkill && (
          <div className="skillinfo" onClick={() => setShowSkill(false)}>
            {activeInfoSpell ? (
              <div className="content">
                <img src={activeInfoSpell.icon_url} alt="" />
                <span className="spellname">{activeInfoSpell.name}</span>
                {activeInfoSpell.cooldown !== 0 && (
                  <span className="spellcd">{`${(activeInfoSpell.cooldown / 1000).toFixed(
                    1
                  )} sec cooldown`}</span>
                )}
                <span>{activeInfoSpell.description}</span>
              </div>
            ) : (
              <div className="content">
                <span className="empty">Select a spell by activating it</span>
              </div>
            )}
          </div>
        )}
        <img className="healthbar" src={healthbar} alt="" />
        {profile && (
          <div className="profile">
            <span className="levelnumber">{profile?.level}</span>
            <img className="profilepic" src={profile.photoUrl} alt=" " />
            <span className="playername">{profile?.username}</span>
            {(profile?.class === 'warrior' || profile?.class === 'hunter') && (
              <span className="resources">{`${resources} / 100`}</span>
            )}
            <div
              className={`resourcebar ${resourceType}`}
              style={{ width: `calc(110px * ${resources / 100}` }}
            />
            <div className="useless">.</div>
          </div>
        )}
        {activebuff && (
          <div className="buffinfo" onClick={() => setactivebuff(null)}>
            <div style={{ marginBottom: '15px' }}>{activebuff.name}</div>
            <div className="pic">
              <img src={activebuff.img} alt="" />
            </div>
            <div>{activebuff.description}</div>
          </div>
        )}
        <img className="targetbar" src={targetbar} alt="" />
        <button className="helpbutton" onClick={props.onHelpButton}>
          Help
        </button>
        <button className="leaderbutton" onClick={props.onLeaderButton}>
          123
        </button>
      </div>
    </div>
  );
}
