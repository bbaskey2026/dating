package engine

import (
	"math"
	"testing"
)

func TestJaccardSimilarity(t *testing.T) {
	userA := []string{"Music", "Travel", "Cricket", "Movies"}
	userB := []string{"Music", "Travel", "Football", "Movies"}

	similarity := JaccardSimilarity(userA, userB)
	expected := 3.0 / 5.0

	if math.Abs(similarity-expected) > 0.0001 {
		t.Errorf("Expected Jaccard similarity %f, got %f", expected, similarity)
	}
}

func TestHaversineDistance(t *testing.T) {
	ranchi := Location{Latitude: 23.3441, Longitude: 85.3096, City: "Ranchi"}
	jamshedpur := Location{Latitude: 22.8046, Longitude: 86.2029, City: "Jamshedpur"}

	dist := HaversineDistance(ranchi, jamshedpur)
	if dist < 90.0 || dist > 130.0 {
		t.Errorf("Expected distance between Ranchi and Jamshedpur ~108km, got %f", dist)
	}
}

func TestCalculateMatch(t *testing.T) {
	target := Profile{
		ID:               "p1",
		UserID:           "u1",
		Name:             "Bhima",
		Age:              25,
		Gender:           "male",
		City:             "Ranchi",
		Location:         Location{Latitude: 23.3441, Longitude: 85.3096},
		Education:        "B.Tech",
		RelationshipGoal: "marriage",
		Interests:        []string{"music", "travel", "coding", "movies"},
		Languages:        []string{"Hindi", "English"},
		Preferences: UserPreferences{
			MinAge:            20,
			MaxAge:            30,
			MaxDistanceKm:     150,
			PreferredGenders:  []string{"female"},
			RelationshipGoals: []string{"marriage"},
		},
	}

	candidate := Profile{
		ID:               "p2",
		UserID:           "u2",
		Name:             "Ananya",
		Age:              24,
		Gender:           "female",
		City:             "Ranchi",
		Location:         Location{Latitude: 23.3500, Longitude: 85.3200},
		Education:        "B.Tech",
		RelationshipGoal: "marriage",
		Interests:        []string{"music", "travel", "reading", "movies"},
		Languages:        []string{"Hindi", "English"},
	}

	res, pass := CalculateMatch(target, candidate)
	if !pass {
		t.Fatalf("Expected candidate to pass matching filters")
	}

	if res.MatchPercentage < 70 {
		t.Errorf("Expected high match percentage (>70%%), got %d%%", res.MatchPercentage)
	}

	expectedJaccard := 3.0 / 5.0
	if math.Abs(res.JaccardBreakdown.Interests-expectedJaccard) > 0.0001 {
		t.Errorf("Expected interest Jaccard %f, got %f", expectedJaccard, res.JaccardBreakdown.Interests)
	}
}
