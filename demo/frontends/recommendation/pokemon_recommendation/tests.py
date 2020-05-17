from django.test import TestCase
from django.urls import reverse

from .models import Pokemon


pokemon1 = Pokemon(**{
    "number": 1,
    "name": "Bulbasaur",
    "primary_type": "Grass",
    "secondary_type": "Poison",
    "price": 318,
    "hp": 45,
    "attack": 49,
    "defense": 49,
    "sp_atk": 65,
    "sp_def": 65,
    "speed": 45,
    "generation": 1,
    "legendary": False
})

pokemon2 = Pokemon(**{
    "number": 2,
    "name": "Ivysaur",
    "primary_type": "Grass",
    "secondary_type": "Poison",
    "price": 405,
    "hp": 60,
    "attack": 62,
    "defense": 63,
    "sp_atk": 80,
    "sp_def": 80,
    "speed": 60,
    "generation": 1,
    "legendary": False
})

pokemon3 = Pokemon(**{
    "number": 5,
    "name": "Charmeleon",
    "primary_type": "Fire",
    "secondary_type": "",
    "price": 405,
    "hp": 58,
    "attack": 64,
    "defense": 58,
    "sp_atk": 80,
    "sp_def": 65,
    "speed": 80,
    "generation": 1,
    "legendary": False
})


class FetchRecommendations(TestCase):
    def setUp(self):
        pokemon1.save()
        pokemon2.save()
        pokemon3.save()

    def test_does_not_returns_itself(self):
        self.assertFalse(pokemon1 in pokemon1.recommendations)


class RecommendationViewHappyPathTest(TestCase):
    def setUp(self):
        pokemon1.save()
        pokemon2.save()
        pokemon3.save()

        self.response = self.client.get(reverse('recommendation', kwargs={"pokemon_number": 1}))

    def test_pokemon_name_is_present(self):
        self.assertContains(self.response, "Recommendations for Bulbasaur")

    def test_pokemon_with_same_primary_type_are_present(self):
        self.assertContains(self.response, "Ivysaur")
        self.assertNotContains(self.response, "Charmeleon")

    def test_list_recommendation_prices(self):
        self.assertContains(self.response, "$405")

