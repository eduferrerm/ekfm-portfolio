import * as migration_20260701_163737_initial from './20260701_163737_initial';
import * as migration_20260702_161623_add_visitor_active from './20260702_161623_add_visitor_active';
import * as migration_20260706_074737_add_experience_drafts from './20260706_074737_add_experience_drafts';
import * as migration_20260706_104534_add_portfolio_drafts from './20260706_104534_add_portfolio_drafts';
import * as migration_20260706_105922_add_landing_drafts from './20260706_105922_add_landing_drafts';
import * as migration_20260708_153739_add_media_blur_data_url from './20260708_153739_add_media_blur_data_url';

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
    name: '20260706_104534_add_portfolio_drafts',
  },
  {
    up: migration_20260706_105922_add_landing_drafts.up,
    down: migration_20260706_105922_add_landing_drafts.down,
    name: '20260706_105922_add_landing_drafts',
  },
  {
    up: migration_20260708_153739_add_media_blur_data_url.up,
    down: migration_20260708_153739_add_media_blur_data_url.down,
    name: '20260708_153739_add_media_blur_data_url'
  },
];
