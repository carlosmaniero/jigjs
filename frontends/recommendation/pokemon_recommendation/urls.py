from django.urls import path

from . import views

urlpatterns = [
    path('<int:pokemon_number>', views.index, name='recommendation'),
]
