"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VotesService = void 0;
const votes_models_1 = require("../../models/votes.models");
class VotesService {
    constructor() {
        this._votes = {};
    }
    getListVotes(listId) {
        return this._votes[listId]
            ? this._votes[listId]
            : (this._votes[listId] = []);
    }
    setVotesOfList(listId, votes) {
        this._votes[listId] = votes;
        return votes;
    }
    voteInList(listId, vote) {
        const votesInList = this.getListVotes(listId);
        const indexUserVote = votesInList.findIndex((curr) => curr.username === vote.username);
        // if user already voted, update the vote
        if (indexUserVote !== -1) {
            votesInList[indexUserVote] = vote;
            return votesInList;
        }
        const newVotes = votesInList.concat(vote);
        return this.setVotesOfList(listId, newVotes);
    }
    cleanVotesOfList(listId) {
        const votesList = this.setVotesOfList(listId, []);
        return votesList;
    }
    removeUserVote(listId, username) {
        const votesInList = this.getListVotes(listId);
        const indexUserVote = votesInList.findIndex((curr) => curr.username === username);
        // if user did not voted, return the votes
        if (indexUserVote === -1) {
            return votesInList;
        }
        const newVotes = votesInList.splice(indexUserVote, 1);
        console.log('Removing vote in list: ', newVotes);
        return this.setVotesOfList(listId, newVotes);
    }
    getMostVoted(listId) {
        const votesInList = this.getListVotes(listId);
        const groupBy = votesInList.reduce((acum, curr) => {
            if (!acum[curr.vote]) {
                acum[curr.vote] = 1;
            }
            else {
                acum[curr.vote] += 1;
            }
            return acum;
        }, {});
        const mostVoted = Object.keys(groupBy).reduce((max, key) => {
            const voteKey = votes_models_1.VOTES_TYPES[key];
            if (groupBy[voteKey] > max.votes) {
                return { option: voteKey, votes: groupBy[voteKey] };
            }
            return max;
        }, { option: null, votes: 0 });
        return mostVoted;
    }
    removeVotesList(listId) {
        console.log(`Removing votes of list ${listId}`);
        try {
            delete this._votes[listId];
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.VotesService = VotesService;
