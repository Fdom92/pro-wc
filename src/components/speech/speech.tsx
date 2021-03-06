import { Component, Element, Prop, State } from '@stencil/core';


@Component({
  tag: 'pro-speech',
  styleUrl: 'speech.scss'
})
export class Speech {

  private input: HTMLInputElement | null;

  @Element() element: any;

  @State() recording = false;
  @State() recognition: any = null;

  @Prop() enabled = true;
  @Prop() lang = 'en-US';
  @Prop() continuous = false;

  componentDidLoad() {
    if ('webkitSpeechRecognition' in window) {
      this.input = this.element.querySelector('input[type=text]');
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = this.continuous;
      this.recognition.interimResults = true;
      this.recognition.lang = this.lang;

      this.recognition.onerror = (err: any) => {
        console.error(err);
        this.recording = false;
      };
      this.recognition.onresult = (event: any) => {
        if (this.input) {
          this.input.value = event.results[0][0].transcript;
        }
      };
    }
  }

  componentDidUnload() {
    this.input = null;
  }

  private onStart() {
    this.recording = true;
    this.recognition.start();
  }

  private onStop() {
    this.recording = false;
    this.recognition.stop();
  }

  hostData() {
    return {
      class: {
        'speech-enabled': this.recognition !== null && this.enabled,
        'speech-recording': this.recording
      }
    };
  }

  render() {
    const dom = [<slot />];
    if (this.recognition) {
      dom.push(
        <button type='button' class='speech-start' onClick={() => this.onStart()}>
        </button>,
        <button type='button' class='speech-stop' onClick={() => this.onStop()}>
        </button>
      );
    }
    return dom;
  }
}
