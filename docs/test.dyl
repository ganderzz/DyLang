/*
    Multi
    Line
    Comment
*/

fn noMatch() {
    return 'DOESNT MATCH'
}

fn add() {
    return 3 - 2
}

fn main() {
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