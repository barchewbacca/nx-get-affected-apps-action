import * as core from '@actions/core';
import { execSync } from 'child_process';

interface Props {
  base?: string;
  head?: string;
  workspace: string;
}

export function getAffectedApps({ base = '', head = '', workspace }: Props): string[] {
  const args = `--base=${base} --head=${head} --plain`;
  let result;

  try {
    const cmd = `npx nx affected:apps ${args}`;
    core.debug(`Attempting npm script: ${cmd}`);
    result = execSync(cmd, {
      cwd: workspace,
    })
      .toString()
      .trim();
    core.info(`Testing out plain output: ${result}`);
  } catch (e) {
    core.debug(`first attempt failed: ${e.message}`);
    try {
      const cmd = `./node_modules/.bin/nx affected:apps ${args}`;
      core.debug(`Attempting from node modules: ${cmd}`);
      result = execSync(cmd, {
        cwd: workspace,
      })
        .toString()
        .trim();
    } catch (e2) {
      try {
        core.debug(`second attempt failed: ${e2.message}`);
        const cmd = `nx affected:apps ${args}`;
        core.debug(`Attempting global npm bin: ${cmd}`);
        result = execSync(cmd, {
          cwd: workspace,
        })
          .toString()
          .trim();
      } catch (e3) {
        core.debug(`third attempt failed: ${e3.message}`);
        throw Error(
          'Could not run NX cli...Did you install it globally and in your project? Also, try adding this npm script: "nx":"nx"'
        );
      }
    }
  }

  if (!result) {
    core.info('Looks like no changes were found...');
    return [];
  }

  core.info(`BOOM... ${JSON.stringify(result)}`);

  const apps = result.split(' ');

  return apps;
}
