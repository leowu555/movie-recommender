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

    try:
        response = requests.get(url, params=params)

        if response.status_code != 200:
            return Response(
                {"error": "Failed to fetch data from TMDB"},
                status=500
            )

        data = response.json()

    except Exception as e:
        return Response(
            {"error": "Something went wrong while fetching movies"},
            status=500
    )

    movies = []
    for movie in data.get("results", []):
        poster_path = movie.get("poster_path")

        full_poster_url = None
        if poster_path:
            full_poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}"

        movies.append({
            "id": movie.get("id"),
            "title": movie.get("title"),
            "overview": movie.get("overview"),
            "poster_url": full_poster_url,
            "release_date": movie.get("release_date"),
            "vote_average": movie.get("vote_average"),
        })

    return Response({"results": movies})


@api_view(['GET'])
def get_movie_details(request, movie_id):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}"
    params = {"api_key": TMDB_API_KEY}

    try:
        response = requests.get(url, params=params)

        if response.status_code == 404:
            return Response({"error": "Movie not found"}, status=404)

        if response.status_code != 200:
            return Response(
                {"error": "Failed to fetch movie details from TMDB"},
                status=500
            )

        movie = response.json()

    except Exception:
        return Response(
            {"error": "Something went wrong while fetching movie details"},
            status=500
        )

    poster_path = movie.get("poster_path")
    poster_url = (
        f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None
    )

    genres = [genre.get("name") for genre in movie.get("genres", [])]

    return Response({
        "id": movie.get("id"),
        "title": movie.get("title"),
        "overview": movie.get("overview"),
        "release_date": movie.get("release_date"),
        "runtime": movie.get("runtime"),
        "poster_url": poster_url,
        "genres": genres,
    })