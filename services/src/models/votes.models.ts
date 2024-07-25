export enum VOTES_TYPES {
  REPEAT,
  NEXT,
}

export interface VotesModel {
  vote: VOTES_TYPES;
  username: string;
}

export interface MostVotedModel {
  option: VOTES_TYPES | null;
  votes: number;
}
