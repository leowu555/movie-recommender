from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.serializers import RatingSerializer
from ratings.models import Rating


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def ratings_list_create(request):
    if request.method == 'GET':
        ratings = Rating.objects.filter(user=request.user)
        return Response({'results': RatingSerializer(ratings, many=True).data})

    serializer = RatingSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    rating, _ = Rating.objects.update_or_create(
        user=request.user,
        movie_id=serializer.validated_data['movie_id'],
        defaults={
            'title': serializer.validated_data.get('title', ''),
            'poster_url': serializer.validated_data.get('poster_url'),
            'score': serializer.validated_data['score'],
        },
    )
    return Response(RatingSerializer(rating).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def rating_detail(request, movie_id):
    try:
        rating = Rating.objects.get(user=request.user, movie_id=movie_id)
    except Rating.DoesNotExist:
        if request.method == 'GET':
            return Response({'rated': False})
        return Response({'error': 'Rating not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        data = RatingSerializer(rating).data
        data['rated'] = True
        return Response(data)

    rating.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
