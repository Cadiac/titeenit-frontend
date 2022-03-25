import { FC, useCallback, useEffect, useState } from 'react';

const KONAMI_CODE = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

function useKonami(action: () => void, { code = KONAMI_CODE } = {}) {
  const [input, setInput] = useState<number[]>([]);

  const onKeyUp = useCallback(
    (e: KeyboardEvent) => {
      const newInput = input;
      newInput.push(e.keyCode);
      newInput.splice(-code.length - 1, input.length - code.length);

      setInput(newInput);

      if (newInput.join('').includes(code.join(''))) {
        action();
      }
    },
    [input, setInput, code, action]
  );

  useEffect(() => {
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [onKeyUp]);
}

const Konami: FC = () => {
  useKonami(() => {
    alert(
      '\u{1F430}\u{1F95A} \u{50}\u{76}\u{67}\u{51}\u{62}\u{4D}\u{50}\u{6F}\u{36}\u{62}\u{58}\u{48}\u{75}\u{6B}\u{4D}\u{30}'
    );
  });

  return null;
};

export default Konami;
