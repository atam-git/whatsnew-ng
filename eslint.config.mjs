import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ['.next/**', 'node_modules/**', 'src/lib/api/schema.d.ts', 'next-env.d.ts'],
  },
  {
    // Newly-enforced with the eslint-config-next 16 bump. Flags the
    // "seed local form state from fetched data once" pattern used throughout
    // the app (guarded with `if (data && !form)` so it only fires on load,
    // not every render) - a deliberate, working pattern predating this rule,
    // not something to refactor as a side effect of a dependency bump.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
];

export default eslintConfig;
