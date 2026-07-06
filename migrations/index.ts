import * as migration_20260701_163737_initial from './20260701_163737_initial';
import * as migration_20260702_161623_add_visitor_active from './20260702_161623_add_visitor_active';
import * as migration_20260706_074737_add_experience_drafts from './20260706_074737_add_experience_drafts';
import * as migration_20260706_104534_add_portfolio_drafts from './20260706_104534_add_portfolio_drafts';

export const migrations = [
  {
    up: migration_20260701_163737_initial.up,
    down: migration_20260701_163737_initial.down,
    name: '20260701_163737_initial',
  },
  {
    up: migration_20260702_161623_add_visitor_active.up,
    down: migration_20260702_161623_add_visitor_active.down,
    name: '20260702_161623_add_visitor_active',
  },
  {
    up: migration_20260706_074737_add_experience_drafts.up,
    down: migration_20260706_074737_add_experience_drafts.down,
    name: '20260706_074737_add_experience_drafts',
  },
  {
    up: migration_20260706_104534_add_portfolio_drafts.up,
    down: migration_20260706_104534_add_portfolio_drafts.down,
    name: '20260706_104534_add_portfolio_drafts'
  },
];
