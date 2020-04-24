export type AddURIResponse = string;

export interface URI {
  status: string;
  uri: string;
}

export interface File {
  completedLength: string;
  index: string;
  length: string;
  path: string;
  selected: string;
  uris: URI[];
}

export interface Bittorrent {
  announceList: string[][];
}

export interface Task {
  bitfield: string;
  completedLength: string;
  connections: string;
  dir: string;
  downloadSpeed: string;
  errorCode: string;
  errorMessage: string;
  files: File[];
  gid: string;
  numPieces: string;
  pieceLength: string;
  status: string;
  totalLength: string;
  uploadLength: string;
  uploadSpeed: string;
  bittorrent: Bittorrent;
  infoHash: string;
  numSeeders: string;
}
