---
title: Things I wish(ed) I could add to Python
date_published: 2019-03-09T22:29:00.000Z
summary: So I extended the built-in list class to add some helpful functions.
categories: cpython
layout: layouts/post.njk
tags:
  - nginx 
  - webserver
---

### Things I wish I could add to Python

For some background, I've been a Scala developer for 2 years and if there's something I wish I could port in other languages are the berserk mode collections.

For example if you get some data from an external source and have to do some modification, even complex and long, you could do it in one line elegantly and it will still be very readable, for e.g, if we receive some mapping between unimportant strings with some integer list as values, and we only want to get all the unique integers in a list and then only collect what is even, we could do something like this:

```scala
val someData: Map[String, List[Int]] = Map("yes" -> List(1, 2, 3), "no" -> List(3, 4, 5))
someData.flatMap(_._2).toList.distinct.filter(_ % 2 == 0)

> List(2, 4)
```

This looks pretty nice and concise, and very easy to read. Every function speaks from itself, first we do a flatMap (So a map that will flatten one level of the collection, e.g: `[[1, 2, 3], [3, 4, 5]] => [1, 2, 3, 3, 4, 5]`). Then distinct, takes distinct values and finally a filter which verifies if each element is an even number.

Now, we absolutely can do this in python, also in a one liner like this:

```python
some_data = {"yes": [1, 2, 3], "no": [3, 4, 5]}
[x for x in set([y for v in some_data.values() for y in v if y % 2 == 0])]
> [2, 4]
```

This does almost the same thing, but is not as easy to read. First we flatten the values of the dictionary with `[y for v in some_data.values() for y in v]`. Then we can use `set` to discard duplicates (A set in python is just a hashset, so the `"keys"` must be unique). Then we can just add a simple filter in the first part to check if the numbers we are adding are even: `if y % 2 == 0`.

On a side note, it took me time to understand how flattening works in python, these one liners are pretty satisfying but I try to avoid them in production because I don't want whoever debugging to come hunt me while I'm sleeping.

##### Added functions to list

So my point is, even if I find python a pretty complete language, I still though these cool collection functions could improve readability. So I just wanted to try to extend the `list` class to add a few functional functions:

```python
from functools import reduce

class list_(list):

    def map(self, func):
        return list_(map(func, self))

    def filter(self, func):
        return list_(filter(func, self))

    def flat_map(self, func):
        return list_(map(func, [x for y in self for x in y]))

    def flatten(self):
        return self.flat_map(lambda x: x)

    def reduce(self, func):
        return list_(reduce(func, self))

    def distinct(self):
        return list_(set(self))
```

Now we have some cool built-in functions to our new type `list_`, we can also chain them since each of them returns a new instance of the type `list_` which respects the functional paradigm and makes it easier to read and debug.

Let's try to do some complex chain:

```python
list_([[1, 2, 3], [3, 4, 5], [3, 3, 3], [4, 5, 6]]).flat_map(lambda x: x ** 2).filter(lambda x: x % 2 == 0).distinct()
> [16, 4, 36]
```

This is definitely easier to read, we know that we have a nested list and we flatten it while "squaring" each value, then taking only even numbers but only keeping distinct ones.

If we go to the first example we would have:

```python
some_data = {"yes": [1, 2, 3], "no": [3, 4, 5]}
list_(some_data.values()).flatten().distinct().filter(lambda x: x % 2 == 0)
> [2, 4]
```

Which reads to: take values, flatten them, take distincts and filter them.

I did all these examples by extending `list` but I tried this with `tuple` and it also works. I guess any collection could inherit from these functions with minor changes, I think it would be great to see these in a future Python release.

Hope you liked this read, if you have any suggestions or ways to improve this article, do not hesitate opening an [issue](https://github.com/serafss2/serafss2.github.io/issues).

Happy Pythoning!

P.S: I wanted to play with the `CPython` compiler but couldn't find how to add functions to the `iterables` class. I wish to open a PEP suggestion after playing a little bit with the compiler and testing performance, if you have any experience about this I would love to talk with you and get some of your advice.
