import * as core from '@actions/core';
import { getAffectedApps } from './getAffectedApps';

export async function run(): Promise<void> {
  try {
    const base = parse(core.getInput('base'));
    const head = core.getInput('head');
    const exclude = core.getInput('head');

    core.info(`Getting diff from ${base} to ${head}`);

    const affectedApps = getAffectedApps({
      base,
      head,
      exclude,
    });

    core.exportVariable('NX_AFFECTED_APPS', affectedApps);
  } catch (error) {
    core.setFailed(error.message);
  }
}

function parse(base: string): string {
  const isFirstCommit = base === '0000000000000000000000000000000000000000';
  return isFirstCommit ? 'origin/main' : base;
}

run();
