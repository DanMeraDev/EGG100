package ui;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class AnalysisResultsWindow {
    private static final String TEXT = "#18202a";
    private static final String MUTED = "#5b6775";
    private static final String CARD = "#f4f7fa";

    public void show(Stage stage, String strategy) {
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: #c3cfdb;");

        VBox card = new VBox(18);
        card.setPadding(new Insets(22));
        card.setStyle(
                "-fx-background-color: " + CARD + ";" +
                "-fx-background-radius: 16;"
        );

        Label title = new Label("Análisis y resultados");
        title.setStyle(
                "-fx-font-size: 24px;" +
                "-fx-font-weight: bold;" +
                "-fx-text-fill: " + TEXT + ";"
        );

        Label strategyLabel = new Label("Estrategia seleccionada: " + strategy);
        strategyLabel.setStyle(
                "-fx-font-size: 17px;" +
                "-fx-text-fill: " + MUTED + ";"
        );

        VBox sequenceCard = infoCard(
                "Secuencia de lanzamientos",
                "14  →  27  →  39  →  50  →  60  →  69  →  77  →  84  →  90  →  95  →  99"
        );

        VBox explanationCard = infoCard(
                "Explicación",
                "Esta pantalla está preparada para mostrar el análisis de la estrategia. " +
                "La secuencia y los valores son únicamente contenido visual de ejemplo; " +
                "aún no se realizan cálculos."
        );

        HBox strategyCards = new HBox(14,
                metricCard("Secuencial", "100 intentos"),
                metricCard("Saltos de 10", "19 intentos"),
                metricCard("Óptima", "14 intentos")
        );
        HBox.setHgrow(strategyCards.getChildren().get(0), Priority.ALWAYS);
        HBox.setHgrow(strategyCards.getChildren().get(1), Priority.ALWAYS);
        HBox.setHgrow(strategyCards.getChildren().get(2), Priority.ALWAYS);

        Button backButton = new Button("Volver a la estrategia");
        backButton.setOnAction(event ->
                new StrategyExecutionWindow().show(stage, strategy));
        backButton.setStyle(
                "-fx-font-size: 15px;" +
                "-fx-text-fill: " + TEXT + ";" +
                "-fx-background-color: #8bb5f6;" +
                "-fx-background-radius: 9;"
        );

        HBox buttonRow = new HBox(backButton);
        buttonRow.setAlignment(Pos.CENTER_RIGHT);

        card.getChildren().addAll(
                title,
                strategyLabel,
                sequenceCard,
                strategyCards,
                explanationCard,
                buttonRow
        );

        root.setCenter(card);
        BorderPane.setMargin(card, new Insets(24));

        stage.setTitle("EGG100 - Análisis y resultados");
        stage.setScene(new Scene(root, 900, 620));
        stage.show();
    }

    private VBox infoCard(String heading, String content) {
        VBox box = new VBox(10);
        box.setPadding(new Insets(16));
        box.setStyle(
                "-fx-background-color: #ffffff;" +
                "-fx-background-radius: 12;" +
                "-fx-border-color: #d2dbe5;" +
                "-fx-border-radius: 12;"
        );

        Label title = new Label(heading);
        title.setStyle(
                "-fx-font-size: 18px;" +
                "-fx-font-weight: bold;" +
                "-fx-text-fill: " + TEXT + ";"
        );

        Label description = new Label(content);
        description.setWrapText(true);
        description.setStyle(
                "-fx-font-size: 15px;" +
                "-fx-text-fill: " + MUTED + ";"
        );

        box.getChildren().addAll(title, description);
        return box;
    }

    private VBox metricCard(String heading, String value) {
        VBox box = infoCard(heading, value);
        box.setAlignment(Pos.CENTER);
        HBox.setHgrow(box, Priority.ALWAYS);
        return box;
    }
}