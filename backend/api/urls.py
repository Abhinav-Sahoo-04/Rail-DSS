from django.urls import include, path
# from rest_framework.routers import DefaultRouter
from . import views

# router=DefaultRouter()
# router.register('user',views.user_login)

urlpatterns=[
    path('user/',views.user_login,name='user_login'),
    path('train_data/',views.train_data,name='train_data'),
    path('get_user/',views.get_user,name='get_user'),
    path('get_tarin_live_status/<str:train_no>/',views.get_live_status,name='get_train_live_status'),
    path('optimized_train/',views.optimized_train,name='optimized_train'),
    path('manual_override/',views.manual_override,name='manual_override'),
]