import { progress } from "../../shared/progress.js";
import { startStepsBackground } from "./steps-background.js";

// Başlamış kullanıcıya "Başla" yerine "Kaldığın yerden devam et" gösterilir.
if (progress.hasStarted()) {
  document.querySelector("#start").textContent = "Kaldığın yerden devam et";
}

startStepsBackground(document.querySelector("#steps-bg"));