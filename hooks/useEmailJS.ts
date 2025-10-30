"use client";

import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG, type EmailTemplateParams } from '@/lib/emailjs-config';

export function useEmailJS() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Inicializar EmailJS con la public key
  const initEmailJS = () => {
    emailjs.init(EMAILJS_CONFIG.publicKey);
  };

  const sendQuoteEmail = async (
    templateParams: EmailTemplateParams
  ): Promise<boolean> => {
    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      // Inicializar EmailJS
      initEmailJS();

      // Enviar email usando el template
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams as Record<string, unknown>,
        EMAILJS_CONFIG.publicKey
      );

      if (response.status === 200) {
        setSuccess(true);
        return true;
      } else {
        throw new Error('Error al enviar el email');
      }
    } catch (err) {
      console.error('Error sending email:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al enviar el email');
      return false;
    } finally {
      setSending(false);
    }
  };

  const resetStatus = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    sending,
    error,
    success,
    sendQuoteEmail,
    resetStatus,
  };
}
