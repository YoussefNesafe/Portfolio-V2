export function printConsoleMessage() {
  const styles = {
    header: "color: #06B6D4; font-size: 14px; font-weight: bold;",
    warning: "color: #A855F7; font-size: 18px; font-weight: bold;",
    text: "color: #10B981; font-size: 12px;",
    link: "color: #06B6D4; font-size: 12px; text-decoration: underline;",
  };

  console.log("%c🔍 SECURITY SCAN INITIATED...", styles.header);
  console.log("%c██████████████████ 100%", styles.header);
  console.log("%c⚠️  HACK DETECTED!", styles.warning);
  console.log("");
  console.log("%cJust kidding 😄 — welcome, fellow developer!", styles.text);
  console.log("");
  console.log(
    "%cBuilt with Next.js, React, TypeScript & curiosity.",
    styles.text,
  );
  console.log(
    "%cLet's connect → linkedin.com/in/youssef-nesafe",
    styles.link,
  );
}
