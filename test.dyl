/*
    Multi
    Line
    Comment
*/

fn noMatch(): string {
    return "DOESN'T MATCH"
}

fn add(one: int, two: int): int {
    return one + two
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

    return 0
}