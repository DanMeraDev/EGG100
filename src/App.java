import javafx.application.Platform;
import javafx.stage.Stage;
import ui.MainWindow;

public class App {
    public static void main(String[] args) {
        Platform.startup(() -> new MainWindow().show(new Stage()));
    }
}