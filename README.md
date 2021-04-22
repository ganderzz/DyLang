# DyLang

_Experimental_

Tiny programming language that compiles to JavaScript. The goal of DyLang is to provide an easy to learn programming language for starting developers. All code compiles to valid JavaScript, so it's easy to get up and running!

This is an ever growing project as I dive into how compilers work.

### Syntax

```rust
/*
  Multi
  Line
  Comment
*/

// Variables!
int a = 2 + 3
decimal b = 2.5
string foo = "bar!"


fn evaluate() {
  if b > a {
    return "yup"
  } else {
    return "nope"
  }
}

console.log(evaluate())
```

[View the result](https://ganderzz.github.io/DyLang/)
