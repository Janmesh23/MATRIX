// URL of your hosted TensorFlow.js model
const modelURL = "https://your-server.com/model/model.json";
let model;
const modelStatus = document.getElementById("modelStatus");
const predictionResult = document.getElementById("predictionResult");
const testDownloadBtn = document.getElementById("testDownloadBtn");

// Load the model from the server
async function loadModel() {
  try {
    model = await tf.loadLayersModel(modelURL);
    modelStatus.textContent = "Model Loaded Successfully!";
    modelStatus.style.color = "green";
    runPrediction();
  } catch (error) {
    modelStatus.textContent = "Error loading model";
    modelStatus.style.color = "red";
    console.error("Error loading model:", error);
  }
}

// Run the prediction with mock features
async function runPrediction() {
  if (!model) return;

  // Example features for prediction (this can be customized based on what you're analyzing)
  const features = [0.5, 0.6, 0.3]; // Example data points
  const inputTensor = tf.tensor([features]);
  const prediction = await model.predict(inputTensor);
  const riskScore = prediction.dataSync()[0];

  // Display result in popup based on the prediction score
  if (riskScore > 0.8) {
    predictionResult.textContent = "⚠️ Potential Risk Detected!";
    predictionResult.style.color = "red";
  } else {
    predictionResult.textContent = "✅ Safe Site";
    predictionResult.style.color = "green";
  }
}

// Handle the "Test Download Block" button click
testDownloadBtn.addEventListener('click', () => {
  alert("Download Blocked! Test complete.");
});

// Load the model when the popup is opened
loadModel();
