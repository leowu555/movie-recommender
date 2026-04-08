from unittest.mock import Mock, patch

from django.test import TestCase
from rest_framework.test import APIClient


class MoviesAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_search_movies_requires_query_param(self):
        response = self.client.get("/api/movies/search/")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {"error": "Query parameter is required"})

    @patch("movies.views.requests.get")
    def test_search_movies_returns_simplified_results(self, mock_get):
        tmdb_payload = {
            "results": [
                {
                    "id": 27205,
                    "title": "Inception",
                    "overview": "A mind-bending thriller.",
                    "poster_path": "/poster.jpg",
                    "release_date": "2010-07-16",
                    "vote_average": 8.4,
                }
            ]
        }
        mock_response = Mock(status_code=200)
        mock_response.json.return_value = tmdb_payload
        mock_get.return_value = mock_response

        response = self.client.get("/api/movies/search/?query=inception")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "results": [
                    {
                        "id": 27205,
                        "title": "Inception",
                        "overview": "A mind-bending thriller.",
                        "poster_url": "https://image.tmdb.org/t/p/w500/poster.jpg",
                        "release_date": "2010-07-16",
                        "vote_average": 8.4,
                    }
                ]
            },
        )

    @patch("movies.views.requests.get")
    def test_get_movie_details_returns_simplified_payload(self, mock_get):
        tmdb_payload = {
            "id": 27205,
            "title": "Inception",
            "overview": "A mind-bending thriller.",
            "release_date": "2010-07-16",
            "runtime": 148,
            "poster_path": "/poster.jpg",
            "genres": [{"id": 28, "name": "Action"}, {"id": 878, "name": "Sci-Fi"}],
        }
        mock_response = Mock(status_code=200)
        mock_response.json.return_value = tmdb_payload
        mock_get.return_value = mock_response

        response = self.client.get("/api/movies/27205/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "id": 27205,
                "title": "Inception",
                "overview": "A mind-bending thriller.",
                "release_date": "2010-07-16",
                "runtime": 148,
                "poster_url": "https://image.tmdb.org/t/p/w500/poster.jpg",
                "genres": ["Action", "Sci-Fi"],
            },
        )

    @patch("movies.views.requests.get")
    def test_get_movie_details_returns_404_when_tmdb_not_found(self, mock_get):
        mock_get.return_value = Mock(status_code=404)

        response = self.client.get("/api/movies/999999999/")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"error": "Movie not found"})
