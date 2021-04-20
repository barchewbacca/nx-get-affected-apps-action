import * as core from '@actions/core';
import { execSync } from 'child_process';

interface ActionParams {
  base?: string;
  head?: string;
  registry: string;
  tag?: string;
}

export function getAffectedApps({ base = '', head = '', registry, tag }: ActionParams): string[] {
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

  const affectedAppsList = affectedApps.split(' ');
  const imageTag = tag || head.substring(0, 8);

  for (const app of affectedAppsList) {
    core.info(`Creating a docker image for the ${app} application.`);
    execSync(`docker build -t ${registry}/${app}:${imageTag} --build-arg APP=${app} . `, {
      stdio: 'inherit',
    });
    core.info(`Pushing the ${app}:${imageTag} docker image to the ${registry} container registry.`);
    execSync(`docker push ${registry}/${app}:${imageTag}`, { stdio: 'inherit' });
  }

  return affectedAppsList;
}
