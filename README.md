# DyLang
Simple programming language that compiles to JavaScript


### Syntax:

```
  ##
    Multi
    Line
    Comment
  #

  # Print the result

  $a = 6
  $b = (add 1 2)
  $result = (add $a (multiply (divide $b $a) $b))
  $dom = (getElementById 'test')

  (writeTo $dom $result)
```

Write the result of 6 + ((3 / 6) 3) to the DOM with id of test

### Explaination

`$a = 6`  denotes a variable assignment, all variables start with a *$*

`$b = (add 1 2)` says that variable `$b` will get the result of `(add 1 2)` which will call the function `add` with parameters `1` and `2`