import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Loader2,
  Lock,
  Receipt,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import TextField from '../ui/TextField';
import { formatCurrency } from '../lib/format';
import { TAX_LABEL, TAX_RATE } from '../lib/constants';

/** "4242424242424242" -> "4242 4242 4242 4242" */
function formatCardNumber(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function validate({ cardNumber, expiry, cvc }) {
  const errors = {};

  const digits = cardNumber.replace(/\s/g, '');
  if (!digits) errors.cardNumber = 'Card number is required';
  else if (digits.length !== 16) errors.cardNumber = 'Enter all 16 digits';

  const [mmRaw, yyRaw] = expiry.split('/');
  const mm = Number(mmRaw);
  const yy = Number(yyRaw);
  if (!expiry) errors.expiry = 'Required';
  else if (!mmRaw || !yyRaw || mmRaw.length !== 2 || yyRaw.length !== 2)
    errors.expiry = 'Use MM/YY';
  else if (!(mm >= 1 && mm <= 12)) errors.expiry = 'Invalid month';
  else {
    const now = new Date();
    const currentYY = now.getFullYear() % 100;
    const currentMM = now.getMonth() + 1;
    if (yy < currentYY || (yy === currentYY && mm < currentMM))
      errors.expiry = 'Card expired';
  }

  if (!cvc) errors.cvc = 'Required';
  else if (!/^\d{3,4}$/.test(cvc)) errors.cvc = '3–4 digits';

  return errors;
}

function CheckoutModal({ isOpen, onClose, total, itemCount = 0, items = [], onPaymentSuccess }) {
  const [step, setStep] = useState('input'); // input | processing | success | receipt
  const [form, setForm] = useState({
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/28',
    cvc: '123',
  });
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState('');
  const [txn, setTxn] = useState(null);
  const [receiptItems, setReceiptItems] = useState([]);

  const subtotal = useMemo(() => total / (1 + TAX_RATE), [total]);
  const tax = total - subtotal;

  const update = (field) => (e) => {
    const raw = e.target.value;
    const value =
      field === 'cardNumber'
        ? formatCardNumber(raw)
        : field === 'expiry'
          ? formatExpiry(raw)
          : raw.replace(/\D/g, '').slice(0, 4);
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const reset = () => {
    setStep('input');
    setErrors({});
    setFailure('');
    setTxn(null);
    setReceiptItems([]);
  };

  const closeAndReset = () => {
    reset();
    onClose();
  };

  const handlePay = async () => {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setFailure('');
    setStep('processing');
    setReceiptItems(items);

    // Simulated gateway latency, then the order is actually submitted. The
    // previous version showed "Payment Successful" before even attempting it.
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const placed = await onPaymentSuccess?.();
    if (placed === false) {
      setFailure('The payment went through but the order could not be sent. Please retry.');
      setStep('input');
      return;
    }

    // Computed once here rather than inside render, where it changed on every pass.
    setTxn({
      id: `TRX-${Math.floor(Math.random() * 900000 + 100000)}`,
      at: new Date(),
    });
    setStep('success');
  };

  const title =
    step === 'receipt' ? 'Receipt' : step === 'success' ? 'Payment complete' : 'Checkout';

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAndReset}
      title={title}
      icon={step === 'receipt' ? Receipt : CreditCard}
      dismissable={step !== 'processing'}
    >
      {step === 'input' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-center mb-7">
            <p className="text-muted text-sm mb-1">Amount due</p>
            <p className="text-3xl sm:text-4xl font-bold text-text tabular-nums">
              {formatCurrency(total)}
            </p>
            {itemCount > 0 && (
              <p className="text-sm text-subtle mt-1">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>

          {failure && (
            <div
              role="alert"
              className="bg-danger-soft border border-danger/40 text-danger px-4 py-3 rounded-xl text-sm font-medium mb-5"
            >
              {failure}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <TextField
              label="Card number"
              icon={CreditCard}
              value={form.cardNumber}
              onChange={update('cardNumber')}
              placeholder="4242 4242 4242 4242"
              inputMode="numeric"
              autoComplete="cc-number"
              error={errors.cardNumber}
              className="[&_input]:font-mono [&_input]:tracking-wider"
            />
            <div className="flex gap-3">
              <TextField
                label="Expiry"
                value={form.expiry}
                onChange={update('expiry')}
                placeholder="MM/YY"
                inputMode="numeric"
                autoComplete="cc-exp"
                error={errors.expiry}
                className="flex-1 [&_input]:font-mono"
              />
              <TextField
                label="CVC"
                value={form.cvc}
                onChange={update('cvc')}
                placeholder="123"
                inputMode="numeric"
                autoComplete="cc-csc"
                error={errors.cvc}
                className="flex-1 [&_input]:font-mono"
              />
            </div>
          </div>

          <Button size="lg" fullWidth onClick={handlePay} icon={Lock}>
            Pay {formatCurrency(total)}
          </Button>
          <p className="text-center text-xs text-subtle mt-4">
            Demo checkout — no card is charged and no card data leaves this device.
          </p>
        </motion.div>
      )}

      {step === 'processing' && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center justify-center py-14"
        >
          <Loader2 size={44} className="text-brand animate-spin mb-5" aria-hidden="true" />
          <p className="text-lg font-bold text-text mb-1">Processing payment…</p>
          <p className="text-muted text-sm">Sending the order to the kitchen</p>
        </div>
      )}

      {step === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-6"
          role="status"
          aria-live="polite"
        >
          <div className="w-20 h-20 bg-success-soft rounded-full flex items-center justify-center mb-5">
            <CheckCircle size={40} className="text-success" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-text mb-1">Payment successful</h3>
          <p className="text-muted text-sm mb-1">
            {formatCurrency(total)} received
          </p>
          <p className="text-subtle text-xs mb-7 font-mono">#{txn?.id}</p>

          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              size="lg"
              icon={Receipt}
              className="flex-1"
              onClick={() => setStep('receipt')}
            >
              Receipt
            </Button>
            <Button variant="success" size="lg" className="flex-1" onClick={closeAndReset}>
              Done
            </Button>
          </div>
        </motion.div>
      )}

      {step === 'receipt' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-surface border border-border rounded-2xl p-5 font-mono text-sm">
            <div className="text-center border-b border-dashed border-border pb-3 mb-3">
              <p className="font-bold text-text">RESTAURANT MANAGER</p>
              <p className="text-xs text-muted mt-0.5">Downtown Main</p>
            </div>

            <dl className="text-xs text-muted space-y-1 mb-3">
              <div className="flex justify-between">
                <dt>Transaction</dt>
                <dd className="text-text">#{txn?.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Date</dt>
                <dd className="text-text">{txn?.at?.toLocaleString()}</dd>
              </div>
            </dl>

            {receiptItems.length > 0 && (
              <ul className="border-t border-dashed border-border pt-3 mb-3 space-y-1">
                {receiptItems.map((item) => (
                  <li key={item.id} className="flex justify-between gap-2 text-xs">
                    <span className="text-text truncate">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="text-muted tabular-nums shrink-0">
                      {formatCurrency(Number(item.price) * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <dl className="border-t border-dashed border-border pt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="text-text tabular-nums">{formatCurrency(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">{TAX_LABEL}</dt>
                <dd className="text-text tabular-nums">{formatCurrency(tax)}</dd>
              </div>
              <div className="flex justify-between font-bold text-sm pt-2 mt-1 border-t border-dashed border-border">
                <dt className="text-text">TOTAL</dt>
                <dd className="text-text tabular-nums">{formatCurrency(total)}</dd>
              </div>
            </dl>

            <p className="text-center text-xs text-muted mt-4 pt-3 border-t border-dashed border-border">
              Thank you — please visit again
            </p>
          </div>

          <div className="flex gap-3 mt-5">
            <Button
              variant="secondary"
              size="lg"
              icon={ArrowLeft}
              className="flex-1"
              onClick={() => setStep('success')}
            >
              Back
            </Button>
            <Button size="lg" className="flex-1" onClick={() => window.print()}>
              Print
            </Button>
          </div>
        </motion.div>
      )}
    </Modal>
  );
}

export default CheckoutModal;
