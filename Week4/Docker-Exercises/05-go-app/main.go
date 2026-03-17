package main

import (
    "fmt"
    "net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, "Hello, Docker Go!")
}

func main() {
    http.HandleFunc("/", handler)
    fmt.Println("Server running on :3000")
    http.ListenAndServe(":3000", nil)
}
