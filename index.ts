import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";

import { Config } from "./routes/github/client";
import serviceDiscovery from "./routes/serviceDiscovery";
import listAvailableVersions from "./routes/listAvailableVersions";
import findProviderPackage from "./routes/findProviderPackage";
import domainMapping from "./domainMapping";

const DEFAULT_ENDPOINT = "https://api.github.com/graphql";
const DEFAULT_SUBDOMAIN = "github";
const PROVIDERS_PATH = "/providers/v1";

const subdomain = process.env.SUBDOMAIN || DEFAULT_SUBDOMAIN;
const zoneId = process.env.ZONE_ID as string;

const ghConfig: Config = {
  defaultToken: process.env.DEFAULT_TOKEN as string,
  endpoint: process.env.ENDPOINT || DEFAULT_ENDPOINT,
};

const api = new awsx.apigateway.API("github-releases-tf", {
  routes: [
    {
      path: "/.well-known/terraform.json",
      method: "GET",
      eventHandler: new aws.lambda.CallbackFunction("serviceDiscovery", {
        callback: serviceDiscovery(PROVIDERS_PATH),
      }),
    },
    {
      path: `${PROVIDERS_PATH}/{namespace}/{type}/versions`,
      method: "GET",
      eventHandler: new aws.lambda.CallbackFunction("listAvailableVersions", {
        callback: listAvailableVersions(ghConfig),
      }),
    },
    {
      path: `${PROVIDERS_PATH}/{namespace}/{type}/{version}/download/{os}/{arch}`,
      method: "GET",
      eventHandler: new aws.lambda.CallbackFunction("findProviderPackage", {
        callback: findProviderPackage(ghConfig),
      }),
    },
  ],
});

domainMapping(zoneId, subdomain, api);

export const url = api.url;
