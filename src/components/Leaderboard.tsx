import './Leaderboard.scss';
import { useEffect, useState } from 'react';
import { apiclient } from '../restapi';
import { AxiosResponse } from 'axios';
import { LeaderboardGuild, LeaderboardPlayer } from '../model';
import urlPic from '../assets/url.png';

export function Leaderboard(props: { onBack(): void }) {
  const [showType, setShowType] = useState('guilds');
  const [guilds, setGuilds] = useState<LeaderboardGuild[] | null>(null);
  const [players, setPlayers] = useState<LeaderboardPlayer[] | null>(null);
  useEffect(() => {
    async function getGuilds() {
      try {
        const guildResponse: AxiosResponse<LeaderboardGuild[]> = await apiclient.get(
          '/api/leaderboard/guilds'
        );
        setGuilds(guildResponse.data);
      } catch {
        console.error('Error fetching leaderboard');
        props.onBack();
      }
    }
    async function getPlayers() {
      try {
        const playerResponse: AxiosResponse<LeaderboardPlayer[]> = await apiclient.get(
          '/api/leaderboard/players'
        );
        setPlayers(playerResponse.data);
      } catch {
        console.error('Error fetching leaderboard');
        props.onBack();
      }
    }
    getGuilds();
    getPlayers();
  }, [props]);

  let guildsProgress = null;
  if (showType === 'guilds' && guilds) {
    guildsProgress = guilds
      .slice()
      .map((guild) => {
        return {
          ...guild,
          progress: guild.progress.filter((x) => x.cleared).length,
        };
      })
      .sort((a, b) => {
        if (a.progress > b.progress) {
          return -1;
        } else if (a.progress < b.progress) {
          return 1;
        }
        return 0;
      });
  }

  let playersProgress = null;
  if (showType === 'players' && players) {
    playersProgress = players.slice().sort((a, b) => {
      if (a.rank > b.rank) {
        return 1;
      } else if (a.rank < b.rank) {
        return -1;
      }
      return 0;
    });
  }

  return (
    <div className="leaderboard">
      <div className="content">
        <span className="header">Leaderboard</span>
        <div className="tabs">
          <button onClick={() => setShowType('guilds')}>Titeeniprogress</button>
          <button onClick={() => setShowType('players')}>Armory</button>
        </div>
        {showType === 'guilds' && guilds && (
          <div className="guilds">
            {guildsProgress &&
              guildsProgress.map((one) => {
                return (
                  <div className="guild" key={one.guild_id}>
                    <span>{one.name}</span>
                    <span>{`${one.progress}/14`}</span>
                  </div>
                );
              })}
          </div>
        )}
        {showType === 'players' && players && (
          <div className="players">
            {playersProgress &&
              playersProgress.map((one) => {
                return (
                  <div className="player" key={one.id}>
                    <span>{`${one.rank}. ${one.username}`}</span>
                    <span>Level {one.level}</span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
      <img
        style={{ position: 'absolute', bottom: 0, left: 0, zIndex: 0, transform: 'scale(0.7)' }}
        src={urlPic}
        alt=""
      />
      <button onClick={props.onBack}>Close</button>
    </div>
  );
}
