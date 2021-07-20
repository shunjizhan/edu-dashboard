module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    indent: [2, 2, { SwitchCase: 1 }],
    quotes: [2, 'single'],
    semi: [2, 'always'],
    'linebreak-style': [2, 'unix'],
    'arrow-parens': [2, 'as-needed'],
    'no-restricted-syntax': [
      'error',
      'ForInStatement',
      // 'ForOfStatement',
      'LabeledStatement',
      'WithStatement',
    ],
    'comma-dangle': [1, {
      "arrays": "always",
      "objects": "always",
      "imports": "never",
      "exports": "never",
      "functions": "never"
    }],
    
    /* ---------- turned off ---------- */
    'max-len': 0,
    'no-underscore-dangle': 0,
    'no-multi-spaces': 0,
    'no-unused-expressions': [2, { allowShortCircuit: true }],              // allow x && y()
    'import/no-extraneous-dependencies': [2, { devDependencies: true }],    // so can import enzyme, which is dev dependencies
  }
}
