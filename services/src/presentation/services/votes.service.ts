import {
  MostVotedModel,
  VOTES_TYPES,
  VotesModel,
} from '../../models/votes.models';

export class VotesService {
  private readonly _votes: Record<string, VotesModel[]> = {};

  constructor() {}

  public getListVotes(listId: string) {
    return this._votes[listId]
      ? this._votes[listId]
      : (this._votes[listId] = []);
  }

  private setVotesOfList(listId: string, votes: VotesModel[]): VotesModel[] {
    this._votes[listId] = votes;

    return votes;
  }

  public voteInList(listId: string, vote: VotesModel) {
    const votesInList = this.getListVotes(listId);

    const indexUserVote = votesInList.findIndex(
      (curr) => curr.username === vote.username
    );

    // if user already voted, update the vote
    if (indexUserVote !== -1) {
      votesInList[indexUserVote] = vote;

      return votesInList;
    }

    const newVotes: VotesModel[] = votesInList.concat(vote);

    return this.setVotesOfList(listId, newVotes);
  }

  public cleanVotesOfList(listId: string) {
    const votesList = this.setVotesOfList(listId, []);

    return votesList;
  }

  public removeUserVote(listId: string, username: string) {
    const votesInList = this.getListVotes(listId);

    const indexUserVote = votesInList.findIndex(
      (curr) => curr.username === username
    );

    // if user did not voted, return the votes
    if (indexUserVote === -1) {
      return votesInList;
    }

    const newVotes: VotesModel[] = votesInList.splice(indexUserVote, 1);

    console.log('Removing vote in list: ', newVotes);

    return this.setVotesOfList(listId, newVotes);
  }

  public getMostVoted(listId: string): MostVotedModel {
    const votesInList = this.getListVotes(listId);

    const groupBy = votesInList.reduce(
      (acum: Record<VOTES_TYPES, number>, curr: VotesModel) => {
        if (!acum[curr.vote]) {
          acum[curr.vote] = 1;
        } else {
          acum[curr.vote] += 1;
        }
        return acum;
      },
      {} as Record<VOTES_TYPES, number>
    );

    const mostVoted = (
      Object.keys(groupBy) as (keyof typeof VOTES_TYPES)[]
    ).reduce(
      (max: MostVotedModel, key: keyof typeof VOTES_TYPES) => {
        const voteKey = VOTES_TYPES[
          key as keyof typeof VOTES_TYPES
        ] as unknown as VOTES_TYPES;
        if (groupBy[voteKey] > max.votes) {
          return { option: voteKey, votes: groupBy[voteKey] };
        }
        return max;
      },
      { option: null, votes: 0 } as MostVotedModel
    );

    return mostVoted;
  }

  public removeVotesList(listId: string) {
    console.log(`Removing votes of list ${listId}`);
    try {
      delete this._votes[listId];

      return true;
    } catch (error) {
      return false;
    }
  }
}
