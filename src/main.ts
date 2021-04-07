import * as core from '@actions/core';
import { getAffectedApps } from './getAffectedApps';

export async function run(workspace = '.'): Promise<void> {
  try {
    const { GITHUB_WORKSPACE = workspace } = process.env;
    core.info(`Check ${process.env.GITHUB_WORKSPACE}`);
    const base = core.getInput('base');
    const head = core.getInput('head');

    core.exportVariable('NX_BASE', base || 'HEAD~1');
    core.exportVariable('NX_HEAD', head || 'HEAD');

    core.info(`Getting diff from ${base || 'HEAD~1'} to ${head || 'HEAD'}`);
    core.info(`Using dir: ${GITHUB_WORKSPACE}`);

    const affectedApps = getAffectedApps({
      base,
      head,
      workspace: GITHUB_WORKSPACE,
    });

    core.setOutput('affected_apps', affectedApps);
    core.exportVariable('NX_AFFECTED_APPS', affectedApps);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
