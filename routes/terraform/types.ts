export declare type Package = {
  protocols: string[];
  os: string;
  arch: string;
  filename: string;
  download_url: string;
  shasums_url: string;
  shasums_signature_url: string;
  shasum: string;
  signing_keys: {
    gpg_public_keys: {
      key_id: string;
      ascii_armor: string;
      source: string | undefined;
      source_url: string | undefined;
      trust_signature: string | undefined;
    }[]
  }
}

export declare type Platform = {
  os: string;
  arch: string;
}

export declare type Version = {
  version: string;
  protocols: string[];
  platforms: Platform[];
}
