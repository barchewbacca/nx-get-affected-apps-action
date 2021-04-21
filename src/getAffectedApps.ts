import * as core from '@actions/core';
import axios from 'axios';
import { execSync } from 'child_process';
import { DeploymentManagerRequest, DeploymentManagerSecrets } from './main';

interface ActionParams {
  base?: string;
  head?: string;
  deploymentManagerUrl: string;
  registry: string;
  tag?: string;
  dockerAuth: string;
  secrets: DeploymentManagerSecrets;
}

export function getAffectedApps({
  base = '',
  head = '',
  deploymentManagerUrl,
  registry,
  tag,
  dockerAuth,
  secrets,
}: ActionParams): string[] {
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
  const dockerTag = tag || head.substring(0, 8);

  for (const app of affectedAppsList) {
    core.info(`Creating a docker image for the ${app} application.`);
    execSync(`docker build -t ${registry}/${app}:${dockerTag} --build-arg APP=${app} . `, {
      stdio: 'inherit',
    });
    core.info(`Pushing the ${app}:${dockerTag} docker image to the ${registry} container registry.`);
    execSync(`docker push ${registry}/${app}:${dockerTag}`, { stdio: 'inherit' });
    const req: DeploymentManagerRequest = {
      docker: {
        ImageName: `${registry}/${app}`,
        DockerAuth: dockerAuth,
        ContainerName: app,
        DockerTag: dockerTag,
      },
      secrets,
    };
    deployApp(deploymentManagerUrl, req);
  }

  return affectedAppsList;
}

function deployApp(url: string, req: DeploymentManagerRequest): void {
  core.info(`Test ${JSON.stringify(req)}`);
  axios
    .get(url, {
      params: req,
      headers: { 'Content-Type': 'application/json' },
    })
    .then(x => core.info(`Success: ${x}`))
    .catch(x => core.info(`Failed: ${x}`));
  // execSync(
  //   `curl --location --request GET '${url}' \
  //   --header 'Content-Type: application/json' \
  //   --data-raw '${JSON.stringify(req)}'`,
  //   { stdio: 'inherit' }
  // );
}
