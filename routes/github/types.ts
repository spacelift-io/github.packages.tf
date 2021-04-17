export declare type ListReleasesResponse = {
  repository: {
    releases: {
      nodes: ListReleasesItem[];
    };
  };
};

export declare type ListReleasesItem = {
  name: string;
  description: string;
  isDraft: boolean;
  isPrerelease: boolean;
  releaseAssets: {
    nodes: {
      filename: string;
    }[];
  };
};

export declare type ShowReleaseResponse = {
  repository: {
    release: ShowReleaseDetails;
  };
};

export declare type ShowReleaseDetails = {
  description: string;
  download: ShowReleaseAsset;
  shasums: ShowReleaseAsset;
  signature: ShowReleaseAsset;
};

export declare type ShowReleaseAsset = {
  nodes: {
    name: string;
    url: string;
  }[];
};

export declare type ReleaseDescription = {
  protocols: string[];
  key: {
    key_id: string;
    ascii_armor: string;
    source: string | undefined;
    source_url: string | undefined;
    trust_signature: string | undefined;
  };
};
