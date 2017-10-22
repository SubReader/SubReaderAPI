const { generate: showQR } = require("qrcode-console");
const { getStream } = require("./lib");

getStream(authId => {
  console.log(authId);
  showQR(`subreader://authenticate?id=${authId}`);
}).then(stream => {
  console.log("Got stream", stream.id);

  stream.setSubtitles([
    {
      language: "da",
      cues: [
        {
          text: "Hej med dig!",
          timeIn: Date.now() + 0,
          timeOut: Date.now() + 4000
        },
        {
          text: "Hvordan går det?",
          timeIn: Date.now() + 5000,
          timeOut: Date.now() + 7000
        }
      ]
    },
    {
      language: "en",
      cues: [
        {
          text: "Hello!",
          timeIn: Date.now() + 0,
          timeOut: Date.now() + 4000
        },
        {
          text: "How are you?",
          timeIn: Date.now() + 5000,
          timeOut: Date.now() + 7000
        }
      ]
    }
  ]);

  setInterval(() => {
    stream.setState({
      playing: true,
      time: Date.now()
    });
  }, 1000);
});
