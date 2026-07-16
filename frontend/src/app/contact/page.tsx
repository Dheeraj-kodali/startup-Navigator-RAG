"use client";

import { useState } from "react";
import { Send, CheckCircle, Mail, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      // Mock submit contact form data
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
          Contact Advisor Support
        </h1>
        <p className="text-muted-foreground text-sm">
          Have feedback or need tailored legal registration guides? Drop us a query.
        </p>
      </div>

      <div className="border border-border bg-card rounded-xl p-6 shadow-md">
        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-secondary mb-4 animate-bounce" />
            <h3 className="text-lg font-bold">Query submitted!</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Our support advisors will review your query and reply shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-transparent py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Your Message / Request
              </label>
              <div className="relative">
                <textarea
                  id="message"
                  required
                  rows={4}
                  placeholder="How can we help your startup?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border border-border bg-transparent py-2.5 px-4 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email.trim() || !message.trim()}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
            >
              <span>{isSubmitting ? "Submitting..." : "Send Message"}</span>
              <Send className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
