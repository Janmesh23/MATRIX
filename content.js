const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs";
document.head.appendChild(script);

script.onload = async () => {
  console.log("TensorFlow.js Loaded");

  const model = await tf.loadLayersModel("https://yourmodelurl.com/model.json");

  function analyzeJavaScriptBehavior() {
    let features = {
      highCPU: performance.now() > 10000, // Detects high CPU usage
      largeFileDownload: document.querySelectorAll("a[href$='.exe'], a[href$='.zip']").length > 0,
      scriptModifications: document.scripts.length > 10,
      suspiciousAPICalls: window.XMLHttpRequest !== undefined
    };

    return Object.values(features);
  }

  setInterval(async () => {
    const input = tf.tensor([analyzeJavaScriptBehavior()]);
    const prediction = model.predict(input);
    const riskScore = prediction.dataSync()[0];

    if (riskScore > 0.8) {
      alert("⚠️ Potential Ransomware Activity Detected! Close this page immediately.");
      window.close();
    }
  }, 5000);
};
