"""Seed alice, bob, and carol with overlapping ratings for local demos."""
from django.contrib.auth.models import User
from ratings.models import Rating

DEMO_MOVIES = [
    {'movie_id': 27205, 'title': 'Inception', 'poster_url': 'https://image.tmdb.org/t/p/w500/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg'},
    {'movie_id': 155, 'title': 'The Dark Knight', 'poster_url': 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'},
    {'movie_id': 157336, 'title': 'Interstellar', 'poster_url': 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'},
    {'movie_id': 496243, 'title': 'Parasite', 'poster_url': 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg'},
    {'movie_id': 680, 'title': 'Pulp Fiction', 'poster_url': 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg'},
    {'movie_id': 13, 'title': 'Forrest Gump', 'poster_url': 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxUjFRgtrVK5.jpg'},
    {'movie_id': 550, 'title': 'Fight Club', 'poster_url': 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg'},
    {'movie_id': 278, 'title': 'The Shawshank Redemption', 'poster_url': 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5twV7E.jpg'},
]

# username -> list of (movie_id, score)
USER_RATINGS = {
    'alice': [(27205, 5), (155, 5), (157336, 4), (550, 5), (278, 5)],
    'bob': [(27205, 5), (155, 4), (496243, 5), (680, 5), (13, 3)],
    'carol': [(157336, 5), (496243, 4), (278, 5), (13, 5), (680, 4)],
}

for username, ratings in USER_RATINGS.items():
    user, created = User.objects.get_or_create(username=username)
    if created:
        user.set_password('demo1234')
        user.email = f'{username}@example.com'
        user.save()
        print(f'Created user {username} / demo1234')
    else:
        print(f'User {username} already exists')

    for movie_id, score in ratings:
        movie = next(m for m in DEMO_MOVIES if m['movie_id'] == movie_id)
        Rating.objects.update_or_create(
            user=user,
            movie_id=movie_id,
            defaults={
                'title': movie['title'],
                'poster_url': movie['poster_url'],
                'score': score,
            },
        )

print('Demo ratings seeded.')
print('Login with alice/demo1234, bob/demo1234, or carol/demo1234')
