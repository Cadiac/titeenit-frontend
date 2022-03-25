import { useEffect } from 'react';

export function LoginWidget(_props: {}) {
  useEffect(() => {
    const script = document.createElement('script');

    script.src = 'https://telegram.org/js/telegram-widget.js?16';
    script.async = true;
    script.setAttribute('data-telegram-login', `${import.meta.env.VITE_LOGIN_TELEGRAM_BOT_NAME}`);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-auth-url', `${import.meta.env.VITE_LOGIN_URL}`);
    script.setAttribute('data-request-access', 'write');

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="loginerror">
      <span>Kirjaudu sisään.</span>
      <span>Voit myös huutaa Telegramissa</span>
      <span>{`@${import.meta.env.VITE_LOGIN_TELEGRAM_BOT_NAME} käskyn "/login"`}</span>
    </div>
  );
}
