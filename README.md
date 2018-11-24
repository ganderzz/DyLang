# DyLang

_Experiemental_

[![Build Status](https://travis-ci.org/ganderzz/DyLang.svg?branch=master)](https://travis-ci.org/ganderzz/DyLang)

Tiny programming language that compiles to JavaScript. The goal of DyLang is to provide an easy to learn programming language for starting developers. All code compiles to valid JavaScript, so it's easy to get up and running!

This is an ever growing project as I dive into how compilers work.

**Based on [The Super Tiny Compiler](https://github.com/thejameskyle/the-super-tiny-compiler)**

### Syntax

```
/*
  Multi
  Line
  Comment
*/

// Variables!
int a = 2 + 3
decimal b = 2.5
string foo = 'bar!'

fn three() {
  return 3
}

if three() > a {
  console.log(foo)
} else {
  console.log('Nope!')
}
```

[View the result](https://ganderzz.github.io/DyLang/)

### Contribute

Feel free to open an [Issue](https://github.com/ganderzz/DyLang/issues/new) to provide any feedback!

To contribute, follow [Kent C. Dodds' guide](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)!
