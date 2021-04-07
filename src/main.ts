import * as core from '@actions/core';
import { getAffectedApps } from './getAffectedApps';

export async function run(): Promise<void> {
  try {
    const base = core.getInput('base');
    const head = core.getInput('head');

    core.exportVariable('NX_BASE', base || 'HEAD~1');
    core.exportVariable('NX_HEAD', head || 'HEAD');

    core.info(`Getting diff from ${base || 'HEAD~1'} to ${head || 'HEAD'}`);

    const affectedApps = getAffectedApps({
      base,
      head,
    });

    core.setOutput('affected_apps', affectedApps);
    core.exportVariable('NX_AFFECTED_APPS', affectedApps);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
