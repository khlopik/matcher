<script setup>
import { ref, onBeforeUnmount } from "vue";
import Gzip from "gzip-js";
import AButton from "@/components/shared/AButton.vue";
import AHintMessage from "@/components/shared/AHintMessage.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
  iceTransportPolicy: "all", // Allow all types of candidates
  iceCandidatePoolSize: 10,
};

function compressToBase64(text) {
  const compressed = Gzip.zip(text, { level: 9 });
  return btoa(String.fromCharCode(...compressed));
}

function decompressFromBase64(base64) {
  const binaryString = atob(base64);
  const byteArray = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
  const decompressed = Gzip.unzip(byteArray);
  return String.fromCharCode(...decompressed);
}

const props = defineProps({
  modelValue: {
    type: Boolean,
  },
  name: {
    type: String,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "receive-message",
  "connected",
  "disconnected",
]);
const peerConnection = ref(null);
const dataChannel = ref(null);
const localOffer = ref("");
const localOfferEncoded = ref("");
const remoteData = ref("");
const isConnected = ref(false);
const hasPeer = ref(false);
const isHost = ref(false);
const connectionStatus = ref("Not Connected");
const messages = ref([]);
const newMessage = ref("");
const iceCandidates = ref([]);
const connectionCheckTimer = ref(null); // Add this lin
const showDebugInfo = ref(false); // Add this lin
let connectionFailed = ref(false); // Add this line to
const testingLocal = ref(false);
const localhost = ref(
  window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1",
);
const showLocalhostTips = ref(false);
const copyHint = ref("");

const initPeerConnection = () => {
  console.log("== initPeerConnection() ==");

  peerConnection.value = new RTCPeerConnection(configuration);

  peerConnection.value.onicecandidate = (event) => {
    console.log("== peerConnection - onicecandidate() ==");

    if (event.candidate) {
      iceCandidates.value.push(event.candidate);
      updateLocalOffer();
      console.log("New ICE candidate:", event.candidate);
    } else {
      console.log("no event.candidate");
    }
  };

  peerConnection.value.oniceconnectionstatechange = () => {
    console.log("== peerConnection - oniceconnectionstatechange() ==");

    const state = peerConnection.iceConnectionState;
    connectionStatus.value = state;
    console.log("ICE connection state changed to:", state);

    // Handle specific states
    if (state === "checking") {
      console.log("Checking ICE connection...");
    } else if (state === "failed") {
      console.log("ICE connection failed. Try restarting the connection.");
      // Add a button to restart ICE if needed
      connectionFailed = true;
    } else if (state === "connected" || state === "completed") {
      console.log("ICE connection established!");
      connectionFailed = false;
    }
  };

  // Add more connection state handlers
  peerConnection.value.onconnectionstatechange = () => {
    console.log("== peerConnection - onconnectionstatechange() ==");
    console.log("Connection state:", peerConnection.value.connectionState);
  };

  peerConnection.value.onsignalingstatechange = () => {
    console.log("== peerConnection - onsignalingstatechange() ==");
    console.log("Signaling state:", peerConnection.value.signalingState);
  };
};
const restartIce = () => {
  if (peerConnection.value) {
    console.log("Restarting ICE connection...");
    // Create a new offer with ICE restart flag
    peerConnection.value
      .createOffer({ iceRestart: true })
      .then((offer) => peerConnection.value.setLocalDescription(offer))
      .then(() => {
        iceCandidates.value = []; // Clear old candidates
        setTimeout(() => {
          updateLocalOffer();
          connectionStatus.value = "Created new offer with ICE restart";
        }, 2000);
      })
      .catch((error) => console.error("Error restarting ICE:", error));
  }
};
const createOffer = () => {
  console.log("== createOffer() ==");
  initPeerConnection();
  connectionStatus.value = "Creating offer...";

  // Create data channel
  dataChannel.value = peerConnection.value.createDataChannel("messageChannel");
  setupDataChannel();

  // Create offer
  peerConnection.value
    .createOffer()
    .then((offer) => {
      connectionStatus.value = "Setting local description...";
      return peerConnection.value.setLocalDescription(offer);
    })
    .then(() => {
      connectionStatus.value = "Gathering ICE candidates...";
      // Increase timeout to allow more time for ICE gathering
      setTimeout(() => {
        updateLocalOffer();
        connectionStatus.value = "Offer created. Share it with your peer.";
        console.log("set isHost to TRUE!!!");
        isHost.value = true;
      }, 2000); // Increased from 1000ms to 2000ms
    })
    .catch((error) => {
      console.error("Error creating offer:", error);
      connectionStatus.value = "Error creating offer: " + error.message;
    });

  connectionCheckTimer.value = setTimeout(() => {
    if (connectionStatus.value === "checking") {
      connectionStatus.value = "checking (taking longer than expected)";
      console.log(
        "Connection taking longer than expected. You may need to try different networks.",
      );
    }
  }, 10000); // 10 seconds
};
const updateLocalOffer = () => {
  console.log("== updateLocalOffer() ==");
  if (!peerConnection.value.localDescription) {
    console.log("Waiting for local description...");
    return;
  }

  // Get only complete and valid candidates
  const validCandidates = iceCandidates.value.filter((c) => c && c.candidate);

  const connectionData = {
    type: peerConnection.value.localDescription.type,
    sdp: peerConnection.value.localDescription,
    candidates: validCandidates,
  };
  const jsonData = JSON.stringify(connectionData);
  localOffer.value = jsonData;
  localOfferEncoded.value = compressToBase64(jsonData);
};

const handleRemoteData = () => {
  console.log("== handleRemoteData() ==");
  if (!remoteData.value || remoteData.value.trim() === "") {
    connectionStatus.value = "Error: No connection data provided";
    return;
  }

  try {
    // const data = JSON.parse(remoteData.value);
    const data = JSON.parse(decompressFromBase64(remoteData.value));
    console.log("data: ", data);

    // Validate the parsed data has the required structure
    if (!data.type || !data.sdp) {
      throw new Error("Connection data is missing required fields");
    }

    hasPeer.value = true;
    console.log("data.type: ", data.type);

    if (data.type === "offer") {
      console.log("> offer");
      handleOffer(data);
    } else if (data.type === "answer") {
      console.log("> answer");
      handleAnswer(data);
    } else {
      throw new Error("Unknown connection data type");
    }
  } catch (error) {
    console.error("Invalid connection data:", error);
    connectionStatus.value = "Error: Invalid connection data format";
    alert(
      "The connection data you entered is not valid. Please check and try again.",
    );
  }
};
const handleOffer = (offerData) => {
  console.log("== handleOffer() ==");
  console.log("offerData: ", offerData);
  initPeerConnection();

  // Set up data channel listener
  peerConnection.value.ondatachannel = (event) => {
    console.log("event.channel: ", event.channel);
    dataChannel.value = event.channel;
    setupDataChannel();
  };
  console.log("offerData.sdp: ", offerData.sdp);

  // Apply the remote description (offer)
  const offerDesc = new RTCSessionDescription(offerData.sdp);
  console.log("offerDesc: ", offerDesc);
  peerConnection.value
    .setRemoteDescription(offerDesc)
    .then(() => {
      console.log("Add ICE candidates from the offer");
      // Add ICE candidates from the offer
      console.log("offerData.candidates: ", offerData.candidates);
      if (offerData.candidates) {
        offerData.candidates.forEach((candidate) => {
          console.log("candidate: ", candidate);
          peerConnection.value
            .addIceCandidate(new RTCIceCandidate(candidate))
            .catch((e) => console.error("Error adding ICE candidate:", e));
        });
      }

      // Create answer
      console.log("peerConnection.createAnswer();");
      return peerConnection.value.createAnswer();
    })
    .then((answer) => peerConnection.value.setLocalDescription(answer))
    .then(() => {
      console.log("setTimeout 1s");
      setTimeout(() => {
        // Combine the answer with gathered ICE candidates
        const connectionData = {
          type: "answer",
          sdp: peerConnection.value.localDescription,
          candidates: iceCandidates.value,
        };
        console.log("connectionData: ", connectionData);
        localOffer.value = JSON.stringify(connectionData);
      }, 1000); // Give time for ICE candidates to gather
    })
    .catch((error) => console.error("Error handling offer:", error));
};
const handleAnswer = (answerData) => {
  // Apply the remote description (answer)
  const answerDesc = new RTCSessionDescription(answerData.sdp);
  peerConnection.value
    .setRemoteDescription(answerDesc)
    .then(() => {
      // Add ICE candidates from the answer
      if (answerData.candidates) {
        answerData.candidates.forEach((candidate) => {
          peerConnection.value
            .addIceCandidate(new RTCIceCandidate(candidate))
            .catch((e) => console.error("Error adding ICE candidate:", e));
        });
      }
    })
    .catch((error) => console.error("Error handling answer:", error));
};
const setupDataChannel = () => {
  console.log("== setupDataChannel() ==");
  dataChannel.value.onopen = () => {
    console.log("== dataChannel - onopen() ==");

    isConnected.value = true;
    emit("update:modelValue", true);
    emit("connected", { isPeer1: isHost.value });
    connectionStatus.value = "Connected";
    messages.value.push({
      sender: "system",
      text: "Connection established!",
    });

    // Clear the connection check timer
    if (connectionCheckTimer.value) {
      clearTimeout(connectionCheckTimer.value);
      connectionCheckTimer.value = null;
    }
  };

  dataChannel.value.onclose = () => {
    console.log("== dataChannel - onclose() ==");

    isConnected.value = false;
    emit("disconnected");
    connectionStatus.value = "Disconnected";
    messages.value.push({ sender: "system", text: "Connection closed" });
  };

  dataChannel.value.onmessage = (event) => {
    console.log("== dataChannel - onmessage() ==");
    emit("receive-message", event.data);

    // messages.value.push({ sender: "peer", text: event.data });
  };
};
const sendMessage = (stringMessage) => {
  if (dataChannel.value && stringMessage.trim()) {
    dataChannel.value.send(stringMessage);
    // messages.value.push({ sender: "me", text: newMessage });
    // newMessage = "";
  }
};

defineExpose({ sendMessage });
const copyToClipboard = (text) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      copyHint.value = t("hint.copied");
    })
    .catch((err) => console.error("Failed to copy: ", err));
};
const testLocalConnection = async () => {
  connectionStatus.value = "Testing local connection...";

  try {
    // Create local RTCPeerConnections
    const pc1 = new RTCPeerConnection();
    const pc2 = new RTCPeerConnection();

    // Add simple data channels
    const dc1 = pc1.createDataChannel("test");
    pc2.ondatachannel = (e) => {
      const dc2 = e.channel;
      dc2.onopen = () => console.log("Local test connection successful!");
    };

    // Exchange ICE candidates
    pc1.onicecandidate = (e) => e.candidate && pc2.addIceCandidate(e.candidate);
    pc2.onicecandidate = (e) => e.candidate && pc1.addIceCandidate(e.candidate);

    // Create and exchange offer/answer
    const offer = await pc1.createOffer();
    await pc1.setLocalDescription(offer);
    await pc2.setRemoteDescription(offer);

    const answer = await pc2.createAnswer();
    await pc2.setLocalDescription(answer);
    await pc1.setRemoteDescription(answer);

    // Check if connection succeeds after 5 seconds
    setTimeout(() => {
      if (dc1.readyState === "open") {
        connectionStatus.value =
          "Local test passed! Your browser supports WebRTC.";
      } else {
        connectionStatus.value =
          "Local test failed. WebRTC might be restricted.";
      }

      // Clean up
      pc1.close();
      pc2.close();
    }, 5000);
  } catch (err) {
    console.error("Local test error:", err);
    connectionStatus.value = "Local test error: " + err.message;
  }
};
const createLocalTestConnection = () => {
  // First create and get the offer
  createOffer();

  // Show instructions
  testingLocal.value = true;
  connectionStatus.value =
    'Created offer. Now click "Accept as Answer" in the second window';
};
const acceptAsAnswer = () => {
  if (!remoteData.value) {
    alert("Please paste the offer from the first window first");
    return;
  }

  handleRemoteData();
  connectionStatus.value =
    "Processed offer and created answer. Copy the answer back to the first window.";
};
onBeforeUnmount(() => {
  if (connectionCheckTimer.value) {
    clearTimeout(connectionCheckTimer.value);
  }

  // Also clean up the peer connection if it exists
  if (peerConnection.value) {
    peerConnection.value.close();
    peerConnection.value = null;
  }
});
</script>

<template>
  <div class="webrtc-container">
    <p v-if="!name" class="webrtc__non-empty-name-validation">
      {{ $t("message.nonEmptyName") }}
    </p>
    <template v-else>
      <div v-if="localOffer">
        <p class="webrtc__label">{{ $t("message.sendConnectionData") }}:</p>
        <textarea readonly v-model="localOfferEncoded" rows="5"></textarea>
        <a-button
          text="button.copy"
          @click="copyToClipboard(localOfferEncoded)"
        />
        <a-hint-message v-model="copyHint" />
      </div>

      <div v-if="!isConnected && !hasPeer">
        <a-button
          v-if="!localOffer"
          text="button.createConnection"
          @click="createOffer"
        />

        <div class="answer-section">
          <p v-if="!localOffer" class="webrtc__label">
            {{ $t("message.connectToExisting") }}:
          </p>
          <p v-else class="webrtc__label">{{ $t("message.pasteAnswer") }}:</p>
          <textarea v-model="remoteData" rows="5"></textarea>
          <a-button text="button.connect" @click="handleRemoteData" />
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.webrtc-container {
  max-width: 600px;
  margin: 0 auto;

  .webrtc__non-empty-name-validation {
    padding: 0.5rem;
    text-align: center;
    color: var(--c-negative-color);
  }
}

.connection-status {
  margin-bottom: 15px;
  font-weight: bold;
}

textarea {
  width: 100%;
  max-width: 100%;
  margin-bottom: 10px;
}

.messages {
  height: 300px;
  border: 1px solid #ccc;
  overflow-y: auto;
  margin-bottom: 10px;
  padding: 10px;
}

.localhost-indicator {
  display: inline-block;
  font-size: 0.8em;
  color: #ff5722;
  margin-left: 8px;
}

.localhost-controls {
  margin: 15px 0;
  padding: 10px;
  border: 1px solid #ffcc80;
  background-color: #fff8e1;
  border-radius: 4px;
}

.answer-section {
  margin-top: 20px;
}

.webrtc__label {
  margin-bottom: 2px;
  font-weight: bold;
}

.alert {
  color: #e65100;
  margin-bottom: 10px;
}

.localhost-tips {
  font-size: 0.9em;
  margin: 10px 0;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.test-button {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.test-button:hover {
  background-color: #1976d2;
}
</style>
