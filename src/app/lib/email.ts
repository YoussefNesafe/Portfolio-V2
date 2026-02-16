import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function sendLowQueueAlert(remainingTitles: string[]) {
  const to = process.env.NOTIFICATION_EMAIL;
  if (!to) {
    console.warn("[Email] NOTIFICATION_EMAIL not set, skipping low queue alert");
    return;
  }

  const resend = getResendClient();
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY not set, skipping low queue alert");
    return;
  }

  const count = remainingTitles.length;
  const titleList = remainingTitles.map((t, i) => `${i + 1}. ${t}`).join("\n");

  await resend.emails.send({
    from: "Blog Queue <onboarding@resend.dev>",
    to,
    subject: `Blog Queue Alert: Only ${count} posts remaining`,
    text: `Your blog post queue is running low.\n\nRemaining titles (${count}):\n${titleList}\n\nAdd more titles at your admin dashboard.`,
  });
}
