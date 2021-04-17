import { GraphQLClient } from "graphql-request";

export declare type Config = {
  endpoint: string,
  defaultToken: string,
}

export default (config: Config, customAuth: string | undefined): GraphQLClient => {
  const client = new GraphQLClient(config.endpoint);

  if (customAuth) {
    client.setHeader("Authorization", customAuth);
  } else {
    client.setHeader("Authorization", `Bearer ${config.defaultToken}`);
  }

  return client;
};
