import numpy as np
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from sklearn.metrics.pairwise import cosine_similarity

from ratings.models import Rating


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommend_movies(request):
    """
    User-based collaborative filtering:
    1) Build a user-movie rating matrix
    2) Find similar users with cosine similarity
    3) Recommend highly rated movies from similar users
    Falls back to the current user's top-rated titles if data is sparse.
    """
    all_ratings = list(
        Rating.objects.select_related('user').values('user_id', 'movie_id', 'title', 'poster_url', 'score')
    )

    if not all_ratings:
        return Response(
            {
                'results': [],
                'method': 'empty',
                'message': 'Rate some movies first to get recommendations.',
            }
        )

    user_ids = sorted({r['user_id'] for r in all_ratings})
    movie_ids = sorted({r['movie_id'] for r in all_ratings})
    user_index = {uid: i for i, uid in enumerate(user_ids)}
    movie_index = {mid: i for i, mid in enumerate(movie_ids)}

    matrix = np.zeros((len(user_ids), len(movie_ids)))
    movie_meta = {}

    for rating in all_ratings:
        ui = user_index[rating['user_id']]
        mi = movie_index[rating['movie_id']]
        matrix[ui, mi] = rating['score']
        movie_meta[rating['movie_id']] = {
            'movie_id': rating['movie_id'],
            'title': rating['title'],
            'poster_url': rating['poster_url'],
        }

    current_user_id = request.user.id
    if current_user_id not in user_index:
        return Response(
            {
                'results': [],
                'method': 'empty',
                'message': 'Rate some movies first to get recommendations.',
            }
        )

    current_idx = user_index[current_user_id]
    user_rated = set(
        Rating.objects.filter(user=request.user).values_list('movie_id', flat=True)
    )

    # Need at least 2 users for collaborative filtering
    if len(user_ids) < 2:
        fallback = (
            Rating.objects.filter(user=request.user)
            .order_by('-score', '-updated_at')[:5]
        )
        results = [
            {
                'movie_id': r.movie_id,
                'title': r.title,
                'poster_url': r.poster_url,
                'score': r.score,
                'reason': 'Based on your highest ratings (need more users for CF)',
            }
            for r in fallback
        ]
        return Response({'results': results, 'method': 'fallback_self'})

    similarities = cosine_similarity(matrix)
    similar_scores = similarities[current_idx]
    similar_scores[current_idx] = -1  # ignore self

    # Top similar users
    top_similar = np.argsort(similar_scores)[::-1][:5]
    recommendations = {}

    for other_idx in top_similar:
        sim = similar_scores[other_idx]
        if sim <= 0:
            continue
        for mi, score in enumerate(matrix[other_idx]):
            if score < 4:
                continue
            movie_id = movie_ids[mi]
            if movie_id in user_rated:
                continue
            weighted = sim * score
            if movie_id not in recommendations or weighted > recommendations[movie_id]['weight']:
                meta = movie_meta[movie_id]
                recommendations[movie_id] = {
                    'movie_id': movie_id,
                    'title': meta['title'],
                    'poster_url': meta['poster_url'],
                    'predicted_score': round(float(score), 2),
                    'weight': float(weighted),
                    'reason': 'Users with similar taste also liked this',
                }

    ranked = sorted(
        recommendations.values(),
        key=lambda item: item['weight'],
        reverse=True,
    )[:10]

    for item in ranked:
        item.pop('weight', None)

    if not ranked:
        fallback = (
            Rating.objects.exclude(user=request.user)
            .values('movie_id', 'title', 'poster_url')
            .distinct()[:5]
        )
        ranked = [
            {
                **movie,
                'reason': 'Popular among other users (sparse overlap)',
            }
            for movie in fallback
            if movie['movie_id'] not in user_rated
        ]
        return Response({'results': ranked, 'method': 'fallback_popular'})

    return Response({'results': ranked, 'method': 'collaborative_filtering'})
