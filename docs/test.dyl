/*
    Multi
    Line
    Comment
*/

fn noMatch(): string {
    return 'DOESNT MATCH'
}

fn add(): int {
    let a = 5
    return a
}

fn main(): int {
    string a = 'test'
    int b = 2

    // Check if true
    if b < add() {
        print(a)
    } else {
        print(noMatch())
    }

    /* This function figures out it's type by the return value */
    return 0
}