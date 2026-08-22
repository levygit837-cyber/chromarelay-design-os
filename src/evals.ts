import { randomInt } from "node:crypto";

export interface PairwiseCandidate<T> {
  id: string;
  payload: T;
}

export interface BlindPair<T> {
  left: PairwiseCandidate<T>;
  right: PairwiseCandidate<T>;
  key: Record<"left" | "right", string>;
}

export interface PairwiseVote {
  winner: "left" | "right" | "tie";
  confidence: "low" | "medium" | "high";
  reasons: string[];
}

export function createBlindPair<T>(a: PairwiseCandidate<T>, b: PairwiseCandidate<T>, swap = randomInt(2) === 1): BlindPair<T> {
  const left = swap ? b : a;
  const right = swap ? a : b;
  return { left: { id: "A", payload: left.payload }, right: { id: "B", payload: right.payload }, key: { left: left.id, right: right.id } };
}

export function revealWinner<T>(pair: BlindPair<T>, vote: PairwiseVote): string | "tie" {
  if (vote.winner === "tie") return "tie";
  return pair.key[vote.winner];
}

export function aggregateVotes(winners: Array<string | "tie">): { counts: Record<string, number>; ties: number; winner?: string } {
  const counts: Record<string, number> = {};
  let ties = 0;
  for (const winner of winners) {
    if (winner === "tie") ties += 1;
    else counts[winner] = (counts[winner] ?? 0) + 1;
  }
  const ordered = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const first = ordered[0];
  const second = ordered[1];
  const clearWinner = first && (!second || first[1] > second[1]) ? first[0] : undefined;
  return { counts, ties, ...(clearWinner ? { winner: clearWinner } : {}) };
}
