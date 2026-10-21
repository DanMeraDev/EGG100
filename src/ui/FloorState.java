package ui;

public enum FloorState {
    UNKNOWN("#dce1e7"),
    SAFE("#8fde9e"),
    BROKEN("#f48787");

    private final String color;

    FloorState(String color) {
        this.color = color;
    }

    public String color() {
        return color;
    }
}