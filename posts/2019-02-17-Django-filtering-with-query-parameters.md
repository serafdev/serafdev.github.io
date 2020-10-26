---
title: Django Filtering
description: This is a post on My Blog about agile frameworks.
date_published: 2018-05-01T22:29:00.000Z
tags:
  - another-tag
layout: layouts/post.njk

---
<!-- layout: post -->
<!-- title: Django filtering with query parameters -->
<!-- date: 2019-02-17 07:24 -->
<!-- summary: A way to add a generic optional filtering to Django /GET request, e.g /GET /items?name__startswith=Graph -->
<!-- categories: webdev python django -->
<!-- layout: layouts/post.njk -->
<!-- tags: -->
<!--   - django  -->
<!--   - api -->

#### Problem
If you make a webapp, you will need someday or another to give filtering options to your frontend coworkers. In Django it is pretty simple to add filtering to a `query_set: e.g (Item.objects.filter(name='Graphic Card'))`

Although, I found optional filtering was annoying, I could've used the `Item.objects.filter(name__startswith='')` when there's no filter given but this is not nice because if you have 10 different filters you will still need to handle integers and pass all the filters even the empty ones to your query.

#### Solution
Let's handle the use case of a `/GET /items?name__startswith=Grap&price_gte=300&price__lte=700` which should return all items that start with `Grap` and price range from `300` and `700`

So your request will trigger the viewset `ItemViewSet` which contains the default function `list` which returns the the elements in `self.get_queryset()` which the default is all elements (At least for me when I generated the sample ViewSet) 

Here's what I found:

```python
class ListModelMixin(object):
    """
    List a queryset.
    """
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        ...
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
```

To modify the behaviour we need to override the `get_queryset()`, I am not sure if we should override the `def list()` function but it looked to me that if I did that, the `get_queryset()` will return everything and then we filter in the backend, which I don't want.

Now back to our sheeps, to make our URL work we can make a function that will dynamically generate our query parameters like this:

```python
from django.db.models import Q
...


# `/GET /items?name__startswith=Grap&price_gte=300&price__lte=700`
def get_queryset(self):

    filters = {
                'name__startswith': self.request.GET.get('name__startswith ', ''),
                'price__gte': self.request.GET.get('price_gte ', ''),
                'price__lte': self.request.GET.get('price__lte', ''),
              }

    def queries(filters):
        return [Q(**{k: v}) for k, v in filters.items() if v]

    return Item.objects.filter(*queries(filters))
```

First, we fetch the 3 query sets and put them in a dictionary with the keys `name__startswith`, `price_gte`, `price__lte`, if they are not there we give the default value '' (which means False).

Second, our queries function will generate an array of Queries `Q` of column name `k` (the key of the dictionary `filters.items()`) and the filter condition `v` (the value of `filters.items()`), but only `if v` (translates to `if True`, remember `''` means False). The function Q takes as arguments named variables, of the form `Q(name__startswith='Gra')` (named arguments) and this is why I used a dictionary with unpacking, a bit like **kwargs: you can see some doc about that [here](http://book.pythontips.com/en/latest/args_and_kwargs.html).

Third we pass the filters we generated earlier to the function we just created, which will return an array of Queries, but our `Item.objects.filter` takes multiple queries as arguments and not an array of queries, so again we need to unpack the unnamed variables like this: `*queries(filters)`, this will look like this after unpacking: `Item.objects.filter(Q1, Q2, Q3)` where `Q1=Q(name__startswith='Gra'), Q2=Q(price_gte=300), Q3=Q(price__lte=700)`.

Finally, you can add more complex filtering like `category__in=[1,2,3]` (where 1 2 and 3 are category ids). To do this you just need to parse your array in the filters level like this:

```python
{
    'category__in'=[int(c) for c in self.request.GET.get('category__in', '').split(',') if c]
}
```

This will split your query parameter `category__in=1,2,3` into an array `[1,2,3]`, again if the array is empty, the `queries(filters)` function will evaluate `[]` to `False`

Happy Pythoning!

*PS: If you find an issue or a way to improve this article, please open an issue [here](https://github.com/serafss2/serafss2.github.io/issues).*

*Note1: Try these 'Falsy' variables*
```python
if not []: print('List is empty')
if not '': print('String is empty')
```


*Note2: You could also take all query parameters and directly build your dictionary, something like:*

```python
[Q(**{k: v}) for k, v in self.request.GET]
```

*You could also make a function that would translate `__in` to splitting the value, etc. I didn't try something like this yet but if I find the need I would update this article, if you do it, feel free to contribute*
