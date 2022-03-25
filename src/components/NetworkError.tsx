import * as React from 'react';

export function NetworkError() {
  const [donotuse_code, setdonotuse_code] = React.useState('');

  React.useEffect(() => {
    setdonotuse_code('invalid_titeeni_code' + donotuse_code + 'bhyhcvynnnvanxnvxra');
  });

  return (
    <div className="networkerror">
      <span>Verkkovirhe</span>
      <span>Kirjaudu sisään ensiksi</span>
      <span>Jos ei auta niin laitappa viestiä ylläpitäjälle</span>
    </div>
  );
}
