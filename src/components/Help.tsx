import './Help.scss';
import { useState } from 'react';

export function Help(props: { onBack(): void }) {
  const [code, setCode] = useState('???');
  return (
    <div className="help">
      <p>
        Kill trash until the boss of the zone is unlocked. Remember to check out the other zones by
        using the right panel
      </p>
      <p>
        Get stronger by leveling up or{' '}
        <span
          onClick={() =>
            setCode(
              '\u0065\u006e\u0074\u0065\u0072\u0069\u006e\u0067\u0020\u0022\u002f\u0072\u0065\u0064\u0065\u0065\u006d\u0020\u0066\u0069\u0072\u0073\u0074\u0062\u006c\u006f\u006f\u0064\u0022'
            )
          }
        >
          {code}
        </span>{' '}
        and challenge the boss as a team
      </p>
      <p>Press "123" to view titeeniprogress and personal leaderboards</p>
      <button onClick={props.onBack}>Close</button>
    </div>
  );
}
