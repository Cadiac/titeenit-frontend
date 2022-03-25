import { useStoreState } from '../store';
import { useState } from 'react';

export function Sidebar(props: { onMapButton(): void }) {
  const zone = useStoreState((state) => state.game.zone);
  const [sidebarStyle, setSidebarStyle] = useState('hide');

  const toggleChatModes = () => {
    if (sidebarStyle === 'normal') {
      setSidebarStyle('hide');
    } else {
      setSidebarStyle('normal');
    }
  };

  return (
    <div className={`sidebar ${sidebarStyle} `}>
      <div className="close" onClick={toggleChatModes}>
        <span className="closetext">{sidebarStyle === 'normal' ? '>>' : 'Zone'}</span>
      </div>
      {sidebarStyle === 'normal' && (
        <div className="inner">
          {zone && (
            <div className="zone">
              <span className="zoneheader">Current Zone</span>
              <span className="zoneinfo">Name: {zone.name}</span>
              <span className="zoneinfo" style={{ color: zone.cleared ? 'green' : 'red' }}>
                Cleared: {zone.cleared ? 'YES' : 'NO'}
              </span>
              <span className="zoneinfo">
                Killcount: {`${zone.currentKills} / ${zone.requiredKills}`}
              </span>
              <span className="zoneinfo">Min level: {zone.minLevel}</span>
              <span className="zoneinfo">Max level: {zone.maxLevel}</span>
              <div className="zonechange">
                <button onClick={() => props.onMapButton()}>Change zone</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
