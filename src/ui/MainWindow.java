package ui;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.Menu;
import javafx.scene.control.MenuBar;
import javafx.scene.control.RadioButton;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.Separator;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.TextField;
import javafx.scene.control.ToggleGroup;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.shape.Rectangle;
import javafx.stage.Stage;

public class MainWindow {
    private static final String TEXT = "#18202a";
    private static final String MUTED = "#5b6775";
    private static final String CARD = "#f4f7fa";
    private static final String UNKNOWN = "#dce1e7";
    private static final String SAFE = "#8fde9e";
    private static final String BROKEN = "#f48787";
    private static final String BLUE = "#8bb5f6";

    private StrategyExecutionWindow executionWindow;

    public void show(Stage stage) {
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: #c3cfdb;");

        root.setTop(createMenuBar());

        HBox content = new HBox(18);
        content.setPadding(new Insets(20));
        content.setAlignment(Pos.TOP_CENTER);

        VBox buildingCard = createBuildingCard();
        VBox strategyCard = createStrategyCard(stage);
        VBox rightColumn = createRightColumn();

        buildingCard.setPrefWidth(290);
        strategyCard.setPrefWidth(340);
        rightColumn.setPrefWidth(290);

        HBox.setHgrow(buildingCard, Priority.ALWAYS);
        HBox.setHgrow(strategyCard, Priority.ALWAYS);
        HBox.setHgrow(rightColumn, Priority.ALWAYS);

        content.getChildren().addAll(buildingCard, strategyCard, rightColumn);
        root.setCenter(content);

        stage.setTitle("EGG100 - Egg Dropping Simulation");
        stage.setMinWidth(900);
        stage.setMinHeight(560);
        stage.setScene(new Scene(root, 1024, 620));
        stage.show();
    }

    private MenuBar createMenuBar() {
        MenuBar menuBar = new MenuBar();
        menuBar.getMenus().addAll(
                new Menu("Archivo"),
                new Menu("Editar"),
                new Menu("Vista"),
                new Menu("Ayuda")
        );
        return menuBar;
    }

    private VBox createBuildingCard() {
        VBox card = createCard();
        card.setSpacing(12);

        Label title = heading("Edificio 100 pisos", 22);
        title.setMaxWidth(Double.MAX_VALUE);
        title.setAlignment(Pos.CENTER);

        VBox floors = new VBox(3);
        floors.setPadding(new Insets(4));

        for (int floor = 100; floor >= 1; floor--) {
            floors.getChildren().add(createFloorRow(floor));
        }

        ScrollPane scroll = new ScrollPane(floors);
        scroll.setFitToWidth(true);
        scroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scroll.setStyle(
                "-fx-background: " + CARD + ";" +
                "-fx-background-color: " + CARD + ";" +
                "-fx-border-color: transparent;"
        );

        VBox.setVgrow(scroll, Priority.ALWAYS);
        card.getChildren().addAll(title, scroll);
        return card;
    }

    private HBox createFloorRow(int floor) {
        HBox row = new HBox();
        row.setAlignment(Pos.CENTER);
        row.setMinHeight(28);
        row.setMaxWidth(Double.MAX_VALUE);
        row.setStyle(
                "-fx-background-color: " + UNKNOWN + ";" +
                "-fx-background-radius: 6;" +
                "-fx-border-color: #bfc7d0;" +
                "-fx-border-radius: 6;"
        );

        Label number = new Label(String.valueOf(floor));
        number.setStyle(
                "-fx-font-size: 14px;" +
                "-fx-text-fill: " + TEXT + ";"
        );

        row.getChildren().add(number);
        return row;
    }

    private VBox createStrategyCard(Stage owner) {
        VBox card = createCard();
        card.setSpacing(18);

        Label title = heading("Estrategia y Simulación", 22);
        title.setMaxWidth(Double.MAX_VALUE);
        title.setAlignment(Pos.CENTER);

        ToggleGroup strategyGroup = new ToggleGroup();

        RadioButton sequential = strategyOption("Secuencial", strategyGroup);
        RadioButton jumps = strategyOption("Saltos de 10", strategyGroup);
        RadioButton optimal = strategyOption("Óptima", strategyGroup);
        sequential.setSelected(true);

        VBox strategyOptions = new VBox(13);
        strategyOptions.setPadding(new Insets(14));
        strategyOptions.setStyle(
                "-fx-border-color: #acb8c5;" +
                "-fx-border-radius: 8;" +
                "-fx-background-radius: 8;"
        );
        strategyOptions.getChildren().addAll(
                heading("Estrategia", 19),
                sequential,
                jumps,
                optimal
        );

        HBox criticalFloorRow = new HBox(10);
        criticalFloorRow.setAlignment(Pos.CENTER_LEFT);

        Label criticalFloorLabel = bodyLabel("Piso crítico:", 18);
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        TextField criticalFloor = new TextField("0");
        criticalFloor.setEditable(false);
        criticalFloor.setFocusTraversable(false);
        criticalFloor.setAlignment(Pos.CENTER);
        criticalFloor.setPrefWidth(76);
        criticalFloor.setStyle(
                "-fx-font-size: 18px;" +
                "-fx-background-radius: 7;" +
                "-fx-border-radius: 7;"
        );

        criticalFloorRow.getChildren().addAll(
                criticalFloorLabel,
                spacer,
                criticalFloor
        );

        Button executeButton = actionButton("[ Ejecutar ]", BLUE);
        executeButton.setOnAction(event -> {
            RadioButton selected =
                    (RadioButton) strategyGroup.getSelectedToggle();

            String strategy = selected == null
                    ? "Sin estrategia"
                    : selected.getText();

            executionWindow = new StrategyExecutionWindow();
            executionWindow.show(owner, strategy);
        });

        Button restartButton = actionButton("[ Reiniciar ]", UNKNOWN);

        card.getChildren().addAll(
                title,
                strategyOptions,
                criticalFloorRow,
                executeButton,
                restartButton
        );

        return card;
    }

    private RadioButton strategyOption(String text, ToggleGroup group) {
        RadioButton option = new RadioButton(text);
        option.setToggleGroup(group);
        option.setStyle(
                "-fx-font-size: 18px;" +
                "-fx-text-fill: " + TEXT + ";"
        );
        return option;
    }

    private VBox createRightColumn() {
        VBox column = new VBox(18);
        column.setMinWidth(0);

        VBox historyCard = createHistoryCard();
        VBox legendCard = createLegendCard();

        VBox.setVgrow(historyCard, Priority.ALWAYS);
        column.getChildren().addAll(historyCard, legendCard);
        return column;
    }

    private VBox createHistoryCard() {
        VBox card = createCard();
        card.setSpacing(12);

        Label title = heading("Historial", 22);
        title.setMaxWidth(Double.MAX_VALUE);
        title.setAlignment(Pos.CENTER);

        TableView<String> table = new TableView<>();
        table.setPlaceholder(bodyLabel("Sin intentos registrados", 14));
        table.setColumnResizePolicy(
                TableView.CONSTRAINED_RESIZE_POLICY
        );

        table.getColumns().addAll(
                createColumn("Intento"),
                createColumn("Piso"),
                createColumn("Resultado")
        );

        VBox.setVgrow(table, Priority.ALWAYS);
        card.getChildren().addAll(title, new Separator(), table);
        return card;
    }

    private TableColumn<String, String> createColumn(String title) {
        TableColumn<String, String> column = new TableColumn<>(title);
        column.setSortable(false);
        return column;
    }

    private VBox createLegendCard() {
        VBox card = createCard();
        card.setSpacing(12);

        Label title = heading("Leyenda", 22);
        title.setMaxWidth(Double.MAX_VALUE);
        title.setAlignment(Pos.CENTER);

        card.getChildren().addAll(
                title,
                legendRow(SAFE, "Piso Seguro"),
                legendRow(BROKEN, "Piso Roto"),
                legendRow(UNKNOWN, "Desconocido / Sin Información")
        );

        return card;
    }

    private HBox legendRow(String color, String text) {
        HBox row = new HBox(12);
        row.setAlignment(Pos.CENTER_LEFT);

        Rectangle swatch = new Rectangle(30, 30);
        swatch.setArcWidth(6);
        swatch.setArcHeight(6);
        swatch.setFill(Color.web(color));
        swatch.setStroke(Color.web("#c3cbd4"));

        Label label = bodyLabel(text, 16);
        label.setWrapText(true);

        row.getChildren().addAll(swatch, label);
        return row;
    }

    private Button actionButton(String text, String color) {
        Button button = new Button(text);
        button.setMaxWidth(Double.MAX_VALUE);
        button.setMinHeight(52);
        button.setFocusTraversable(false);
        button.setStyle(
                "-fx-font-size: 20px;" +
                "-fx-text-fill: " + TEXT + ";" +
                "-fx-background-color: " + color + ";" +
                "-fx-background-radius: 28;" +
                "-fx-border-color: #8393a5;" +
                "-fx-border-radius: 28;"
        );
        return button;
    }

    private VBox createCard() {
        VBox card = new VBox();
        card.setMinWidth(0);
        card.setPadding(new Insets(16));
        card.setStyle(
                "-fx-background-color: " + CARD + ";" +
                "-fx-background-radius: 16;" +
                "-fx-effect: dropshadow(gaussian, rgba(35,47,60,0.18), 10, 0, 2, 4);"
        );
        return card;
    }

    private Label heading(String text, int size) {
        Label label = new Label(text);
        label.setStyle(
                "-fx-font-size: " + size + "px;" +
                "-fx-font-weight: bold;" +
                "-fx-text-fill: " + TEXT + ";"
        );
        return label;
    }

    private Label bodyLabel(String text, int size) {
        Label label = new Label(text);
        label.setStyle(
                "-fx-font-size: " + size + "px;" +
                "-fx-text-fill: " + MUTED + ";"
        );
        return label;
    }

    public StrategyExecutionWindow getExecutionWindow() {
        return executionWindow;
    }
}