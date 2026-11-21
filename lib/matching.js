const TRAITS = ["sleep", "clean", "guests", "noise", "study", "budget"];

const TRAIT_LABELS = {
  sleep: "sleep schedules",
  clean: "cleanliness",
  guests: "having guests over",
  noise: "noise levels",
  study: "studying at home",
  budget: "budget",
};

const clamp = (val, min = 0, max = 1) => Math.max(min, Math.min(max, val));
const lerp = (start, end, rate) => clamp(start + (end - start) * rate);

export function initState() {
  return {
    traits: { sleep: 0.5, clean: 0.5, guests: 0.5, noise: 0.5, study: 0.5, budget: 0.5 },
    weights: { sleep: 0.5, clean: 0.5, guests: 0.5, noise: 0.5, study: 0.5, budget: 0.5 },
    answered: { sleep: 0, clean: 0, guests: 0, noise: 0, study: 0, budget: 0 },
    dealbreakers: [],
    swipedIds: [],
  };
}

export function scoreProfile(state, profile) {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const t of TRAITS) {
    const w = state.weights[t] ?? 0.5;
    const diff = Math.abs(state.traits[t] - profile.traits[t]);
    weightedSum += w * (1 - diff);
    totalWeight += w;
  }

  if (totalWeight === 0) return 50;
  return Math.round((weightedSum / totalWeight) * 100);
}

export function isMatch(profile, direction) {
  if (!profile || profile.type !== "profile") return false;
  return (direction === "right" || direction === "up") && profile.likesYou === true;
}

export function applySwipe(state, card, direction) {
  const next = {
    traits: { ...state.traits },
    weights: { ...state.weights },
    answered: { ...state.answered },
    dealbreakers: [...state.dealbreakers],
    swipedIds: [...state.swipedIds, card.id],
  };

  let toast = "";

  if (card.type === "scenario") {
    const { trait, rightValue } = card;
    const label = TRAIT_LABELS[trait] || trait;
    const oppositeValue = 1 - rightValue;

    if (direction === "right") {
      next.traits[trait] = lerp(next.traits[trait], rightValue, 0.6);
      next.weights[trait] = clamp(next.weights[trait] + 0.15);
      toast = `Noted — you're cool with that for ${label}.`;
    } else if (direction === "left") {
      next.traits[trait] = lerp(next.traits[trait], oppositeValue, 0.6);
      next.weights[trait] = clamp(next.weights[trait] + 0.15);
      toast = `Got it — we'll steer clear of that for ${label}.`;
    } else if (direction === "up") {
      // Strong shift away + max weight + dealbreaker
      next.traits[trait] = lerp(next.traits[trait], oppositeValue, 0.85);
      next.weights[trait] = 1;
      if (!next.dealbreakers.includes(trait)) {
        next.dealbreakers.push(trait);
      }
      toast = `Dealbreaker set! Filtering out bad matches for ${label}.`;
    } else if (direction === "down") {
      next.weights[trait] = clamp(next.weights[trait] - 0.3, 0.1, 1);
      toast = `No worries — ${label} won't weigh much on your matches.`;
    }

    next.answered[trait] = (next.answered[trait] || 0) + 1;
  } else if (card.type === "profile") {
    const lr = 0.08; // Tiny learning rate for profile swipes

    if (direction === "right" || direction === "up") {
      for (const t of TRAITS) {
        next.traits[t] = lerp(next.traits[t], card.traits[t], lr);
      }
      toast =
        direction === "up"
          ? `Super liked ${card.name}! Tuning your deck to similar vibes.`
          : `Liked ${card.name} — adjusting your match weights.`;
    } else if (direction === "left") {
      for (const t of TRAITS) {
        // Nudge slightly away from this profile's traits
        const awayTarget = card.traits[t] > 0.5 ? 0 : 1;
        next.traits[t] = lerp(next.traits[t], awayTarget, lr * 0.5);
      }
      toast = `Passed on ${card.name} — updating your rankings.`;
    } else if (direction === "down") {
      toast = `Skipped ${card.name} for now.`;
    }
  }

  return { state: next, toast };
}

export function buildDeck(state, profiles, scenarios) {
  const swipedSet = new Set(state.swipedIds);

  // 1. Filter out swiped profiles and dealbreaker violations (> 0.5 diff)
  const validProfiles = profiles.filter((p) => {
    if (swipedSet.has(p.id)) return false;

    for (const dbTrait of state.dealbreakers) {
      if (Math.abs(state.traits[dbTrait] - p.traits[dbTrait]) > 0.5) {
        return false;
      }
    }
    return true;
  });

  // 2. Sort remaining profiles by compatibility score descending
  const rankedProfiles = validProfiles
    .map((p) => ({ ...p, _score: scoreProfile(state, p) }))
    .sort((a, b) => b._score - a._score)
    .map(({ _score, ...p }) => p);

  // 3. Pick unswiped scenarios prioritized by lowest `answered[trait]` count
  const availableScenarios = scenarios.filter((s) => !swipedSet.has(s.id));
  const sortedScenarios = [...availableScenarios].sort((a, b) => {
    const countA = state.answered[a.trait] || 0;
    const countB = state.answered[b.trait] || 0;
    return countA - countB;
  });

  // 4. Interleave: scenario at index 0, then every 3rd card (after every 2 profiles)
  const deck = [];
  let pIdx = 0;
  let sIdx = 0;

  while (pIdx < rankedProfiles.length || sIdx < sortedScenarios.length) {
    if (deck.length % 3 === 0 && sIdx < sortedScenarios.length) {
      deck.push(sortedScenarios[sIdx++]);
    } else if (pIdx < rankedProfiles.length) {
      deck.push(rankedProfiles[pIdx++]);
    } else {
      deck.push(sortedScenarios[sIdx++]);
    }
  }

  return deck;
}
