package engine

import (
	"log/slog"
	"strings"
)

type DefaultMatchingEngine struct{}

func NewDefaultMatchingEngine() *DefaultMatchingEngine {
	return &DefaultMatchingEngine{}
}

func (e *DefaultMatchingEngine) RankCandidates(target Profile, candidates []Profile) []MatchResult {
	return RankCandidates(target, candidates)
}

func (e *DefaultMatchingEngine) CalculateMatch(target, candidate Profile) (MatchResult, bool) {
	return CalculateMatch(target, candidate)
}

// NewMatchingEngine is a Manual Wiring Dependency Injection Factory
func NewMatchingEngine(engineType string) MatchingEngine {
	if engineType == "" {
		engineType = "jaccard"
	}

	slog.Info("🔌 [DI Container] Wiring Go MatchingEngine container", slog.String("engineType", strings.ToUpper(engineType)))

	switch strings.ToLower(engineType) {
	case "jaccard":
		fallthrough
	default:
		return NewDefaultMatchingEngine()
	}
}
