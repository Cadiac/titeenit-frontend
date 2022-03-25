import './Lobby.scss';
import { useEffect, useState } from 'react';
import { apiclient } from '../restapi';
import { Loading } from './Loading';
import { RawHeroClass, RawGuild, RawProfile } from '../model';
import { useStoreActions } from '../store';
import { AxiosResponse } from 'axios';

export function GuildLobby(props: { token?: string; onSuccess(): void; onError(): void }) {
  const [guilds, setGuilds] = useState<RawGuild[] | null>(null);
  const [config, setConfig] = useState({});
  const { onSuccess, onError, token } = props;
  useEffect(() => {
    const conf = { headers: { authorization: `bearer: ${token}` } };
    setConfig(conf);
    async function getProfile() {
      try {
        const profileResponse: AxiosResponse<RawProfile> = await apiclient.get(
          '/api/profile',
          conf
        );

        localStorage.setItem('player_id', profileResponse.data.id.toString());
        if (!profileResponse.data.guild) {
          const guildsResponse = await apiclient.get('/api/guilds', conf);
          setGuilds(guildsResponse.data);
        }
      } catch {
        onError();
      }
    }
    getProfile();
  }, [token, onError]);

  const handleGuildJoin = async (id: number) => {
    try {
      await apiclient.post('/api/guilds/join', { guild_id: id }, config);
      localStorage.setItem('guild_id', id.toString());
      onSuccess();
    } catch {
      console.error('meh');
      onError();
    }
  };

  return (
    <div className="lobby">
      <h1>Choose your guild:</h1>
      {!guilds && <Loading />}
      {guilds && (
        <div className="guilds">
          {guilds.map((one: RawGuild) => {
            return (
              <div className="guildcontainer">
                <button onClick={() => handleGuildJoin(one.id)} key={one.id}>
                  <img src={one.logo_url} alt={one.name} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ClassLobby(props: { token?: string; onSuccess(): void; onError(): void }) {
  const [classes, setClasses] = useState<RawHeroClass[] | null>(null);
  const [config, setConfig] = useState({});
  const setProfile = useStoreActions((state) => state.game.setProfile);
  const { onSuccess, onError, token } = props;
  useEffect(() => {
    const conf = { headers: { authorization: `bearer: ${token}` } };
    setConfig(conf);
    async function getProfile() {
      try {
        const profileResponse: AxiosResponse<RawProfile> = await apiclient.get(
          '/api/profile',
          conf
        );
        setProfile(profileResponse.data);
        localStorage.setItem('player_id', profileResponse.data.id.toString());
        if (!profileResponse.data.class) {
          const classesResponse = await apiclient.get('/api/classes', conf);
          setClasses(classesResponse.data);
        }
      } catch {
        onError();
      }
    }
    getProfile();
  }, [token, onError, setProfile]);

  const handleClassJoin = async (id: string) => {
    try {
      await apiclient.post('/api/classes/join', { class: id }, config);
      localStorage.setItem('class_id', id);
      const profileResponse: AxiosResponse<RawProfile> = await apiclient.get(
        '/api/profile',
        config
      );
      setProfile(profileResponse.data);

      onSuccess();
    } catch {
      console.error('meh');
      onError();
    }
  };

  return (
    <div className="lobby">
      <h1>Choose your class:</h1>
      {!classes && <Loading />}
      {classes && (
        <div className="guilds">
          {classes.map((one: RawHeroClass) => {
            return (
              <div className="guildcontainer">
                <button onClick={() => handleClassJoin(one.id)} key={one.id}>
                  <img src={one.icon} alt={one.name} />
                </button>
                <label>{one.name}</label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
