import { apigateway as apigw } from "@pulumi/awsx";
import { serializeError } from "serialize-error";

import client, { Config } from "./github/client";
import { SHOW_RELEASE } from "./github/queries";
import { ShowReleaseResponse } from "./github/types";
import { releaseDetailsToPackage } from "./terraform/transformations";

// https://www.terraform.io/docs/internals/provider-registry-protocol.html#find-a-provider-package
export default (config: Config) => async (
  event: apigw.Request
): Promise<apigw.Response> => {
  const ghClient = client(config, event.headers?.Authorization);

  const repo = `terraform-provider-${event.pathParameters?.type as string}`;
  const version = event.pathParameters?.version as string;
  const baseName = `${repo}_${version}`;
  const os = event.pathParameters?.os as string;
  const arch = event.pathParameters?.arch as string;

  const download = `${baseName}_${os}_${arch}.zip`;

  const variables = {
    account: event.pathParameters?.namespace as string,
    repo,
    tag: `v${version}`,
    download,
    shasums: `${baseName}_SHA256SUMS`,
    signature: `${baseName}_SHA256SUMS.sig`,
  };

  let statusCode: number = 200;
  let body: string;

  try {
    const response: ShowReleaseResponse = await ghClient.request(
      SHOW_RELEASE,
      variables
    );

    const release = response.repository.release;
    if (!release) {
        throw `release ${version} not found`;
    }

    body = JSON.stringify(await releaseDetailsToPackage(os, arch, release));
  } catch (error) {
    statusCode = 400;
    body = JSON.stringify({ error: serializeError(error) });
  }

  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body,
  };
};
