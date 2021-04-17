import { apigateway as apigw } from "@pulumi/awsx";

export default (path: string) => async (
  event: apigw.Request
): Promise<apigw.Response> => ({
  headers: { "Content-Type": "application/json" },
  statusCode: 200,
  body: JSON.stringify({ "providers.v1": `${path}/` }),
});
