export interface Faq {
  topic: string
  q: string
  a: string
}

export const HELP_TOPICS = ['Booking', 'Payments', 'Cancellations', 'During your stay', 'Hosting']

export const FAQS: Faq[] = [
  { topic: 'Booking', q: 'How do I book a home?', a: 'Choose your dates and guests on any listing, then press Reserve. You’ll review the price breakdown and confirm. Instant-book homes are confirmed straight away; others confirm within 24 hours.' },
  { topic: 'Booking', q: 'Can I change my dates after booking?', a: 'Yes. Message the concierge from your trip page and we’ll check availability with the host. Any price difference is shown before you accept.' },
  { topic: 'Booking', q: 'Is there a minimum stay?', a: 'Most homes ask for two nights or more, and some ask for a full week in high season. The minimum is shown in the calendar when you pick dates.' },
  { topic: 'Payments', q: 'When am I charged?', a: 'For stays more than 30 days away we take 50% at booking and the rest 14 days before arrival. Closer stays are paid in full when you book.' },
  { topic: 'Payments', q: 'What fees are included?', a: 'The price breakdown shows nightly rate, cleaning, a 12% service fee and local taxes. There are no hidden extras at check-in.' },
  { topic: 'Payments', q: 'Do you offer weekly discounts?', a: 'Stays of seven nights or more get 10% off the nightly rate automatically.' },
  { topic: 'Cancellations', q: 'How do I cancel a trip?', a: 'Open Trips, choose the booking and press Cancel. Your refund depends on the home’s cancellation option, which is shown on the listing and in your confirmation.' },
  { topic: 'Cancellations', q: 'What if something outside my control happens?', a: 'Serious illness, natural disasters and travel restrictions are covered by our extenuating circumstances policy. Contact the concierge and we’ll review it with you.' },
  { topic: 'During your stay', q: 'How do I check in?', a: 'Your host or local concierge shares arrival details 72 hours before check-in, including directions, door codes or a meeting time.' },
  { topic: 'During your stay', q: 'Something isn’t as described. What now?', a: 'Tell us within 24 hours of arrival. We’ll fix it, move you to an equal or better home, or refund the nights affected.' },
  { topic: 'Hosting', q: 'How do I list my home?', a: 'Start at Become a host. We’ll arrange a visit, professional photos and pricing advice before your home goes live.' },
  { topic: 'Hosting', q: 'When do hosts get paid?', a: 'Payouts are sent 24 hours after each guest checks in, by bank transfer.' },
]
