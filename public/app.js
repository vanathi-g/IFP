// user authentication

const auth = firebase.auth();

const signedIn = document.getElementById('signedIn');
const signedOut = document.getElementById('signedOut');

const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');

const userDetails = document.getElementById('userDetails');

const provider = new firebase.auth.GoogleAuthProvider();

signInBtn.onclick = () => auth.signInWithPopup(provider);
signOutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
    if(user) {
        signedIn.hidden = false;
        signedOut.hidden = true;
        signInBtn.hidden = true;
        signOutBtn.hidden = false;
        userDetails.hidden = false;
        userDetails.innerHTML = `<h3 class="username"> Welcome, ${user.displayName}!`;
    }
    else {
        signedOut.hidden = false;
        signedIn.hidden = true;
        signOutBtn.hidden = true;
        signInBtn.hidden = false;
        userDetails.hidden = true;
        userDetails.innerHTML = '';
    }
}); 

// database 

const db = firebase.firestore();
let readings = document.getElementById('readings');

let readingsRef;
let unsubscribe;

// Utility functions to populate database with random values given by the ranges in dataset

const QE_MIN = 10000;
const QE_MAX = 60000;
const PH_MIN = 6.9;
const PH_MAX = 8.7;
const ZN_MIN = 1.0;
const ZN_MAX = 33.5;
const DQO_MIN = 80;
const DQO_MAX = 950;

function generateValue(min, max){
	let x = (Math.random() * (max - min) + min);
	return [x.toFixed(3), ((Math.abs(x - min)) / (max - min)).toFixed(8)];
}

async function predict(vector) {
    const model = await tf.loadLayersModel('model.json');
  
    let tensor = tf.tensor(vector, [1,4]);
    return model.predict(tensor)
}

function simulateTableEntry() {
	let [qe_val, norm_qe_val]= generateValue(QE_MIN,QE_MAX);
	let [ph_val, norm_ph_val]= generateValue(PH_MIN,PH_MAX);
	let [zn_val, norm_zn_val] = generateValue(ZN_MIN,ZN_MAX);
	let [dqo_val, norm_dqo_val] = generateValue(DQO_MIN,DQO_MAX);
	let input = [norm_qe_val, norm_dqo_val, norm_zn_val, norm_ph_val];

    for(let i=0; i<input.length; i++)
		input[i] = parseFloat(input[i]);

    predict(input).then(ans => {
        ans = ans.dataSync();
        ans = ans[0].toFixed(3);

        readingsRef = db.collection('readings');
        const { serverTimestamp } = firebase.firestore.FieldValue;
        readingsRef.add({
            zn_e: zn_val,
            dqo_e: dqo_val,
            ph_e: ph_val,
            q_e: qe_val,
            dqo_s: ans,
            createdAt: serverTimestamp()
        });
    });
}

setInterval(simulateTableEntry, 300000);

let table_heading = "<tr><th>Timestamp</th><th>Q-E</th><th>PH-E</th><th>ZN-E</th><th>DQO-E</th><th>Predicted COD</th></tr>";

auth.onAuthStateChanged(user => {
    if(user){
        const { serverTimestamp } = firebase.firestore.FieldValue;
        let pred_val = 0;
        let date_time = '';
        readingsRef = db.collection('readings');
        unsubscribe = readingsRef
        .orderBy('createdAt', 'desc')
        .limit(20)
        .onSnapshot(querySnapshot => {
            const items = querySnapshot.docs.map(doc => {
                let date =  doc.data().createdAt.toDate();
                pred_val = doc.data().dqo_s;
                date_time = date.getHours()+":"+date.getMinutes()+" | "+date.getDate()+"/"+date.getMonth();
                return `<tr><td>${ date_time }</td><td>${ doc.data().q_e }</td><td>${ doc.data().ph_e }</td><td>${ doc.data().zn_e }</td><td>${ doc.data().dqo_e }</td><td>${ doc.data().dqo_s }</td></tr>`
            });
            readings.innerHTML = table_heading+items.join('');

            let pred = document.getElementById('prediction');
            pred.innerHTML = `<b> ${ pred_val } </b>`

            let time = document.getElementById('time');
            time.innerHTML = `<b> ${ date_time } </b>`;
        });
    }
    else {
        unsubscribe && unsubscribe();
    }
})