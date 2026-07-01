import * as migration_20260701_163737_initial from './20260701_163737_initial';

export const migrations = [
  {
    up: migration_20260701_163737_initial.up,
    down: migration_20260701_163737_initial.down,
    name: '20260701_163737_initial'
  },
];
