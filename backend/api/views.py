from django.shortcuts import render
from django.http import JsonResponse,HttpResponse
from .trainDelay import get_live_train_status
import os
import json
from datetime import datetime
# from rest_framework.viewsets import ModelViewSet 
from Account.models import User
from Account.serializers import UserSerializer
from django.views.decorators.csrf import csrf_exempt
from .trainData import get_train_data
from .trainArrange import get_train_arrange
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
    
def optimized_train(request):
    results=get_train_arrange()
    if results!=None:
        return JsonResponse({'arranged_data':results},safe=False)
    else:
        return JsonResponse({"arranged_data":None})

@csrf_exempt
def manual_override(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            # 📅 Create filename using today's date
            today = datetime.now().strftime("%Y-%m-%d")
            filename = f"manual_override_{today}.json"

            # 📁 Optional: store inside a folder
            folder = "override_logs"
            os.makedirs(folder, exist_ok=True)

            filepath = os.path.join(folder, filename)

            # 📖 If file exists → load existing data
            if os.path.exists(filepath):
                with open(filepath, "r") as file:
                    try:
                        existing_data = json.load(file)
                    except json.JSONDecodeError:
                        existing_data = []
            else:
                existing_data = []

            # ➕ Append new entry
            existing_data.append(data)

            # 💾 Save back to file
            with open(filepath, "w") as file:
                json.dump(existing_data, file, indent=4)

            return HttpResponse("Data saved successfully")

        except Exception as e:
            return HttpResponse(f"Error: {str(e)}", status=500)

    return HttpResponse("Invalid request", status=400)
    
