from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet 
from Account.models import User
from Account.serializers import UserSerializer
from django.views.decorators.csrf import csrf_exempt
# Create your views here.
# class UserViewset(ModelViewSet):
#     queryset=User.objects.all()
#     serializer_class=UserSerializer

import json
from django.http import JsonResponse
@csrf_exempt
def user_login(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        print(username, password)
        user=User.objects.filter(username__iexact=username,password__iexact=password).exists()
        if user:
            return JsonResponse({"message": "Login received", "username": username})
        else:
            return JsonResponse({"message": "Invalid Username"})
