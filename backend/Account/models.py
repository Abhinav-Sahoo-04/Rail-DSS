from django.db import models

# Create your models here.
class User(models.Model):
    username=models.CharField(max_length=100)
    password=models.CharField(max_length=100)
    is_active=models.BooleanField(default=False)

    def __str__(self):
        return f"username : {self.username}"