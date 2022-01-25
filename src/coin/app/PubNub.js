const PubNub = require('pubnub');

const { CHANNELS } = require('../../constants');

const credentials = {
  publishKey: 'pub-c-2b2890c6-6f43-4e35-bb42-f8c978f2cb0a',
  subscribeKey: 'sub-c-64a732a4-b7cd-11eb-b2e5-0e040bede276',
  secretkey: 'sec-c-NzExNDY1YWUtMmYwMy00ZTkxLTk2ZWItMjNiOWU4YWM1NThi',
};

class PubSub {
  constructor() {
    this.pubnub = new PubNub(credentials);

    this.pubnub.subscribe({ channels: Object.values(CHANNELS) });

    this.pubnub.addListener(this.listener());
  }

  listener() {
    return {
      message: (messageObject) => {
        const { channel, message } = messageObject;

        console.log(`Msg: ${message}, channel: ${channel}`);
      },
    };
  }

  publish({ channel, message }) {
    this.pubnub.publish({ channel, message });
  }
}

// const testPubSub = new PubSub();
// testPubSub.publish({ channel: CHANNELS.TEST, message: 'fooddd'});

module.exports = PubSub;
