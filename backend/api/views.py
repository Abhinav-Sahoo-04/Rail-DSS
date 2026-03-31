from django.shortcuts import render
from django.http import JsonResponse
from .trainDelay import get_live_train_status
# from rest_framework.viewsets import ModelViewSet 
from Account.models import User
from Account.serializers import UserSerializer
from django.views.decorators.csrf import csrf_exempt
from .trainData import get_train_data
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
            all_user=User.objects.all()
            for i in all_user:
                i.is_active=False
                i.save()
            user=User.objects.get(username=username,password=password)
            user.is_active=True
            user.save()
            return JsonResponse({"message": "Login received", "username": username})
        else:
            return JsonResponse({"message": "Invalid Username"})


def train_data(request):
    result=get_train_data()
    # print(result)
    return JsonResponse(result,safe=False)


def get_user(request):
    user=User.objects.filter(is_active=True).exists()
    if user:
        active_user=User.objects.get(is_active=True)
        context={
            "username":active_user.username
        }
        return JsonResponse(context,safe=False)
    else:
        return JsonResponse({},safe=False)
    


def get_live_status(request,train_no):
    result=get_live_train_status(train_no)
    if result!=None:
        context={
            'message':result
        }
        return JsonResponse(context,safe=False)
    else:
        return JsonResponse({"message":"On Time"})