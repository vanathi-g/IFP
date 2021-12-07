## About:
This is a **prototype** application to monitor the dissolved oxygen content in wastewater that is undergoing treatment in effluent treatment reactors. In the current implementation, an ANN has been trained using a publicly available dataset to predict the chemical oxygen demand of treated water output from a wastewater treatment plant. 

After training, the model was converted to a Tensorflow.js implementation and loaded into the web application (see `public/app.js`). Input values are simulated on the website at set time intervals and the trained model is used to predict COD for these values.

## Future work:
An arduino, necessary sensors and an ESP8266 Wifi-Module can be used to actually measure necessary input parameters from a (simulated) wastewater treatment plant. Sending collected sensor data to Firebase Firestore may be done in 2 steps: 
1. Develop a Node.js server to handle simple GET and POST calls. This server will be responsible for writing data to Firestore. 
2. Program the arduino to send the collected sensor data as HTTP POST requests to the above mentioned server. 

## Folders: 
The 'data' folder contains the dataset used for this project which can be found [here](https://archive.ics.uci.edu/ml/datasets/Water+Treatment+Plant). 

The 'model' folder contains:
1. Python notebook with the Keras model
2. Trained Tensorflow model converted to a TensorFlow.js model (group1-shard1of1.bin + model.json)

The 'public' folder contains the website code which is hosted on Firebase.
