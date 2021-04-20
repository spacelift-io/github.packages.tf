import { gql } from "graphql-request";

export const LIST_RELEASES = gql`
  query ListReleases($account: String!, $repo: String!) {
    repository(owner: $account, name: $repo) {
      releases(first: 100, orderBy: { field: CREATED_AT, direction: DESC }) {
        nodes {
          name
          isDraft
          isPrerelease
          releaseAssets(first: 100) {
            nodes {
              filename: name
            }
          }
          tagCommit {
            protocols: file(path: "PROTOCOLS") {
              object {
                ... on Blob {
                  text
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const SHOW_RELEASE = gql`
  query ShowRelease(
    $account: String!
    $repo: String!
    $tag: String!
    $download: String!
    $shasums: String
    $signature: String!
  ) {
    repository(owner: $account, name: $repo) {
      release(tagName: $tag) {
        asciiArmor: releaseAssets(first: 1, name: "key.asc") {
          ...fileData
        }
        download: releaseAssets(first: 1, name: $download) {
          ...fileData
        }
        fingerprint: releaseAssets(first: 1, name: "key.fingerprint") {
          ...fileData
        }
        shasums: releaseAssets(first: 1, name: $shasums) {
          ...fileData
        }
        signature: releaseAssets(first: 1, name: $signature) {
          ...fileData
        }
        tagCommit {
          protocols: file(path: "PROTOCOLS") {
            object {
              ... on Blob {
                text
              }
            }
          }
        }
      }
    }
  }

  fragment fileData on ReleaseAssetConnection {
    nodes {
      name
      url
    }
  }
`;
