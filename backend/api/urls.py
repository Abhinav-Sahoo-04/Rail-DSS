from django.urls import include, path
from rest_framework.routers import DefaultRouter
from . import views

# router=DefaultRouter()
# router.register('user',views.user_login)

urlpatterns=[
    path('user/',views.user_login,name='user_login'),
]