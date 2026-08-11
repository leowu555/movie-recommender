from django.contrib import admin

from ratings.models import Rating


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('user', 'movie_id', 'title', 'score', 'updated_at')
    list_filter = ('score',)
    search_fields = ('title', 'user__username')
