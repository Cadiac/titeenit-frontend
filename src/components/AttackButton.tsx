import './AttackButton.scss';
import { useEffect, useCallback, useState, useRef } from 'react';
import { Spell } from '../model';
import dayjs from 'dayjs';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { useStoreState, useStoreActions } from '../store';

export function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function LockedAttackButton(props: { className?: string }) {
  return (
    <div className="attackcontainer">
      <div className={'attackbutton ' + props.className}></div>
    </div>
  );
}

export function AttackButton(props: {
  className?: string;
  spell: Spell;
  onClick(spellId: number): void;
}) {
  const {
    onClick,
    spell: { name, id, activeCooldown, cast_time, icon_url, cost },
  } = props;
  const casting = useStoreState((state) => state.game.casting);
  const resources = useStoreState((state) => state.game.resources);
  const npc = useStoreState((state) => state.game.npc);
  const setCasting = useStoreActions((state) => state.game.setCasting);
  const [cd, setCd] = useState(0);
  const [maxCd, setMaxCd] = useState(0);
  const intervalRef = useRef<any>();

  useEffect(() => {
    if (!activeCooldown) {
      setCd(0);
      clearInterval(intervalRef.current);
      return;
    } else {
      const delta = activeCooldown.diff(dayjs(), 'millisecond');
      if (delta < 500) {
        return;
      }
      const id = setInterval(() => {
        const calcedCd = activeCooldown!.diff(dayjs(), 'millisecond');
        if (calcedCd <= 0) {
          setCd(0);
          clearInterval(intervalRef.current);
          return;
        }
        setCd(calcedCd);
      }, 50);
      intervalRef.current = id;
      setMaxCd(delta);
    }
    return function cleanup() {
      clearInterval(intervalRef.current);
    };
  }, [activeCooldown]);

  const handleClick = useCallback(() => {
    if (cd <= 0 && !casting && cost <= resources) {
      if (cast_time) {
        setCasting(id);
        onClick(id);
      } else {
        onClick(id);
      }
    }
  }, [onClick, cd, casting, id, setCasting, cast_time, resources, cost]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === `Digit${id.toString()}` && cd <= 0 && !npc?.isDead) {
        handleClick();
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return function cleanup() {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [handleClick, id, cd]);

  return (
    <div className="attackcontainer">
      {casting === id && (
        <div className="castbar">
          <div className="bar" style={{ animationDuration: `${cast_time / 1000}s` }} />
          <span className="name">{name}</span>
        </div>
      )}
      <div
        className={'attackbutton ' + props.className}
        onClick={() => (npc?.isDead ? null : handleClick())}
        style={cd !== 0 ? { backgroundColor: '#1c1417a7' } : undefined}
      >
        {cost > resources && <div className="shade"></div>}
        {icon_url && <img src={icon_url} alt={name} />}
        {cd !== 0 && (
          <div className="cooldown">
            <div className="svgcontainer">
              <CircularProgressbar
                value={(cd / maxCd) * 100}
                text={`${Math.ceil(cd / 1000)}`}
                counterClockwise={true}
                strokeWidth={50}
                minValue={3}
                maxValue={100}
                styles={buildStyles({
                  strokeLinecap: 'butt',
                  pathColor: '#1c1417cb',
                  textColor: 'yellow',
                  backgroundColor: '#00000000',
                  trailColor: '#00000000',
                })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AutoAttackButton(props: {
  className?: string;
  spell: Spell;
  onClick(spellId: number): void;
}) {
  const {
    onClick,
    spell: { name, id, activeCooldown, icon_url },
  } = props;
  const npc = useStoreState((state) => state.game.npc);
  const [cd, setCd] = useState(0);
  const [maxCd, setMaxCd] = useState(0);
  const attacking = useStoreState((state) => state.game.attacking);
  const casting = useStoreState((state) => state.game.casting);
  const setCasting = useStoreActions((state) => state.game.setCasting);
  const intervalRef = useRef<any>();

  useEffect(() => {
    if (!activeCooldown) {
      setCd(0);
      clearInterval(intervalRef.current);
      return;
    } else {
      const delta = activeCooldown.diff(dayjs(), 'millisecond');
      if (delta < 500) {
        return;
      }
      const id = setInterval(() => {
        const calcedCd = activeCooldown!.diff(dayjs(), 'millisecond');
        if (calcedCd <= 0) {
          setCd(0);
          clearInterval(intervalRef.current);
          return;
        }
        setCd(calcedCd);
      }, 50);
      intervalRef.current = id;
      setMaxCd(delta);
    }
    return function cleanup() {
      clearInterval(intervalRef.current);
    };
  }, [activeCooldown]);

  const handleClick = useCallback(() => {
    if (cd <= 0 && !casting) {
      onClick(id);
    }
  }, [onClick, cd, casting, id, setCasting]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === `Digit${id.toString()}` && cd <= 0 && !npc?.isDead) {
        handleClick();
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return function cleanup() {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [handleClick, id, cd]);

  return (
    <div className="attackcontainer">
      <div
        className={'attackbutton ' + props.className + (attacking ? ' autoattack' : '')}
        onClick={() => (npc?.isDead ? null : handleClick())}
        style={cd !== 0 ? { backgroundColor: '#1c1417a7' } : undefined}
      >
        {attacking && <div className="overlay"></div>}
        {icon_url && <img src={icon_url} alt={name} />}
        {cd !== 0 && (
          <div className="cooldown">
            <div className="svgcontainer">
              <CircularProgressbar
                value={(cd / maxCd) * 100}
                text={`${Math.ceil(cd / 1000)}`}
                counterClockwise={true}
                strokeWidth={50}
                minValue={3}
                maxValue={100}
                styles={buildStyles({
                  strokeLinecap: 'butt',
                  pathColor: '#1c1417cb',
                  textColor: 'yellow',
                  backgroundColor: '#00000000',
                  trailColor: '#00000000',
                })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
