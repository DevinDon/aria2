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

export interface Task {
  bitfield: string;
  completedLength: string;
  connections: string;
  dir: string;
  downloadSpeed: string;
  files: File[];
  gid: string;
  numPieces: string;
  pieceLength: string;
  status: string;
  totalLength: string;
  uploadLength: string;
  uploadSpeed: string;
}
