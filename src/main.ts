import * as core from '@actions/core';
import { getAffectedApps } from './getAffectedApps';

export interface DeploymentManagerRequest {
  docker: DeploymentManagerDocker;
  secrets: DeploymentManagerSecrets;
}

export interface DeploymentManagerDocker {
  ImageName: string;
  DockerAuth: string;
  ContainerName: string;
  DockerTag: string;
}

export interface DeploymentManagerSecrets {
  VaultRoleID: string;
  VaultSecretID: string;
  VaultNameSpace: string;
  VaultURL: string;
  VaultKeyPath: string;
  VaultSecretName: string;
  VaultAuthMethod: string;
}

export async function run(): Promise<void> {
  try {
    const base = core.getInput('base');
    const head = core.getInput('head');
    const registry = core.getInput('registry');
    const tag = core.getInput('tag');
    const deploymentManagerUrl = core.getInput('deploymentManagerUrl');
    const dockerAuth = core.getInput('dockerAuth');
    const vaultUrl = core.getInput('vaultUrl');
    const vaultRoleId = core.getInput('vaultRoleId');
    const vaultSecretId = core.getInput('vaultSecretId');
    const vaultNamespace = core.getInput('vaultNamespace');
    const vaultKeyPath = core.getInput('vaultKeyPath');
    const vaultSecretName = core.getInput('vaultSecretName');
    const vaultAuthMethod = core.getInput('vaultAuthMethod');

    core.info(`Getting diff from ${base || 'HEAD~1'} to ${head || 'HEAD'}`);

    const secrets: DeploymentManagerSecrets = {
      VaultRoleID: vaultRoleId,
      VaultSecretID: vaultSecretId,
      VaultNameSpace: vaultNamespace,
      VaultURL: vaultUrl,
      VaultKeyPath: vaultKeyPath,
      VaultSecretName: vaultSecretName,
      VaultAuthMethod: vaultAuthMethod,
    };

    getAffectedApps({
      base,
      head,
      deploymentManagerUrl,
      registry,
      tag,
      dockerAuth,
      secrets,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
