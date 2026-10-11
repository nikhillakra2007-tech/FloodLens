from app.services.investigation.mechanisms import MechanismScore


def rank_mechanisms(scores: list[MechanismScore]) -> list[MechanismScore]:
    sorted_scores = sorted(scores, key=lambda m: (m.score, m.confidence), reverse=True)
    for i, m in enumerate(sorted_scores):
        m.rank = i + 1
    return sorted_scores


def get_strongest_mechanism(scores: list[MechanismScore]) -> MechanismScore | None:
    if not scores:
        return None
    ranked = rank_mechanisms(scores)
    if ranked[0].score <= 0.1:
        return None
    return ranked[0]

