import * as aws from "@pulumi/aws";
import { apigateway as apigw } from "@pulumi/awsx";

export default (zoneId: string, subdomain: string, api: apigw.API) => {
  const awsUsEast1 = new aws.Provider("us-east-1", { region: "us-east-1" });

  const zone = aws.route53.Zone.get("main", zoneId);
  const domainName = zone.name.apply((v) => `${subdomain}.${v}`);

  const cert = new aws.acm.Certificate(
    "cert",
    {
      domainName,
      validationMethod: "DNS",
    },
    { provider: awsUsEast1 }
  );

  const certValidationRecord = new aws.route53.Record("validation-record", {
    zoneId: zone.id,
    name: cert.domainValidationOptions[0].resourceRecordName,
    type: cert.domainValidationOptions[0].resourceRecordType,
    records: [cert.domainValidationOptions[0].resourceRecordValue],
    ttl: 10 * 60 /* 10 minutes */,
  });

  const certValidationIssued = new aws.acm.CertificateValidation(
    "validation",
    {
      certificateArn: cert.arn,
      validationRecordFqdns: [certValidationRecord.fqdn],
    },
    { provider: awsUsEast1 }
  );

  const webDomain = new aws.apigateway.DomainName("web-cdn", {
    certificateArn: certValidationIssued.certificateArn,
    domainName,
  });

  new aws.apigateway.BasePathMapping(
    "web-domain-mapping",
    {
      restApi: api.restAPI,
      stageName: api.stage.stageName,
      domainName: webDomain.id,
    }
  );

  new aws.route53.Record(
    "webDnsRecord",
    {
      name: domainName,
      type: "A",
      zoneId: zone.id,
      aliases: [
        {
          evaluateTargetHealth: true,
          name: webDomain.cloudfrontDomainName,
          zoneId: webDomain.cloudfrontZoneId,
        },
      ],
    },
    { dependsOn: certValidationIssued }
  );
};
