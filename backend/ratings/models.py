from django.conf import settings
from django.db import models


class Rating(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ratings',
    )
    movie_id = models.PositiveIntegerField()
    title = models.CharField(max_length=255, blank=True)
    poster_url = models.URLField(blank=True, null=True)
    score = models.PositiveSmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'movie_id')
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.user_id}:{self.movie_id}={self.score}'
