package engine

import (
	"log/slog"
	"math"
	"sort"
	"strings"
	"time"
)

const FILE_PATH = "engine/matcher.go"

type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	City      string  `json:"city"`
	Country   string  `json:"country"`
}

type UserPreferences struct {
	MinAge            int      `json:"minAge"`
	MaxAge            int      `json:"maxAge"`
	MaxDistanceKm     float64  `json:"maxDistanceKm"`
	PreferredGenders  []string `json:"preferredGenders"`
	RelationshipGoals []string `json:"relationshipGoals"`
}

type Photo struct {
	ID        string `json:"id"`
	UserID    string `json:"userId"`
	URL       string `json:"url"`
	IsPrimary bool   `json:"isPrimary"`
}

type Profile struct {
	ID                string          `json:"id"`
	UserID            string          `json:"userId"`
	Name              string          `json:"name"`
	Age               int             `json:"age"`
	Gender            string          `json:"gender"`
	City              string          `json:"city"`
	Location          Location        `json:"location"`
	Education         string          `json:"education"`
	Profession        string          `json:"profession"`
	RelationshipGoal  string          `json:"relationshipGoal"`
	Bio               string          `json:"bio"`
	Interests         []string        `json:"interests"`
	Languages         []string        `json:"languages"`
	Hobbies           []string        `json:"hobbies"`
	FoodPreferences   []string        `json:"foodPreferences"`
	MusicInterests    []string        `json:"musicInterests"`
	Photos            []Photo         `json:"photos"`
	Preferences       UserPreferences `json:"preferences"`
}

type JaccardBreakdown struct {
	Interests        float64 `json:"interests"`
	Languages        float64 `json:"languages"`
	Hobbies          float64 `json:"hobbies"`
	FoodPreferences  float64 `json:"foodPreferences"`
	MusicInterests   float64 `json:"musicInterests"`
	CompositeJaccard float64 `json:"compositeJaccard"`
}

type MatchResult struct {
	UserID           string           `json:"userId"`
	Name             string           `json:"name"`
	Age              int              `json:"age"`
	City             string           `json:"city"`
	Score            float64          `json:"score"`
	MatchPercentage  int              `json:"matchPercentage"`
	JaccardBreakdown JaccardBreakdown `json:"jaccardBreakdown"`
	DistanceKm       float64          `json:"distanceKm"`
}

// JaccardSimilarity calculates J(A, B) = |A ∩ B| / |A ∪ B|
func JaccardSimilarity(a, b []string) float64 {
	start := time.Now()
	slog.Debug("👉 [Fn ENTER] JaccardSimilarity",
		slog.String("fn", "JaccardSimilarity"),
		slog.String("file", FILE_PATH),
		slog.String("input_data_a", strings.Join(a, ",")),
		slog.String("input_data_b", strings.Join(b, ",")),
	)

	sim := calculateJaccardInternal(a, b)

	slog.Debug("👈 [Fn EXIT] JaccardSimilarity",
		slog.String("fn", "JaccardSimilarity"),
		slog.String("file", FILE_PATH),
		slog.Float64("result_similarity", sim),
		slog.Duration("duration", time.Since(start)),
	)
	return sim
}

func calculateJaccardInternal(a, b []string) float64 {
	if len(a) == 0 && len(b) == 0 {
		return 0.0
	}

	setA := make(map[string]bool)
	for _, item := range a {
		setA[strings.ToLower(strings.TrimSpace(item))] = true
	}

	intersectionCount := 0
	unionSet := make(map[string]bool)
	for k := range setA {
		unionSet[k] = true
	}

	for _, item := range b {
		normalized := strings.ToLower(strings.TrimSpace(item))
		unionSet[normalized] = true
		if setA[normalized] {
			intersectionCount++
		}
	}

	if len(unionSet) == 0 {
		return 0.0
	}

	return float64(intersectionCount) / float64(len(unionSet))
}

// HaversineDistance calculates distance in kilometers between two geo coordinates
func HaversineDistance(loc1, loc2 Location) float64 {
	start := time.Now()
	const earthRadiusKm = 6371.0

	dLat := (loc2.Latitude - loc1.Latitude) * math.Pi / 180.0
	dLon := (loc2.Longitude - loc1.Longitude) * math.Pi / 180.0

	lat1 := loc1.Latitude * math.Pi / 180.0
	lat2 := loc2.Latitude * math.Pi / 180.0

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Sin(dLon/2)*math.Sin(dLon/2)*math.Cos(lat1)*math.Cos(lat2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	dist := earthRadiusKm * c

	slog.Debug("👈 [Fn EXIT] HaversineDistance",
		slog.String("fn", "HaversineDistance"),
		slog.String("file", FILE_PATH),
		slog.Float64("result_distance_km", dist),
		slog.Duration("duration", time.Since(start)),
	)
	return dist
}

// CalculateMatch evaluates candidate against target user profile
func CalculateMatch(target, candidate Profile) (MatchResult, bool) {
	start := time.Now()
	slog.Info("👉 [Fn ENTER] CalculateMatch",
		slog.String("fn", "CalculateMatch"),
		slog.String("file", FILE_PATH),
		slog.Group("target_data",
			slog.String("user_id", target.UserID),
			slog.String("name", target.Name),
			slog.Int("age", target.Age),
			slog.String("city", target.City),
		),
		slog.Group("candidate_data",
			slog.String("user_id", candidate.UserID),
			slog.String("name", candidate.Name),
			slog.Int("age", candidate.Age),
			slog.String("city", candidate.City),
		),
	)

	if target.UserID == candidate.UserID {
		return MatchResult{}, false
	}

	// 1. HARD FILTERS
	if candidate.Age < target.Preferences.MinAge || candidate.Age > target.Preferences.MaxAge {
		slog.Info("👈 [Fn EXIT] CalculateMatch (Filtered out by age)", slog.String("reason", "AGE_OUT_OF_BOUNDS"))
		return MatchResult{}, false
	}

	genderMatch := false
	for _, prefGender := range target.Preferences.PreferredGenders {
		if strings.EqualFold(prefGender, candidate.Gender) {
			genderMatch = true
			break
		}
	}
	if !genderMatch && len(target.Preferences.PreferredGenders) > 0 {
		slog.Info("👈 [Fn EXIT] CalculateMatch (Filtered out by gender)", slog.String("reason", "GENDER_MISMATCH"))
		return MatchResult{}, false
	}

	distance := HaversineDistance(target.Location, candidate.Location)
	if target.Preferences.MaxDistanceKm > 0 && distance > target.Preferences.MaxDistanceKm {
		slog.Info("👈 [Fn EXIT] CalculateMatch (Filtered out by distance)", slog.Float64("distance_km", distance))
		return MatchResult{}, false
	}

	// 2. JACCARD SIMILARITY CALCULATIONS
	jInterests := JaccardSimilarity(target.Interests, candidate.Interests)
	jLanguages := JaccardSimilarity(target.Languages, candidate.Languages)
	jHobbies := JaccardSimilarity(target.Hobbies, candidate.Hobbies)
	jFood := JaccardSimilarity(target.FoodPreferences, candidate.FoodPreferences)
	jMusic := JaccardSimilarity(target.MusicInterests, candidate.MusicInterests)

	compositeJaccard := jInterests*0.30 + jLanguages*0.20 + jHobbies*0.20 + jFood*0.15 + jMusic*0.15

	// 3. FEATURE SCORES
	maxDist := target.Preferences.MaxDistanceKm
	if maxDist <= 0 {
		maxDist = 100.0
	}
	distanceScore := math.Max(0.0, 1.0-(distance/maxDist))

	ageDiff := math.Abs(float64(target.Age - candidate.Age))
	ageScore := math.Max(0.0, 1.0-(ageDiff*0.05))

	goalScore := 0.5
	if strings.EqualFold(target.RelationshipGoal, candidate.RelationshipGoal) {
		goalScore = 1.0
	}

	educationScore := 0.5
	if strings.EqualFold(target.Education, candidate.Education) && target.Education != "" {
		educationScore = 1.0
	}

	// 4. COMPOSITE WEIGHTED SCORE
	finalScore := compositeJaccard*0.35 + ageScore*0.15 + distanceScore*0.20 + goalScore*0.20 + educationScore*0.10
	finalScore = math.Max(0.0, math.Min(1.0, finalScore))
	matchPercentage := int(math.Round(finalScore * 100))

	result := MatchResult{
		UserID:          candidate.UserID,
		Name:            candidate.Name,
		Age:             candidate.Age,
		City:            candidate.City,
		Score:           finalScore,
		MatchPercentage: matchPercentage,
		JaccardBreakdown: JaccardBreakdown{
			Interests:        jInterests,
			Languages:        jLanguages,
			Hobbies:          jHobbies,
			FoodPreferences:  jFood,
			MusicInterests:   jMusic,
			CompositeJaccard: compositeJaccard,
		},
		DistanceKm: math.Round(distance*10) / 10,
	}

	slog.Info("👈 [Fn EXIT] CalculateMatch (Match computed)",
		slog.String("fn", "CalculateMatch"),
		slog.String("file", FILE_PATH),
		slog.Group("result_data",
			slog.String("candidate_id", candidate.UserID),
			slog.Float64("score", finalScore),
			slog.Int("match_percentage", matchPercentage),
			slog.Float64("jaccard_composite", compositeJaccard),
			slog.Float64("distance_km", distance),
		),
		slog.Duration("duration", time.Since(start)),
	)

	return result, true
}

// RankCandidates filters and ranks all candidate profiles for target user
func RankCandidates(target Profile, candidates []Profile) []MatchResult {
	start := time.Now()
	slog.Info("👉 [Fn ENTER] RankCandidates",
		slog.String("fn", "RankCandidates"),
		slog.String("file", FILE_PATH),
		slog.String("target_user_id", target.UserID),
		slog.Int("candidate_count", len(candidates)),
	)

	var results []MatchResult

	for _, cand := range candidates {
		if res, pass := CalculateMatch(target, cand); pass {
			results = append(results, res)
		}
	}

	sort.Slice(results, func(i, j int) bool {
		return results[i].Score > results[j].Score
	})

	slog.Info("👈 [Fn EXIT] RankCandidates",
		slog.String("fn", "RankCandidates"),
		slog.String("file", FILE_PATH),
		slog.Int("total_candidates_processed", len(candidates)),
		slog.Int("qualified_matches_ranked", len(results)),
		slog.Duration("duration", time.Since(start)),
	)

	return results
}
