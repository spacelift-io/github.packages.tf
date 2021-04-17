import axios from "axios";
import { userInfo } from "os";

import * as gh from "../github/types";
import * as tf from "./types";

export const isReleaseReady = (release: gh.ListReleasesItem) : boolean => {
    return !release.isDraft && !release.isPrerelease
}

export const releaseItemToVersion = (release: gh.ListReleasesItem): tf.Version => {
  const { protocols } = parseDescription(release.description);

  let platforms: tf.Platform[] = [];

  release.releaseAssets.nodes.forEach(({ filename }) => {
    if (!filename.endsWith(".zip")) {
      return;
    }

    const [, , os, arch] = filename.replace(/\.zip$/, "").split("_");

    platforms.push({ os, arch });
  });

  return {
    version: release.name.replace(/^v/, ""),
    protocols,
    platforms,
  };
};

export const releaseDetailsToPackage = async (os: string, arch: string, details: gh.ShowReleaseDetails): Promise<tf.Package> => {
  const description = parseDescription(details.description);

  const downloadAssets = details.download.nodes;
  if (downloadAssets.length !== 1) {
    throw `No packagage found for ${os}/${arch}`;
  }
  const filename = downloadAssets[0].name;

  const shasumsAssets = details.shasums.nodes;
  if (shasumsAssets.length !== 1) {
    throw `No SHA sums file found for the package`;
  }
  const shasumsUrl = shasumsAssets[0].url

  const signatureAssets = details.signature.nodes;
  if (signatureAssets.length !== 1) {
    throw `No SHA sums signature file found for the package`;
  }

  const tfPackage : tf.Package = {
    protocols: description.protocols,
    os,
    arch,
    filename,
    download_url: downloadAssets[0].url,
    shasums_url: shasumsAssets[0].url,
    shasums_signature_url: signatureAssets[0].url,
    shasum: await readChecksum(filename, shasumsUrl),
    signing_keys: {
      gpg_public_keys: [{ ...description.key }],
    }
  }

  return tfPackage;
}

const parseDescription = (description: string): gh.ReleaseDescription => {
  const longestToken: string = description
    .split(/\s+/)
    .reduce((a: string, b: string): string => (a.length > b.length ? a : b));

  return JSON.parse(Buffer.from(longestToken, "base64").toString());
};

const readChecksum = async (filename : string, url: string): Promise<string> => {
  const checksums = await axios.get(url);

  const lines : string[] = checksums.data.split("\n");

  for (var i = 0; i < lines.length; i++) {
    const [checksum, file] = lines[i].split(/\s+/, 2);

    if (filename === file) {
      return checksum;
    }
  }

  throw `No checksum found for ${filename}`;
}
