import * as migration_20260701_163737_initial from './20260701_163737_initial';
import * as migration_20260702_161623_add_visitor_active from './20260702_161623_add_visitor_active';

export const migrations = [
  {
    up: migration_20260701_163737_initial.up,
    down: migration_20260701_163737_initial.down,
    name: '20260701_163737_initial',
  },
  {
    up: migration_20260702_161623_add_visitor_active.up,
    down: migration_20260702_161623_add_visitor_active.down,
    name: '20260702_161623_add_visitor_active'
  },
];
