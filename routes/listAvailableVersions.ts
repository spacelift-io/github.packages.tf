import { apigateway as apigw } from "@pulumi/awsx";
import { serializeError } from "serialize-error";

import client, { Config } from "./github/client";
import { LIST_RELEASES } from "./github/queries";
import { ListReleasesResponse } from "./github/types";
import { Version } from "./terraform/types";
import { isReleaseReady, releaseItemToVersion } from "./terraform/transformations";

// https://www.terraform.io/docs/internals/provider-registry-protocol.html#list-available-versions
export default (config: Config) => async (
  event: apigw.Request
): Promise<apigw.Response> => {
  const ghClient = client(config, event.headers?.Authorization);

  const variables = {
    account: event.pathParameters?.namespace as string,
    repo: `terraform-provider-${event.pathParameters?.type as string}`,
  };

  let statusCode: number = 200;
  let body: string;

  try {
    const response: ListReleasesResponse = await ghClient.request(
      LIST_RELEASES,
      variables
    );

    const versions: Version[] = response.repository.releases.nodes
      .filter(isReleaseReady)
      .map(releaseItemToVersion);

    body = JSON.stringify({ versions });
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
