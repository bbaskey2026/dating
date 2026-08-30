package engine

type MatchingEngine interface {
	RankCandidates(target Profile, candidates []Profile) []MatchResult
	CalculateMatch(target, candidate Profile) (MatchResult, bool)
}
