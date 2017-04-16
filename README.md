# DyLang
Simple programming language that compiles to JavaScript


Sample Syntax:

```
  # Multi
  # Line
  # Comment


  # Print the result of (5 / 3) * 4 + 3

  $a = (add 1 2)
  $b = 5
  (print 'RESULT:' (add $a (multiply (divide $b $a) $b)))
```

### Explaination

`$b = 5`  denotes a variable assignment, all variables start with a *$*

`$a = (add 1 2)` says that variable `$a` will get the result of `(add 1 2)` which will call the function `add` with parameters `1` and `2`