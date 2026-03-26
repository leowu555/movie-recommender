import os
import requests
from dotenv import load_dotenv
from rest_framework.decorators import api_view
from rest_framework.response import Response

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")


@api_view(['GET'])
def search_movies(request):
    query = request.GET.get('query', '')

    if not query:
        return Response({"error": "Query parameter is required"}, status=400)

    url = "https://api.themoviedb.org/3/search/movie"
    params = {
        "api_key": TMDB_API_KEY,
        "query": query
    }

    response = requests.get(url, params=params)
    data = response.json()

    movies = []
    for movie in data.get("results", []):
        movies.append({
            "id": movie.get("id"),
            "title": movie.get("title"),
            "overview": movie.get("overview"),
            "poster_path": movie.get("poster_path"),
            "release_date": movie.get("release_date"),
            "vote_average": movie.get("vote_average"),
        })

    return Response({"results": movies})