declare module '@cashfreepayments/cashfree-js' {
  interface CashfreeConfig {
    mode: 'sandbox' | 'production';
  }

  interface CheckoutOptions {
    paymentSessionId: string;
    redirectTarget?: '_self' | '_blank' | '_top' | '_parent';
    returnUrl?: string;
  }

  interface CheckoutResult {
    error?: {
      message: string;
      code?: string;
    };
    paymentDetails?: {
      paymentMessage?: string;
    };
  }

  interface CashfreeInstance {
    checkout(options: CheckoutOptions): Promise<CheckoutResult | void>;
  }

  export function load(config: CashfreeConfig): Promise<CashfreeInstance>;
}
