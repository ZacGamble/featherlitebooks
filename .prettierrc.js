module.exports = {
  arrowParens: 'avoid',
  bracketSameLine: true,
  bracketSpacing: true,
  singleQuote: true,
  trailingComma: 'all',
  semi: true,
  printWidth: 80,
  tabWidth: 2,
  importOrder: [
    '^react(-native)?$',
    '^expo(-.*)?$',
    '<THIRD_PARTY_MODULES>',
    '^@/(api|assets|auth|components|config|constants|hooks|navigation|screens|services|state|types|utils)(/.*)?$',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}; 