from django.shortcuts import render

from .models import Pokemon


def index(request, pokemon_number):
    pokemon = Pokemon.objects.get(number=pokemon_number)

    return render(request, 'pokemon_recommendation/recommendations.html', {
        "pokemon": pokemon
    })
