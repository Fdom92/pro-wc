import { Component, Event, EventEmitter, Method, Prop, State } from '@stencil/core';

@Component({
  tag: 'pro-payment',
})
export class Payment {

  private request: PaymentRequest;

  @State() enabled = false;

  // Required payment method data
  @Prop() methodData: PaymentMethodData[] = [{
      supportedMethods: ['visa', 'mastercard']
  }];

  // Required information about transaction
  @Prop() details: PaymentDetails;

  // Optional parameter for things like shipping, etc
  @Prop() options: PaymentOptions;

  @Event() paymentSucceeded: EventEmitter<PaymentResponse>;
  @Event() paymentFailed: EventEmitter<Error>;

  componentWillLoad() {
    if (!('PaymentRequest' in window)) {
      console.error('Payment Request API not supported');
      return;
    }
    this.enabled = true;
  }

  @Method()
  show(): Promise<PaymentResponse> {
    if (!this.enabled) {
      return Promise.reject('payment api is not available');
    }
    if (!this.request) {
      return Promise.reject('payment request is still pending');
    }
    const request = this.request = new PaymentRequest(
      this.methodData,
      this.details,
      this.options
    );
    return request.show();
  }

  @Method()
  abort(): Promise<void> {
    if (!this.enabled) {
      return Promise.reject('payment api is not available');
    }
    if (this.request) {
      return this.request.abort();
    }
    return Promise.resolve();
  }

  private onPay() {
    this.show().then(response => {
      this.paymentSucceeded.emit(response);
      response.complete('success');
    }).catch(err => {
      this.paymentFailed.emit(err);
    });
  }

  hostData() {
    return {
      class: {
        'payment-disabled': !this.enabled
      }
    };
  }

  render() {
    return (
      <button type='button' onClick={() => this.onPay()} disabled={!this.enabled}>
        <slot />
      </button>
    );
  }
}
