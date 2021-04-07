import * as core from '@actions/core';
import { execSync } from 'child_process';

interface ActionParams {
  base?: string;
  head?: string;
}

export function getAffectedApps({ base = '', head = '' }: ActionParams): string[] {
  let affectedApps: string;

  try {
    affectedApps = execSync(`npx nx affected:apps --base=${base} --head=${head} --plain`).toString().trim();
  } catch (error) {
    core.info(`Running the Nx CLI failed with the error: ${error.message}`);
    throw Error('Could not run the Nx CLI');
  }

  if (!affectedApps) {
    core.info('No apps were touched by the changes');
    return [];
  }

  core.info(`Following apps were affected by the changes:\n${affectedApps}`);
  return affectedApps.split(' ');
}
