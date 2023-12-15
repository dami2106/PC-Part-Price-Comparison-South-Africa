from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from .models import Price, Product, Store

def index(request):
    all_trans = Price.objects.order_by("-product_id")
    # Print out the product names, product id and product category separated by commas.
 
    # output = ", ".join([q.product_name for q in latest_question_list])

    # # output = ", ".join([q.store_name for q in latest_question_list])
    
    # return HttpResponse(output)

    
    template = loader.get_template("pollsed/index.html")
    context = {
        "all_transaction": all_trans,
    }
    return HttpResponse(template.render(context, request))

def detail(request, question_id):
    return HttpResponse("You're looking at question %s." % question_id)


def results(request, question_id):
    response = "You're looking at the results of question %s."
    return HttpResponse(response % question_id)


def vote(request, question_id):
    return HttpResponse("You're voting on question %s." % question_id)
# Create your views here.
