import * as core from '@actions/core';
import { execSync } from 'child_process';

interface ActionParams {
  base?: string;
  head?: string;
  exclude?: string;
}

export function getAffectedApps({ base = '', head = '', exclude = '' }: ActionParams): string {
  try {
    const affectedApps = execSync(`npx nx affected:apps --base=${base} --head=${head} --plain --exclude=${exclude}`)
      .toString()
      .trim();

    // eslint-disable-next-line no-console
    console.log('Exclude', exclude);

    if (!affectedApps) {
      core.info('No apps were touched by the changes');
      return '';
    }

    core.info(`Following apps were affected by the changes:\n${affectedApps}`);

    return affectedApps.replace(/\s+/g, ',');
  } catch (error) {
    core.info(`Running the Nx CLI failed with the error: ${error.message}`);
    throw Error('Could not run the Nx CLI');
  }
}
