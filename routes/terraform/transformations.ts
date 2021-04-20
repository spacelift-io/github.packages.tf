import axios from "axios";
import { userInfo } from "os";

import * as gh from "../github/types";
import * as tf from "./types";

export const isReleaseReady = (release: gh.ListReleasesItem) : boolean => {
    return !release.isDraft && !release.isPrerelease
}

export const releaseItemToVersion = (release: gh.ListReleasesItem): tf.Version => {
  let platforms: tf.Platform[] = [];

  release.releaseAssets.nodes.forEach(({ filename }) => {
    if (!filename.endsWith(".zip")) {
      return;
    }

    const [, , os, arch] = filename.replace(/\.zip$/, "").split("_");

    platforms.push({ os, arch });
  });

  return {
    platforms,
    protocols: protcols(release.tagCommit),
    version: release.name.replace(/^v/, ""),
  };
};

export const releaseDetailsToPackage = async (os: string, arch: string, details: gh.ShowReleaseDetails): Promise<tf.Package> => {
  const downloadAssets = details.download.nodes;
  if (downloadAssets.length !== 1) {
    throw `No packagage found for ${os}/${arch}`;
  }
  const filename = downloadAssets[0].name;

  const aciiArmorAssets = details.asciiArmor.nodes;
  if (aciiArmorAssets.length !== 1) {
    throw `No key.asc file found for the package`;
  }

  const fingerprintAssets = details.fingerprint.nodes;
  if (fingerprintAssets.length !== 1) {
    throw `No key.fingerprint file found for the package`;
  }

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
    protocols: protcols(details.tagCommit),
    os,
    arch,
    filename,
    download_url: downloadAssets[0].url,
    shasums_url: shasumsAssets[0].url,
    shasums_signature_url: signatureAssets[0].url,
    shasum: await readChecksum(filename, shasumsUrl),
    signing_keys: {
      gpg_public_keys: [{
        ascii_armor: (await axios.get(aciiArmorAssets[0].url)).data.trim(),
        key_id: (await axios.get(fingerprintAssets[0].url)).data.trim(),
      }],
    }
  }

  return tfPackage;
}

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

const protcols = (tagCommit: gh.ProtocolsContent): string[] => {
  return tagCommit.protocols.object.text.trim().split(/\s+/);
}
