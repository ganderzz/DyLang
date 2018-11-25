/*
    Multi
    Line
    Comment
*/

fn noMatch(): string {
    return "DOESN\"T MATCH"
}

fn add() {
    let a = 1
    return a
}

fn main(): int {
    let a = "test"
    let b = 2

    // Check if true
    if b < add() {
        print(a)
    } else {
        print(noMatch())
    }

    /* This function figures out it's type by the return value */
    return 0
}