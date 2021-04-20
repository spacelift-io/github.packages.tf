export declare type ListReleasesResponse = {
  repository: {
    releases: {
      nodes: ListReleasesItem[];
    };
  };
};

export declare type ListReleasesItem = {
  name: string;
  isDraft: boolean;
  isPrerelease: boolean;
  releaseAssets: {
    nodes: {
      filename: string;
    }[];
  };
  tagCommit: ProtocolsContent;
};

export declare type ShowReleaseResponse = {
  repository: {
    release: ShowReleaseDetails;
  };
};

export declare type ShowReleaseDetails = {
  asciiArmor: ShowReleaseAsset;
  download: ShowReleaseAsset;
  fingerprint: ShowReleaseAsset;
  shasums: ShowReleaseAsset;
  signature: ShowReleaseAsset;
  tagCommit: ProtocolsContent;
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
  };
};

export declare type ProtocolsContent = {
  protocols: {
    object: {
      text: string;
    }
  }
};
