package ui;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class StrategyExecutionWindow {
    private static final String TEXT = "#18202a";
    private static final String CARD = "#f4f7fa";

    public void show(Stage stage, String strategy) {
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: #c3cfdb;");

        VBox card = new VBox(12);
        card.setPadding(new Insets(18));
        card.setStyle(
                "-fx-background-color: " + CARD + ";" +
                "-fx-background-radius: 16;"
        );

        Label title = new Label("Ejecución de estrategia");
        title.setStyle(
                "-fx-font-size: 22px;" +
                "-fx-font-weight: bold;" +
                "-fx-text-fill: " + TEXT + ";"
        );

        Label strategyLabel = new Label("Estrategia: " + strategy);
        strategyLabel.setStyle(
                "-fx-font-size: 16px;" +
                "-fx-text-fill: " + TEXT + ";"
        );

        VBox floors = new VBox(3);
        floors.setPadding(new Insets(4));

        for (int floor = 100; floor >= 1; floor--) {
            HBox row = new HBox();
            row.setAlignment(Pos.CENTER);
            row.setMinHeight(28);
            row.setMaxWidth(Double.MAX_VALUE);
            row.setStyle(floorStyle(FloorState.UNKNOWN));

            Label floorLabel = new Label("Piso " + floor);
            floorLabel.setStyle(
                    "-fx-font-size: 14px;" +
                    "-fx-text-fill: " + TEXT + ";"
            );

            row.getChildren().add(floorLabel);
            floors.getChildren().add(row);
        }

        ScrollPane scroll = new ScrollPane(floors);
        scroll.setFitToWidth(true);
        scroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scroll.setStyle(
                "-fx-background: " + CARD + ";" +
                "-fx-background-color: " + CARD + ";" +
                "-fx-border-color: transparent;"
        );

        Button backButton = new Button("Volver");
        backButton.setOnAction(event -> new MainWindow().show(stage));

        Button reviewButton = new Button("Revisar resultados");
        reviewButton.setOnAction(event ->
                new AnalysisResultsWindow().show(stage, strategy));

        styleButton(backButton);
        styleButton(reviewButton);

        HBox navigation = new HBox(10, backButton, reviewButton);
        navigation.setAlignment(Pos.CENTER_RIGHT);

        VBox.setVgrow(scroll, Priority.ALWAYS);
        card.getChildren().addAll(title, strategyLabel, scroll, navigation);

        root.setCenter(card);
        BorderPane.setMargin(card, new Insets(20));

        stage.setTitle("EGG100 - Ejecución de estrategia");
        stage.setScene(new Scene(root, 650, 700));
        stage.show();
    }

    private String floorStyle(FloorState state) {
        return "-fx-background-color: " + state.color() + ";" +
               "-fx-background-radius: 6;" +
               "-fx-border-color: #bfc7d0;" +
               "-fx-border-radius: 6;";
    }

    private void styleButton(Button button) {
        button.setMinHeight(40);
        button.setStyle(
                "-fx-font-size: 15px;" +
                "-fx-text-fill: " + TEXT + ";" +
                "-fx-background-color: #8bb5f6;" +
                "-fx-background-radius: 9;"
        );
    }
}