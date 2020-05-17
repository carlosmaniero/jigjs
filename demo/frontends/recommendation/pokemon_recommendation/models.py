from django.db import models


class Pokemon(models.Model):
    number = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=60)
    primary_type = models.CharField(max_length=60)
    secondary_type = models.CharField(max_length=60)
    price = models.IntegerField()
    hp = models.IntegerField()
    attack = models.IntegerField()
    defense = models.IntegerField()
    sp_atk = models.IntegerField()
    sp_def = models.IntegerField()
    speed = models.IntegerField()
    generation = models.IntegerField()
    legendary = models.BooleanField()

    @property
    def recommendations(self):
        return Pokemon.objects.filter(
            primary_type=self.primary_type
        ).exclude(
            number=self.number
        )[:5]
